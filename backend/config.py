from pydantic import field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Required — must be set via environment variable (Supabase PostgreSQL connection string)
    DATABASE_URL: str

    # Auth
    SECRET_KEY: str = "heatshield-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # App metadata
    APP_NAME: str = "HeatShield AI"
    APP_VERSION: str = "1.0.0"

    # CORS — comma-separated list of allowed frontend origins
    FRONTEND_URL: str = "http://localhost:5173"

    # Groq LLM
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "openai/gpt-oss-20b"

    @field_validator("DATABASE_URL", "FRONTEND_URL", mode="before")
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    model_config = {
        "env_file": os.path.join(os.path.dirname(__file__), ".env"),
        "extra": "ignore",  # silently ignore any unknown env vars (e.g. Render-injected vars)
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
