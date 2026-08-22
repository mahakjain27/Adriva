import hmac

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


def require_admin(authorization: str | None = Header(default=None)) -> None:
    """Gate for the private management routers (companies/employees/products/
    themes/uploads) — checked as `Authorization: Bearer <ADMIN_API_KEY>`.

    Fails closed: an unset ADMIN_API_KEY must never mean "open to everyone",
    so a blank key rejects every request rather than only unauthenticated
    ones. Public routes (app.api.profiles) never depend on this."""
    settings = get_settings()
    token = authorization.removeprefix("Bearer ") if authorization else ""
    if not settings.admin_api_key or not hmac.compare_digest(token, settings.admin_api_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
