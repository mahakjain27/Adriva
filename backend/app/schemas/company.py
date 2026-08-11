from datetime import datetime
from typing import Any

from pydantic import Field, field_validator

from app.schemas.common import CamelModel


class CompanyBrandColors(CamelModel):
    primary: str = "#8b5cf6"
    secondary: str = "#16171d"
    accent: str = "#f3f4f6"


class CompanySocialLinks(CamelModel):
    linkedin: str | None = None
    instagram: str | None = None
    facebook: str | None = None
    twitter: str | None = None
    youtube: str | None = None


class CompanyBase(CamelModel):
    name: str = Field(min_length=1)
    logo_path: str = ""
    website: str = ""
    about: str = ""
    address: str = ""
    brand_colors: CompanyBrandColors = Field(default_factory=CompanyBrandColors)
    social_links: CompanySocialLinks = Field(default_factory=CompanySocialLinks)
    default_theme: str = "luxury"
    branding_mode: str = "powered"
    # Theme Builder configuration (Brand Color/Ombre, Glass/Buttons/Corners,
    # Typography) — kept as opaque JSON rather than fully-typed nested models.
    # These shapes belong to the frontend's Theme Builder (derivePalette.ts /
    # deriveStyleTokens.ts / curatedFonts.ts) and are already validated there;
    # duplicating every field here would just be a second place to keep in
    # sync every time a Theme Builder control changes. The backend only needs
    # to persist them faithfully, not interpret them.
    brand: dict[str, Any] | None = None
    style: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    motion: str | None = None

    @field_validator("website")
    @classmethod
    def validate_website(cls, value: str) -> str:
        if value and not (value.startswith("http://") or value.startswith("https://")):
            raise ValueError("website must be a full URL (http:// or https://)")
        return value


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class Company(CompanyBase):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime


class CompanyWithRelations(Company):
    """Company detail view — includes employees/products/theme in one round trip, per the 'avoid N+1' instruction."""

    employees: list["EmployeeSummary"] = []
    products: list["ProductSummary"] = []


# Deferred import to avoid a circular module dependency (employee.py / product.py
# don't need to import company.py back), resolved via model_rebuild() in main.py.
from app.schemas.employee import EmployeeSummary  # noqa: E402
from app.schemas.product import ProductSummary  # noqa: E402

CompanyWithRelations.model_rebuild()
