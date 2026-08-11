from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.employee import Employee as EmployeeORM
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate
from app.utils.ids import new_id
from app.utils.slugs import unique_slug

router = APIRouter(tags=["employees"])


def _get_employee_or_404(db: Session, employee_id: str) -> EmployeeORM:
    employee = db.get(EmployeeORM, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


def _dump_nested(payload: EmployeeCreate | EmployeeUpdate) -> dict:
    data = payload.model_dump(exclude={"phones", "emails", "websites", "social", "working_hours", "custom_buttons"})
    data["phones"] = [p.model_dump() for p in payload.phones]
    data["emails"] = [e.model_dump() for e in payload.emails]
    data["websites"] = [w.model_dump() for w in payload.websites]
    data["social"] = payload.social.model_dump()
    data["working_hours"] = [w.model_dump() for w in payload.working_hours]
    data["custom_buttons"] = [b.model_dump() for b in payload.custom_buttons]
    return data


@router.get("/api/employees", response_model=list[Employee], tags=["employees"])
def list_employees(db: Session = Depends(get_db)):
    """All employees across every company — powers the cross-company
    Employees Directory and Overview dashboard pages, not just a
    per-company view."""
    return db.query(EmployeeORM).order_by(EmployeeORM.created_at).all()


@router.get("/api/companies/{company_id}/employees", response_model=list[Employee], tags=["employees"])
def list_employees_by_company(company_id: str, db: Session = Depends(get_db)):
    return db.query(EmployeeORM).filter(EmployeeORM.company_id == company_id).order_by(EmployeeORM.created_at).all()


@router.post("/api/companies/{company_id}/employees", response_model=Employee, status_code=201, tags=["employees"])
def create_employee(company_id: str, payload: EmployeeCreate, db: Session = Depends(get_db)):
    if payload.company_id != company_id:
        raise HTTPException(status_code=400, detail="companyId in body must match the URL")
    employee = EmployeeORM(**_dump_nested(payload))
    employee.slug = unique_slug(
        db, EmployeeORM, payload.name, scope_filter=EmployeeORM.company_id == company_id
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/api/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    return _get_employee_or_404(db, employee_id)


@router.put("/api/employees/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = _get_employee_or_404(db, employee_id)
    # Identity assets (slug/URL/QR/vCard) are assigned once at creation and
    # never change on edit — matches employeesService.ts's updateEmployee
    # exactly, so a printed QR code or shared link keeps working forever.
    for key, value in _dump_nested(payload).items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/api/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = _get_employee_or_404(db, employee_id)
    db.delete(employee)
    db.commit()


@router.post("/api/employees/{employee_id}/duplicate", response_model=Employee, status_code=201)
def duplicate_employee(employee_id: str, db: Session = Depends(get_db)):
    source = _get_employee_or_404(db, employee_id)
    copy_name = f"{source.name} (Copy)"
    copy = EmployeeORM(
        id=new_id("employee"),
        company_id=source.company_id,
        photo_path=source.photo_path,
        name=copy_name,
        designation=source.designation,
        phones=source.phones,
        whatsapp=source.whatsapp,
        emails=source.emails,
        websites=source.websites,
        social=source.social,
        address=source.address,
        maps_url=source.maps_url,
        working_hours=source.working_hours,
        custom_buttons=source.custom_buttons,
        theme=source.theme,
        nfc_card=source.nfc_card,
        slug=unique_slug(
            db,
            EmployeeORM,
            f"{source.name}-copy",
            scope_filter=EmployeeORM.company_id == source.company_id,
        ),
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy
