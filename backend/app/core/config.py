from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from environment variables / .env — see .env.example for the full list."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./adriva.db"
    jwt_secret: str = ""
    frontend_url: str = "http://localhost:5173"
    public_base_url: str = "http://localhost:8000"
    upload_dir: str = "uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
