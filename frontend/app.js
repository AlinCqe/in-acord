const form = document.querySelector("#song-form");
const formMessage = document.querySelector("#form-message");
const songList = document.querySelector("#song-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const detail = document.querySelector("#song-detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailContent = document.querySelector("#detail-content");

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail =
      typeof error.detail === "string"
        ? error.detail
        : error.detail
          ? JSON.stringify(error.detail)
          : `Cererea a eșuat (${response.status}).`;
    throw new Error(detail);
  }

  return response.status === 204 ? null : response.json();
}

function makeSongListItem(song) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const title = document.createElement("strong");
  const meta = document.createElement("span");

  button.type = "button";
  button.className = "song-button";
  title.textContent = song.title;
  meta.textContent = `${song.baseKey} · ${song.transposeOffset >= 0 ? "+" : ""}${song.transposeOffset}`;
  button.append(title, meta);
  button.addEventListener("click", () => openSong(song.id));
  item.append(button);
  return item;
}

async function loadSongs() {
  try {
    const query = searchInput.value.trim();
    const songs = await api(`/songs${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    songList.replaceChildren(...songs.map(makeSongListItem));
    emptyState.hidden = songs.length > 0;
  } catch (error) {
    emptyState.hidden = false;
    emptyState.textContent = error.message;
  }
}

async function openSong(id) {
  try {
    const song = await api(`/songs/${id}`);
    detailTitle.textContent = song.title;
    detailMeta.textContent = `${song.baseKey} · ${song.transposeOffset >= 0 ? "+" : ""}${song.transposeOffset}`;
    detailContent.textContent = song.content;
    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "Se salvează…";
  const data = new FormData(form);

  try {
    await api("/songs", {
      method: "POST",
      body: JSON.stringify({
        title: data.get("title"),
        content: data.get("content"),
        baseKey: data.get("baseKey"),
        transposeOffset: Number(data.get("transposeOffset")),
      }),
    });
    form.reset();
    form.elements.baseKey.value = "C";
    form.elements.transposeOffset.value = "0";
    formMessage.textContent = "Cântarea a fost salvată.";
    await loadSongs();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

document.querySelector("#refresh-button").addEventListener("click", loadSongs);
document.querySelector("#close-detail").addEventListener("click", () => {
  detail.hidden = true;
});

let searchTimer;
searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(loadSongs, 200);
});

loadSongs();

