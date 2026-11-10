const addDialog = document.querySelector("#add-song-dialog");
const detailDialog = document.querySelector("#song-detail-dialog");
const songGrid = document.querySelector("#song-grid");
const draftGrid = document.querySelector("#draft-grid");
const addSongForm = document.querySelector("#add-song-form");
const addSongButtonLabel = document.querySelector("#open-add-dialog span");
const moveSongButton = document.querySelector("#move-song-button");
const editSongForm = document.querySelector("#edit-song-form");
const editSongButton = document.querySelector("#edit-song-button");
const saveSongButton = document.querySelector("#save-song-button");
const editTitle = document.querySelector("#edit-title");
const editContent = document.querySelector("#edit-content");
const decreaseTransposeButton = document.querySelector("#decrease-transpose");
const increaseTransposeButton = document.querySelector("#increase-transpose");
const detailTranspose = document.querySelector("#detail-transpose");
const detailTitle = document.querySelector("#detail-title");
const detailContent = document.querySelector("#detail-content");
let activeSection = "songs";
let selectedCard = null;
let pendingTranspose = 0;
let editingSong = false;

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Cererea a eșuat (${response.status}).`);
  }

  return response.status === 204 ? null : response.json();
}

function formatTranspose(value) {
  return value > 0 ? `+${value}` : String(value);
}

function updateTransposeEditor() {
  detailTranspose.textContent = formatTranspose(pendingTranspose);
  decreaseTransposeButton.disabled = pendingTranspose <= -12;
  increaseTransposeButton.disabled = pendingTranspose >= 12;
}

function setSongEditing(isEditing) {
  editingSong = isEditing;
  detailTitle.hidden = isEditing;
  detailContent.hidden = isEditing;
  editTitle.hidden = !isEditing;
  editContent.hidden = !isEditing;
  decreaseTransposeButton.hidden = !isEditing;
  increaseTransposeButton.hidden = !isEditing;
  editSongButton.hidden = isEditing;
  saveSongButton.hidden = !isEditing;
  moveSongButton.hidden = isEditing;
  updateTransposeEditor();
}

function makeSongCard(song) {
  const item = document.createElement("li");
  const card = document.createElement("button");
  const isDraft = song.status === "draft";
  const transpose = Number(song.transposeOffset ?? 0);
  const category = isDraft ? "În lucru" : "Necategorizată";
  const lastSung = isDraft ? "Schiță" : "Niciodată";
  const description = isDraft ? "Text în pregătire" : "Nu a fost cântată încă";

  card.type = "button";
  card.className = "song-card";
  card.dataset.songId = song.id;
  card.dataset.status = song.status;
  card.dataset.transpose = String(transpose);
  card.dataset.category = category;
  card.dataset.lastSung = lastSung;
  card.dataset.content = song.content;
  card.innerHTML = `
    <h2></h2>
    <svg class="card-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    <p class="last-sung"></p>
    <span class="card-footer">
      <span class="category-pill"></span>
      <span class="transpose-pill"></span>
    </span>`;

  card.querySelector("h2").textContent = song.title;
  card.querySelector(".last-sung").textContent = description;
  card.querySelector(".category-pill").textContent = category;
  card.querySelector(".transpose-pill").textContent = formatTranspose(transpose);
  item.append(card);
  return item;
}

async function loadSongs() {
  songGrid.replaceChildren();
  draftGrid.replaceChildren();

  try {
    const songs = await api("/songs");

    for (const song of songs) {
      const targetGrid = song.status === "ready" ? songGrid : draftGrid;
      targetGrid.append(makeSongCard(song));
    }

    updateCounts();
  } catch (error) {
    const message = document.createElement("li");
    message.textContent = error.message;
    updateCounts();
    songGrid.append(message);
  }
}

document.querySelector("#open-add-dialog").addEventListener("click", () => {
  addDialog.showModal();
  addSongForm.elements.title.focus();
});

document.querySelector("[data-close-add]").addEventListener("click", () => addDialog.close());
document.querySelector("[data-close-detail]").addEventListener("click", () => detailDialog.close());

function updateCounts() {
  document.querySelector('[data-count="songs"]').textContent = songGrid.children.length;
  document.querySelector('[data-count="drafts"]').textContent = draftGrid.children.length;
}

function showSection(section) {
  activeSection = section;
  songGrid.hidden = section !== "songs";
  draftGrid.hidden = section !== "drafts";
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === section);
  });
  addSongButtonLabel.textContent = section === "drafts" ? "Adaugă schiță" : "Adaugă cântare";
}

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

function openSong(card) {
  selectedCard = card;
  const isDraft = card.closest("#draft-grid") !== null;
  const transpose = Number(card.dataset.transpose);
  pendingTranspose = transpose;
  detailTitle.textContent = card.querySelector("h2").textContent;
  editTitle.value = detailTitle.textContent;
  document.querySelector("#detail-category").textContent = card.dataset.category;
  document.querySelector("#detail-last-sung").textContent = card.dataset.lastSung;
  detailContent.textContent = card.dataset.content;
  editContent.value = card.dataset.content;
  moveSongButton.textContent = isDraft ? "Mută la Cântări" : "Mută la Schițe";
  setSongEditing(false);
  detailDialog.showModal();
}

for (const grid of [songGrid, draftGrid]) {
  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".song-card");
    if (card) openSong(card);
  });
}

decreaseTransposeButton.addEventListener("click", () => {
  pendingTranspose = Math.max(-12, pendingTranspose - 1);
  updateTransposeEditor();
});

increaseTransposeButton.addEventListener("click", () => {
  pendingTranspose = Math.min(12, pendingTranspose + 1);
  updateTransposeEditor();
});

editSongButton.addEventListener("click", () => {
  if (!selectedCard) {
    return;
  }

  setSongEditing(true);
  editTitle.focus();
});

editSongForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedCard || !editingSong) {
    return;
  }

  const title = editTitle.value.trim();
  const content = editContent.value.trim();

  if (!title || !content) {
    window.alert("Titlul și textul nu pot fi goale.");
    return;
  }

  const changes = {};
  const currentTitle = selectedCard.querySelector("h2").textContent;
  const currentContent = selectedCard.dataset.content;
  const currentTranspose = Number(selectedCard.dataset.transpose);

  if (title !== currentTitle) {
    changes.title = title;
  }

  if (content !== currentContent) {
    changes.content = content;
  }

  if (pendingTranspose !== currentTranspose) {
    changes.transposeOffset = pendingTranspose;
  }

  if (Object.keys(changes).length === 0) {
    setSongEditing(false);
    return;
  }

  saveSongButton.disabled = true;

  try {
    const updatedSong = await api(`/songs/${selectedCard.dataset.songId}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });

    const savedTranspose = Number(updatedSong.transposeOffset);
    pendingTranspose = savedTranspose;
    selectedCard.querySelector("h2").textContent = updatedSong.title;
    selectedCard.dataset.content = updatedSong.content;
    selectedCard.dataset.transpose = String(savedTranspose);
    selectedCard.querySelector(".transpose-pill").textContent = formatTranspose(savedTranspose);
    detailTitle.textContent = updatedSong.title;
    detailContent.textContent = updatedSong.content;
    editTitle.value = updatedSong.title;
    editContent.value = updatedSong.content;
    setSongEditing(false);
  } catch (error) {
    window.alert(error.message);
  } finally {
    saveSongButton.disabled = false;
  }
});

moveSongButton.addEventListener("click", async () => {
  if (!selectedCard) {
    return;
  }

  const songId = selectedCard.dataset.songId;
  const currentStatus = selectedCard.dataset.status;
  const newStatus =
    currentStatus === "draft" ? "ready" : "draft";

  try {
    await api(`/songs/${songId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    detailDialog.close();
    await loadSongs();
  } catch (error) {
    window.alert(error.message);
  }
});


addSongForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(addSongForm);
  const creatingDraft = activeSection === "drafts";

  try {
    await api("/songs", {
      method: "POST",
      body: JSON.stringify({
        title: data.get("title"),
        content: data.get("content"),
        transposeOffset: Number(data.get("transposeOffset")),
        status: creatingDraft ? "draft" : "ready",
      }),
    });

    addSongForm.reset();
    addSongForm.elements.transposeOffset.value = "0";
    addDialog.close();
    await loadSongs();
  } catch (error) {
    window.alert(error.message);
  }
});

for (const dialog of [addDialog, detailDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

loadSongs();
