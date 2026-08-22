from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import companies, employees, products, profiles, themes, uploads
from app.core.auth import require_admin
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Adriva API",
    description=(
        "Backend for Adriva, a digital business-card / digital identity platform. "
        "Company -> Employees -> Digital Identity -> Theme/Branding -> Live Profile -> QR/NFC/vCard."
    ),
    version="0.1.0",
)

# Development allows the Vite dev server; production must set FRONTEND_URL to
# the real deployed frontend origin(s) — comma-separated for prod + preview
# deployments — never "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Everything here is Adriva's own private management surface — protected by
# require_admin. profiles.router (the public digital-card + vCard endpoints
# customers' QR codes hit) is deliberately the only router left open below.
_admin_gate = [Depends(require_admin)]
app.include_router(companies.router, dependencies=_admin_gate)
app.include_router(employees.router, dependencies=_admin_gate)
app.include_router(products.router, dependencies=_admin_gate)
app.include_router(uploads.router, dependencies=_admin_gate)
app.include_router(themes.router, dependencies=_admin_gate)
app.include_router(profiles.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "adriva-api"}
