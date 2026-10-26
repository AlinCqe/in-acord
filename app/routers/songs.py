from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Song
from app.schemas import SongCreate, SongRead, SongUpdate


router = APIRouter(prefix="/songs", tags=["songs"])


def get_existing_song(song_id: str, session: Session) -> Song:
    song = session.scalar(
        select(Song).where(Song.id == song_id, Song.deleted_at.is_(None))
    )
    if song is None:
        raise HTTPException(status_code=404, detail="Cântarea nu a fost găsită.")
    return song


@router.post("", response_model=SongRead, status_code=status.HTTP_201_CREATED)
def create_song(payload: SongCreate, session: Session = Depends(get_session)) -> Song:
    song = Song(**payload.model_dump())
    session.add(song)
    session.commit()
    session.refresh(song)
    return song


@router.get("", response_model=list[SongRead])
def list_songs(
    q: str | None = Query(default=None, max_length=200),
    include_archived: bool = False,
    session: Session = Depends(get_session),
) -> list[Song]:
    statement = select(Song).where(Song.deleted_at.is_(None))

    if not include_archived:
        statement = statement.where(Song.archived.is_(False))

    if q and (term := q.strip()):
        pattern = f"%{term}%"
        statement = statement.where(
            or_(
                Song.title.ilike(pattern),
                Song.alternate_title.ilike(pattern),
                Song.content.ilike(pattern),
            )
        )

    statement = statement.order_by(Song.title)
    return list(session.scalars(statement))


@router.get("/{song_id}", response_model=SongRead)
def read_song(song_id: str, session: Session = Depends(get_session)) -> Song:
    return get_existing_song(song_id, session)


@router.patch("/{song_id}", response_model=SongRead)
def update_song(
    song_id: str,
    payload: SongUpdate,
    session: Session = Depends(get_session),
) -> Song:
    song = get_existing_song(song_id, session)
    changes = payload.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(song, field, value)

    if changes:
        song.version += 1
        song.updated_at = datetime.now(timezone.utc)
        session.commit()
        session.refresh(song)

    return song


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_song(
    song_id: str,
    session: Session = Depends(get_session),
) -> Response:
    song = get_existing_song(song_id, session)
    song.deleted_at = datetime.now(timezone.utc)
    song.updated_at = song.deleted_at
    song.version += 1
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

