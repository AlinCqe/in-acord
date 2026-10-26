# În Acord

Aplicație local-first pentru organizarea cântărilor, acordurilor, programelor și istoricului.

## Arhitectură

```text
HTML/CSS/JavaScript
        │ fetch JSON
        ▼
FastAPI REST API
        │ SQLAlchemy
        ▼
SQLite local
```

Frontendul nu accesează direct baza de date. El comunică numai cu endpointurile `/api/...`.

## Pornire locală

Este necesar Python 3.12 sau mai nou.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload
```

Aplicația va fi disponibilă la <http://127.0.0.1:8000>, iar documentația automată a API-ului la <http://127.0.0.1:8000/docs>.

## Primele endpointuri

- `GET /api/health`
- `POST /api/songs`
- `GET /api/songs?q=...`
- `GET /api/songs/{id}`
- `PATCH /api/songs/{id}`
- `DELETE /api/songs/{id}`

Ștergerea este logică: înregistrarea primește `deletedAt`, pentru a putea fi sincronizată ulterior fără pierderi.

