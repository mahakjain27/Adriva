from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.ids import new_id


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Company(Base):
    """Mirrors frontend/src/features/companies/types.ts's `Company` exactly —
    every field the admin UI reads/writes has a matching column here. Nested
    shapes (brand_colors, social_links, brand/style/typography — the Theme
    Builder's configuration) are stored as JSON rather than exploded into
    columns, per the instruction not to create a column per typography
    slider; the frontend already treats these as opaque JSON-shaped objects."""

    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("company"))
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    logo_path: Mapped[str] = mapped_column(String, default="")
    website: Mapped[str] = mapped_column(String, default="")
    about: Mapped[str] = mapped_column(String, default="")
    address: Mapped[str] = mapped_column(String, default="")

    # { primary, secondary, accent } — decorative Overview-tab swatches, always populated.
    brand_colors: Mapped[dict] = mapped_column(JSON, default=dict)
    # { linkedin?, instagram?, facebook?, twitter?, youtube? }
    social_links: Mapped[dict] = mapped_column(JSON, default=dict)

    default_theme: Mapped[str] = mapped_column(String, default="luxury")
    branding_mode: Mapped[str] = mapped_column(String, default="powered")

    # Theme Builder configuration — each null until a company is explicitly customized,
    # exactly matching Company["brand" | "style" | "typography"] | null on the frontend.
    brand: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    style: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    typography: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # "minimal" | "standard" | "expressive" | null — a plain enum string, not JSON-worthy.
    motion: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    employees: Mapped[list["Employee"]] = relationship(back_populates="company", cascade="all, delete-orphan")  # noqa: F821
    products: Mapped[list["Product"]] = relationship(back_populates="company", cascade="all, delete-orphan")  # noqa: F821
