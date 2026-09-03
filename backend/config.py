from pydantic import field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./heatshield.db"
    SECRET_KEY: str = "heatshield-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    APP_NAME: str = "HeatShield AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"
    POSTGRES_URL: str | None = None
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    @field_validator("DATABASE_URL", "FRONTEND_URL", mode="before")
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    class Config:
        import os
        env_file = os.path.join(os.path.dirname(__file__), ".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
