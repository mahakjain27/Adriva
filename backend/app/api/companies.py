from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.company import Company as CompanyORM
from app.schemas.company import Company, CompanyCreate, CompanyUpdate, CompanyWithRelations
from app.utils.slugs import unique_slug

router = APIRouter(prefix="/api/companies", tags=["companies"])


def _get_company_or_404(db: Session, company_id: str) -> CompanyORM:
    company = db.get(CompanyORM, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.get("", response_model=list[Company])
def list_companies(db: Session = Depends(get_db)):
    return db.query(CompanyORM).order_by(CompanyORM.created_at).all()


@router.post("", response_model=Company, status_code=201)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    company = CompanyORM(**payload.model_dump(exclude={"brand_colors", "social_links"}))
    company.brand_colors = payload.brand_colors.model_dump()
    company.social_links = payload.social_links.model_dump()
    company.slug = unique_slug(db, CompanyORM, payload.name)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyWithRelations)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = (
        db.query(CompanyORM)
        .options(selectinload(CompanyORM.employees), selectinload(CompanyORM.products))
        .filter(CompanyORM.id == company_id)
        .first()
    )
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=Company)
def update_company(company_id: str, payload: CompanyUpdate, db: Session = Depends(get_db)):
    company = _get_company_or_404(db, company_id)
    data = payload.model_dump(exclude={"brand_colors", "social_links"})
    for key, value in data.items():
        setattr(company, key, value)
    company.brand_colors = payload.brand_colors.model_dump()
    company.social_links = payload.social_links.model_dump()
    # Matches companiesService.ts's updateCompany exactly — the slug is
    # recomputed from the (possibly unchanged) name on every save, not just
    # when the name actually changes.
    company.slug = unique_slug(db, CompanyORM, payload.name, exclude_id=company_id)
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: str, db: Session = Depends(get_db)):
    company = _get_company_or_404(db, company_id)
    db.delete(company)
    db.commit()
