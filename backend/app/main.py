from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import companies, employees, products, profiles, themes, uploads
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
# the real deployed frontend origin — never "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(companies.router)
app.include_router(employees.router)
app.include_router(products.router)
app.include_router(uploads.router)
app.include_router(themes.router)
app.include_router(profiles.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "adriva-api"}
