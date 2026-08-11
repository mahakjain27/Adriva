from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.utils.ids import new_id


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SavedTheme(Base):
    """Mirrors frontend/src/features/theme-library/types.ts's `SavedTheme` —
    a reusable Theme Builder configuration independent of any one Company.
    Reuses the exact same brand/style/typography/motion JSON shapes as
    Company, since it's the same configuration, just not yet attached to a
    company (see deriveProfileBranding.ts, shared by both)."""

    __tablename__ = "saved_themes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("theme"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    base_theme: Mapped[str] = mapped_column(String, nullable=False)

    brand: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    style: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    typography: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    motion: Mapped[str | None] = mapped_column(String, nullable=True)

    favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
