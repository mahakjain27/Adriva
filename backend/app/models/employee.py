from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.ids import new_id


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Employee(Base):
    """Mirrors frontend/src/features/employees/types.ts's `Employee` exactly.
    Repeatable rows (phones/emails/websites/workingHours/customButtons), the
    social-links object, and the NFC card design are all JSON — they're
    already free-form, order-preserving arrays/objects on the frontend, not
    relational data the backend needs to query into. `slug` is unique only
    *within* a company (matches employeesService.ts's existing uniqueSlug
    scoping), not globally — the public URL is always {companySlug}/{slug}."""

    __tablename__ = "employees"
    __table_args__ = (Index("ix_employees_company_slug", "company_id", "slug", unique=True),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("employee"))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String, nullable=False)

    photo_path: Mapped[str] = mapped_column(String, default="")
    name: Mapped[str] = mapped_column(String, nullable=False)
    designation: Mapped[str] = mapped_column(String, default="")

    phones: Mapped[list] = mapped_column(JSON, default=list)  # [{id, label, value}]
    whatsapp: Mapped[str] = mapped_column(String, default="")
    emails: Mapped[list] = mapped_column(JSON, default=list)
    websites: Mapped[list] = mapped_column(JSON, default=list)
    social: Mapped[dict] = mapped_column(JSON, default=dict)  # {linkedin, instagram, facebook, twitter, youtube}

    address: Mapped[str] = mapped_column(String, default="")
    maps_url: Mapped[str] = mapped_column(String, default="")
    working_hours: Mapped[list] = mapped_column(JSON, default=list)  # [{day, hours}]
    custom_buttons: Mapped[list] = mapped_column(JSON, default=list)  # [{id, label, url, icon}]

    theme: Mapped[str] = mapped_column(String, default="luxury")
    nfc_card: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    company: Mapped["Company"] = relationship(back_populates="employees")  # noqa: F821
