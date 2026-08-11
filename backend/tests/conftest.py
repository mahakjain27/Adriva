import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """A fresh SQLite file per test — isolated from adriva.db and from every
    other test, and from each other (no shared in-memory connection races)."""
    db_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    upload_dir = tempfile.mkdtemp()
    monkeypatch.setattr("app.services.upload_service.get_settings", lambda: _TestSettings(upload_dir))

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


class _TestSettings:
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        self.public_base_url = "http://testserver"


@pytest.fixture()
def company_payload():
    return {
        "name": "Test Distributors Inc.",
        "logoPath": "",
        "website": "https://test-distributors.example.com",
        "about": "A test company for automated testing.",
        "address": "1 Test St, Testville, TS",
        "brandColors": {"primary": "#8b5cf6", "secondary": "#16171d", "accent": "#f3f4f6"},
        "socialLinks": {"linkedin": "https://linkedin.com/company/test"},
        "defaultTheme": "luxury",
        "brandingMode": "powered",
        "brand": None,
        "style": None,
        "typography": None,
        "motion": None,
    }
