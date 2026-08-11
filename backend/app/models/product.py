from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.ids import new_id


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Product(Base):
    """Mirrors frontend/src/features/products/types.ts's `Product` — note
    `image_paths` is a JSON array (multi-image, first = cover), not a single
    image column; the frontend moved off single-image support already."""

    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("product"))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[str] = mapped_column(String, default="")
    image_paths: Mapped[list] = mapped_column(JSON, default=list)
    category: Mapped[str] = mapped_column(String, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    company: Mapped["Company"] = relationship(back_populates="products")  # noqa: F821
