from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.public_profile import PublicProfileResponse
from app.services.profile_service import ProfileNotFoundError, get_public_profile
from app.services.vcard_service import build_vcard

router = APIRouter(prefix="/api/public/profiles", tags=["public-profiles"])


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
