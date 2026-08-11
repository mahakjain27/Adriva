from app.models.company import Company as CompanyORM
from app.models.employee import Employee as EmployeeORM


def _resolve_address(employee: EmployeeORM, company: CompanyORM) -> str:
    return employee.address or company.address


def _resolve_primary_website(employee: EmployeeORM, company: CompanyORM) -> str:
    """Port of resolveEmployeePrimaryWebsite() in resolveInheritedContact.ts
    — the first custom website entry if any exist, else the company's."""
    custom = next((entry["value"] for entry in employee.websites if entry.get("value")), "")
    return custom or company.website


def build_vcard(employee: EmployeeORM, company: CompanyORM) -> str:
    """Port of buildVCard() in employees/utils/vcard.ts — must stay in sync
    field-for-field with that function; only include fields that actually
    exist, never invent data. VCARD 3.0, CRLF line endings per RFC 2426."""
    address = _resolve_address(employee, company)
    custom_websites = [entry["value"] for entry in employee.websites if entry.get("value")]
    if custom_websites:
        website_lines = [f"URL:{url}" for url in custom_websites]
    else:
        primary = _resolve_primary_website(employee, company)
        website_lines = [f"URL:{primary}"] if primary else []

    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{employee.name};;;;",
        f"FN:{employee.name}",
        f"ORG:{company.name}",
        f"TITLE:{employee.designation}",
        *[f"TEL;TYPE=CELL:{entry['value']}" for entry in employee.phones if entry.get("value")],
        *([f"TEL;TYPE=CELL:{employee.whatsapp}"] if employee.whatsapp else []),
        *[f"EMAIL:{entry['value']}" for entry in employee.emails if entry.get("value")],
        *website_lines,
        *([f"ADR;TYPE=WORK:;;{address};;;;"] if address else []),
        "END:VCARD",
    ]
    return "\r\n".join(lines)
