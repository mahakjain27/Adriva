from typing import Any

from app.schemas.common import CamelModel
from app.schemas.company import CompanyBrandColors, CompanySocialLinks
from app.schemas.employee import ContactEntry, CustomButton, EmployeeSocialLinks, WorkingHoursEntry


class PublicCompany(CamelModel):
    """Company, minus admin-only metadata (no raw brand_colors swatches beyond
    what's needed, no created_at/updated_at) — everything toProfileData.ts's
    employeeToProfileData() actually reads, and nothing more."""

    id: str
    slug: str
    name: str
    logo_path: str
    website: str
    about: str
    address: str
    social_links: CompanySocialLinks
    brand_colors: CompanyBrandColors
    default_theme: str
    branding_mode: str
    brand: dict[str, Any] | None = None
    style: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    motion: str | None = None


class PublicEmployee(CamelModel):
    id: str
    slug: str
    photo_path: str
    name: str
    designation: str
    phones: list[ContactEntry]
    whatsapp: str
    emails: list[ContactEntry]
    websites: list[ContactEntry]
    social: EmployeeSocialLinks
    address: str
    maps_url: str
    working_hours: list[WorkingHoursEntry]
    custom_buttons: list[CustomButton]
    theme: str
    nfc_card: dict[str, Any] | None = None


class PublicProduct(CamelModel):
    id: str
    name: str
    price: str
    image_paths: list[str]
    category: str
    sort_order: int


class PublicProfileResponse(CamelModel):
    """Deliberately raw (company/employee/products), not a pre-derived
    ProfileData/ProfileBranding — the frontend's existing
    employeeToProfileData() + deriveProfileBranding() already do that
    derivation client-side and stay the single source of truth for it, so
    the backend isn't a second place the Theme Builder's palette/style math
    has to be kept in sync. See toProfileData.ts."""

    company: PublicCompany
    employee: PublicEmployee
    products: list[PublicProduct]
