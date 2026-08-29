from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.employee import Employee as EmployeeORM
from app.schemas.public_profile import PublicProfileResponse
from app.services.profile_service import ProfileNotFoundError, get_public_profile
from app.services.vcard_service import build_vcard

router = APIRouter(prefix="/api/public/profiles", tags=["public-profiles"])

# Deliberately its own router with no prefix, at the short path /c/{id} —
# this is the URL that gets encoded onto physical media (NFC chips, printed
# QR codes) which can't be updated once distributed. Company slugs aren't
# stable (companies.py's update_company recomputes the slug from the name on
# every save), so a card must never encode a slug directly. It encodes the
# employee's permanent id instead, and this redirects to wherever that
# employee's slug pair currently resolves — a company rename updates the
# redirect target instead of breaking every card already in someone's wallet.
card_router = APIRouter(tags=["public-profiles"])


@router.get("/{company_slug}/{employee_slug}", response_model=PublicProfileResponse)
def get_profile(company_slug: str, employee_slug: str, db: Session = Depends(get_db)):
    try:
        data = get_public_profile(db, company_slug, employee_slug)
    except ProfileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return data


@router.get("/{company_slug}/{employee_slug}/vcard")
def get_vcard(company_slug: str, employee_slug: str, db: Session = Depends(get_db)):
    try:
        data = get_public_profile(db, company_slug, employee_slug)
    except ProfileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    vcard = build_vcard(data["employee"], data["company"])
    return Response(
        content=vcard,
        media_type="text/vcard",
        headers={"Content-Disposition": f'attachment; filename="{employee_slug}.vcf"'},
    )


@card_router.get("/c/{employee_id}")
def redirect_to_profile(employee_id: str, db: Session = Depends(get_db)):
    employee = db.get(EmployeeORM, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Card not found")
    settings = get_settings()
    target = f"{settings.public_profile_base_url}/{employee.company.slug}/{employee.slug}"
    return RedirectResponse(target, status_code=302)
