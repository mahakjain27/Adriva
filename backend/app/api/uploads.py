from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.common import CamelModel
from app.services.upload_service import UploadValidationError, save_upload, upload_error_response

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


class UploadResponse(CamelModel):
    path: str
    url: str
    filename: str
    mime_type: str
    size: int


@router.post("", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(..., description="One of: companies, employees, products"),
):
    try:
        result = await save_upload(file, category)
    except UploadValidationError as error:
        raise upload_error_response(error) from error
    return result
