def test_health_check(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_list_and_read_song(client):
    payload = {
        "title": "Cântare demonstrativă",
        "content": "[C]Primul vers\n[G]Al doilea vers",
        "baseKey": "C",
        "transposeOffset": 3,
    }

    create_response = client.post("/api/songs", json=payload)
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == payload["title"]
    assert created["transposeOffset"] == 3

    list_response = client.get("/api/songs")
    assert list_response.status_code == 200
    assert [song["id"] for song in list_response.json()] == [created["id"]]

    read_response = client.get(f"/api/songs/{created['id']}")
    assert read_response.status_code == 200
    assert read_response.json()["content"] == payload["content"]


def test_soft_deleted_song_is_no_longer_visible(client):
    create_response = client.post(
        "/api/songs",
        json={
            "title": "De șters",
            "content": "[Am]Text demonstrativ",
            "baseKey": "Am",
            "transposeOffset": -2,
        },
    )
    song_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/songs/{song_id}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/songs/{song_id}").status_code == 404
    assert client.get("/api/songs").json() == []


def test_update_song_increments_version(client):
    created = client.post(
        "/api/songs",
        json={
            "title": "Titlu inițial",
            "content": "[C]Text demonstrativ",
            "baseKey": "C",
            "transposeOffset": 0,
        },
    ).json()

    response = client.patch(
        f"/api/songs/{created['id']}",
        json={"title": "Titlu actualizat", "transposeOffset": 3},
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Titlu actualizat"
    assert updated["transposeOffset"] == 3
    assert updated["version"] == created["version"] + 1


def test_update_rejects_null_for_required_song_fields(client):
    created = client.post(
        "/api/songs",
        json={
            "title": "Titlu",
            "content": "[C]Text demonstrativ",
            "baseKey": "C",
            "transposeOffset": 0,
        },
    ).json()

    response = client.patch(f"/api/songs/{created['id']}", json={"title": None})

    assert response.status_code == 422

