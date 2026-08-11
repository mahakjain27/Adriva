from sqlalchemy.orm import Session

from app.models.company import Company as CompanyORM
from app.models.employee import Employee as EmployeeORM
from app.models.product import Product as ProductORM


class ProfileNotFoundError(Exception):
    pass


def get_public_profile(db: Session, company_slug: str, employee_slug: str) -> dict:
    """slug -> employee -> company -> products, per the required flow. Both
    slugs are needed (not just the employee's) since employee slugs are only
    unique *within* a company — see Employee model's composite index."""
    company = db.query(CompanyORM).filter(CompanyORM.slug == company_slug).first()
    if company is None:
        raise ProfileNotFoundError("Company not found")

    employee = (
        db.query(EmployeeORM)
        .filter(EmployeeORM.company_id == company.id, EmployeeORM.slug == employee_slug)
        .first()
    )
    if employee is None:
        raise ProfileNotFoundError("Employee not found")

    products = (
        db.query(ProductORM)
        .filter(ProductORM.company_id == company.id)
        .order_by(ProductORM.sort_order)
        .all()
    )

    return {"company": company, "employee": employee, "products": products}
