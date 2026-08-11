import io
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.core.config import get_settings

ALLOWED_CATEGORIES = {"companies", "employees", "products"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB — matches frontend/src/lib/imageUpload.ts's MAX_IMAGE_BYTES exactly

# Pillow's own format name -> the extension/MIME we report. Deliberately a
# closed set (not "whatever Pillow can open") — matches
# ACCEPTED_IMAGE_TYPES in imageUpload.ts (JPG/PNG/WEBP only).
ALLOWED_FORMATS = {
    "JPEG": (".jpg", "image/jpeg"),
    "PNG": (".png", "image/png"),
    "WEBP": (".webp", "image/webp"),
}


class UploadValidationError(Exception):
    def __init__(self, detail: str):
        self.detail = detail


def _validated_extension_and_mime(raw: bytes) -> tuple[str, str]:
    """Never trusts the client-supplied filename or Content-Type header —
    both are attacker-controlled. Decodes the actual bytes with Pillow and
    derives the extension/MIME from what the image *actually is*, which is
    also how a disguised non-image file (e.g. a .jpg that's really a script)
    gets rejected regardless of what its name or header claimed."""
    try:
        image = Image.open(io.BytesIO(raw))
        image.verify()
        # verify() invalidates the image object for further use, so re-open
        # to read the format after confirming it isn't corrupt.
        image = Image.open(io.BytesIO(raw))
        fmt = image.format
    except Exception as exc:
        raise UploadValidationError("Invalid image type") from exc

    if fmt not in ALLOWED_FORMATS:
        raise UploadValidationError("Invalid image type")
    return ALLOWED_FORMATS[fmt]


async def save_upload(file: UploadFile, category: str) -> dict:
    if category not in ALLOWED_CATEGORIES:
        raise UploadValidationError("Invalid upload category")

    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise UploadValidationError("Image exceeds 5 MB")
    if len(raw) == 0:
        raise UploadValidationError("Empty file")

    extension, mime_type = _validated_extension_and_mime(raw)

    settings = get_settings()
    upload_root = Path(settings.upload_dir)
    target_dir = upload_root / category
    target_dir.mkdir(parents=True, exist_ok=True)

    # A fresh UUID filename — never derived from the client's original
    # filename, which sidesteps path traversal (`../../etc`) and collisions
    # entirely rather than trying to sanitize an attacker-controlled string.
    filename = f"{uuid.uuid4()}{extension}"
    target_path = target_dir / filename
    target_path.write_bytes(raw)

    relative_path = f"/uploads/{category}/{filename}"
    return {
        "path": relative_path,
        "url": f"{settings.public_base_url}{relative_path}",
        "filename": filename,
        "mime_type": mime_type,
        "size": len(raw),
    }


def upload_error_response(error: UploadValidationError) -> HTTPException:
    return HTTPException(status_code=400, detail=error.detail)
