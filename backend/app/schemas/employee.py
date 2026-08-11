from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.common import CamelModel


class ContactEntry(CamelModel):
    id: str
    label: str = ""
    value: str = ""


class EmployeeSocialLinks(CamelModel):
    linkedin: str = ""
    instagram: str = ""
    facebook: str = ""
    twitter: str = ""
    youtube: str = ""


class WorkingHoursEntry(CamelModel):
    day: str
    hours: str


class CustomButton(CamelModel):
    id: str
    label: str = ""
    url: str = ""
    icon: str = ""


class EmployeeBase(CamelModel):
    company_id: str
    photo_path: str = ""
    name: str = Field(min_length=1)
    designation: str = ""
    phones: list[ContactEntry] = []
    whatsapp: str = ""
    emails: list[ContactEntry] = []
    websites: list[ContactEntry] = []
    social: EmployeeSocialLinks = Field(default_factory=EmployeeSocialLinks)
    address: str = ""
    maps_url: str = ""
    working_hours: list[WorkingHoursEntry] = []
    custom_buttons: list[CustomButton] = []
    theme: str = "luxury"
    # NFC Card Designer's front/back layout — free-form element positions the
    # designer already owns and validates (see nfc-card/types.ts); the
    # backend just persists it, same reasoning as Company's brand/style/typography.
    nfc_card: dict[str, Any] | None = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime


class EmployeeSummary(CamelModel):
    """Lightweight shape for embedding inside CompanyWithRelations — avoids shipping every field twice."""

    id: str
    slug: str
    name: str
    designation: str = ""
    photo_path: str = ""
    theme: str = "luxury"
