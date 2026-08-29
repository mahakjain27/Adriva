from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from environment variables / .env — see .env.example for the full list."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./adriva.db"
    admin_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    public_base_url: str = "http://localhost:8000"
    public_profile_base_url: str = "http://localhost:5173"
    upload_dir: str = "uploads"

    @property
    def frontend_origins(self) -> list[str]:
        """`frontend_url` split on commas — lets CORS allow both the production
        Vercel domain and its preview-deployment domains without code changes."""
        return [origin.strip() for origin in self.frontend_url.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
