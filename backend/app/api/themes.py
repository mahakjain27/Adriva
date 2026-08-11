from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company as CompanyORM
from app.models.theme import SavedTheme as SavedThemeORM
from app.schemas.theme import (
    CompanyThemeConfig,
    SavedTheme,
    SavedThemeCreate,
    SavedThemeUpdate,
)
from app.utils.ids import new_id

router = APIRouter(tags=["themes"])


# --- Per-company theme configuration (Theme Builder "Save Theme" for a company) ---


@router.get("/api/companies/{company_id}/theme", response_model=CompanyThemeConfig, tags=["themes"])
def get_company_theme(company_id: str, db: Session = Depends(get_db)):
    company = db.get(CompanyORM, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/api/companies/{company_id}/theme", response_model=CompanyThemeConfig, tags=["themes"])
def update_company_theme(company_id: str, payload: CompanyThemeConfig, db: Session = Depends(get_db)):
    company = db.get(CompanyORM, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    company.default_theme = payload.default_theme
    company.brand = payload.brand
    company.style = payload.style
    company.typography = payload.typography
    company.motion = payload.motion
    db.commit()
    db.refresh(company)
    return company


# --- Theme Library (reusable, company-independent saved themes) ---


def _get_saved_theme_or_404(db: Session, theme_id: str) -> SavedThemeORM:
    theme = db.get(SavedThemeORM, theme_id)
    if theme is None:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme


@router.get("/api/themes", response_model=list[SavedTheme])
def list_themes(db: Session = Depends(get_db)):
    return db.query(SavedThemeORM).order_by(SavedThemeORM.created_at).all()


@router.post("/api/themes", response_model=SavedTheme, status_code=201)
def create_theme(payload: SavedThemeCreate, db: Session = Depends(get_db)):
    theme = SavedThemeORM(**payload.model_dump())
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme


@router.get("/api/themes/{theme_id}", response_model=SavedTheme)
def get_theme(theme_id: str, db: Session = Depends(get_db)):
    return _get_saved_theme_or_404(db, theme_id)


@router.put("/api/themes/{theme_id}", response_model=SavedTheme)
def update_theme(theme_id: str, payload: SavedThemeUpdate, db: Session = Depends(get_db)):
    theme = _get_saved_theme_or_404(db, theme_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(theme, key, value)
    db.commit()
    db.refresh(theme)
    return theme


@router.delete("/api/themes/{theme_id}", status_code=204)
def delete_theme(theme_id: str, db: Session = Depends(get_db)):
    theme = _get_saved_theme_or_404(db, theme_id)
    db.delete(theme)
    db.commit()


@router.post("/api/themes/{theme_id}/duplicate", response_model=SavedTheme, status_code=201)
def duplicate_theme(theme_id: str, db: Session = Depends(get_db)):
    source = _get_saved_theme_or_404(db, theme_id)
    copy = SavedThemeORM(
        id=new_id("theme"),
        name=f"{source.name} (Copy)",
        base_theme=source.base_theme,
        brand=source.brand,
        style=source.style,
        typography=source.typography,
        motion=source.motion,
        favorite=False,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy
