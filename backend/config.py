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

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
