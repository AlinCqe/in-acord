import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


KEY_PATTERN = re.compile(r"^[A-G](?:#|b)?m?$")


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(word.capitalize() for word in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class SongFields(ApiModel):
    title: str = Field(min_length=1, max_length=200)
    alternate_title: str | None = Field(default=None, max_length=200)
    content: str = Field(min_length=1)
    base_key: str = Field(min_length=1, max_length=8)
    transpose_offset: int = Field(default=0, ge=-12, le=12)
    author: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=200)
    book_number: str | None = Field(default=None, max_length=50)
    notes: str = ""
    favorite: bool = False
    archived: bool = False

    @field_validator("title", "content")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Câmpul nu poate fi gol.")
        return cleaned

    @field_validator("base_key")
    @classmethod
    def validate_base_key(cls, value: str) -> str:
        cleaned = value.strip()
        if not KEY_PATTERN.fullmatch(cleaned):
            raise ValueError("Folosește o tonalitate precum C, F#, Bb sau Em.")
        return cleaned


class SongCreate(SongFields):
    pass


class SongUpdate(ApiModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    alternate_title: str | None = Field(default=None, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    base_key: str | None = Field(default=None, min_length=1, max_length=8)
    transpose_offset: int | None = Field(default=None, ge=-12, le=12)
    author: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=200)
    book_number: str | None = Field(default=None, max_length=50)
    notes: str | None = None
    favorite: bool | None = None
    archived: bool | None = None

    @model_validator(mode="after")
    def required_fields_may_not_be_null(self):
        required_fields = {
            "title",
            "content",
            "base_key",
            "transpose_offset",
            "favorite",
            "archived",
        }
        invalid_fields = [
            field
            for field in required_fields & self.model_fields_set
            if getattr(self, field) is None
        ]
        if invalid_fields:
            raise ValueError(
                f"Câmpurile obligatorii nu pot fi null: {', '.join(sorted(invalid_fields))}."
            )
        return self

    @field_validator("title", "content")
    @classmethod
    def optional_text_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Câmpul nu poate fi gol.")
        return cleaned

    @field_validator("base_key")
    @classmethod
    def validate_optional_base_key(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not KEY_PATTERN.fullmatch(cleaned):
            raise ValueError("Folosește o tonalitate precum C, F#, Bb sau Em.")
        return cleaned


class SongRead(SongFields):
    id: str
    version: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

