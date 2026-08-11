"""Development seed data: 1 company, 2 employees, 3 products, one customized
theme configuration. Realistic but clearly fake — no external image URLs
(there are no local image assets in this repo yet, so paths are left blank,
matching how the frontend's own mock data already represents "no photo
uploaded yet"). Safe to re-run: clears and reseeds rather than duplicating.

Run with:  python -m app.seed
"""

from app.core.database import Base, SessionLocal, engine
from app.models.company import Company
from app.models.employee import Employee
from app.models.product import Product
from app.utils.ids import new_id
from app.utils.slugs import unique_slug


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(Product).delete()
        db.query(Employee).delete()
        db.query(Company).delete()
        db.commit()

        company = Company(
            id=new_id("company"),
            name="Aadrik Distributors Pvt. Ltd.",
            logo_path="",
            website="https://aadrik.example.com",
            about=(
                "Aadrik Distributors Pvt. Ltd. is a trusted partner for industrial materials "
                "and supplies — delivering reliable quality, transparent pricing, and "
                "dependable service to businesses across the region."
            ),
            address="142 Spring St, New York, NY",
            brand_colors={"primary": "#8b5cf6", "secondary": "#16171d", "accent": "#f3f4f6"},
            social_links={"linkedin": "https://linkedin.com/company/aadrik"},
            default_theme="luxury",
            branding_mode="powered",
            # A customized theme configuration, so the seed also exercises
            # Theme Builder persistence out of the box, not just stock defaults.
            brand={"color": "#8b5cf6", "ombre": "soft", "secondColor": None},
            style={"glass": "premium", "buttons": "gradient", "corners": "rounded"},
            typography=None,
            motion="standard",
        )
        company.slug = unique_slug(db, Company, company.name)
        db.add(company)
        db.flush()

        employees = [
            Employee(
                id=new_id("employee"),
                company_id=company.id,
                photo_path="",
                name="Aditya Kothari",
                designation="Business Development Manager",
                phones=[{"id": "contact-phone-1", "label": "", "value": "+15550100001"}],
                whatsapp="+15550100001",
                emails=[{"id": "contact-email-1", "label": "", "value": "aditya@aadrik.example.com"}],
                websites=[],
                social={"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
                address="",
                maps_url="",
                working_hours=[
                    {"day": "Mon - Fri", "hours": "9:00 AM - 6:00 PM"},
                    {"day": "Sat - Sun", "hours": "Closed"},
                ],
                custom_buttons=[],
                theme="luxury",
                nfc_card=None,
            ),
            Employee(
                id=new_id("employee"),
                company_id=company.id,
                photo_path="",
                name="Priya Nair",
                designation="Head of Operations",
                phones=[{"id": "contact-phone-1", "label": "Work", "value": "+15550100002"}],
                whatsapp="",
                emails=[{"id": "contact-email-1", "label": "", "value": "priya@aadrik.example.com"}],
                websites=[],
                social={"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
                address="",
                maps_url="",
                working_hours=[],
                custom_buttons=[],
                theme="modern",
                nfc_card=None,
            ),
        ]
        for employee in employees:
            employee.slug = unique_slug(
                db, Employee, employee.name, scope_filter=Employee.company_id == company.id
            )
            db.add(employee)

        products = [
            Product(
                id=new_id("product"),
                company_id=company.id,
                name="CO₂ Wire",
                price="Custom quote",
                image_paths=[],
                category="Welding Supplies",
                sort_order=0,
            ),
            Product(
                id=new_id("product"),
                company_id=company.id,
                name="Grinding Discs",
                price="Custom quote",
                image_paths=[],
                category="Abrasives",
                sort_order=1,
            ),
            Product(
                id=new_id("product"),
                company_id=company.id,
                name="Safety Gloves",
                price="From $4.50 / pair",
                image_paths=[],
                category="Safety Equipment",
                sort_order=2,
            ),
        ]
        for product in products:
            db.add(product)

        db.commit()
        print(f"Seeded company {company.slug!r} with {len(employees)} employees and {len(products)} products.")
        for employee in employees:
            print(f"  -> /{company.slug}/{employee.slug}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
