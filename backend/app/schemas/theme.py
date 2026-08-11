from datetime import datetime
from typing import Any

from app.schemas.common import CamelModel


class SavedThemeBase(CamelModel):
    name: str
    base_theme: str
    brand: dict[str, Any] | None = None
    style: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    motion: str | None = None


class SavedThemeCreate(SavedThemeBase):
    pass


class SavedThemeUpdate(CamelModel):
    """All optional — SavedThemeCard's rename/favorite actions only send the one changed field."""

    name: str | None = None
    base_theme: str | None = None
    brand: dict[str, Any] | None = None
    style: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    motion: str | None = None
    favorite: bool | None = None


class SavedTheme(SavedThemeBase):
    id: str
    favorite: bool
    created_at: datetime
    updated_at: datetime


class CompanyThemeConfig(CamelModel):
    """The shape GET/PUT /api/companies/{id}/theme reads and writes — exactly
    the subset of Company that the Theme Builder cares about."""

    default_theme: str
    brand: dict[str, Any] | None = None
    style: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    motion: str | None = None
