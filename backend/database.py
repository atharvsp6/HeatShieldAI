from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import text
from config import get_settings

settings = get_settings()

# Normalise URL scheme — Render/Heroku sometimes emit postgres:// or postgresql://
# psycopg3 requires the postgresql+psycopg:// dialect prefix
db_url = settings.DATABASE_URL.strip()
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(db_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and apply safe non-breaking schema migrations."""
    Base.metadata.create_all(bind=engine)

    # Idempotent column additions — safe to run on every startup
    migration_statements = [
        "ALTER TABLE observations ADD COLUMN IF NOT EXISTS data_source VARCHAR(30) DEFAULT 'SYNTHETIC'",
        "ALTER TABLE advisories ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP",
        "ALTER TABLE advisories ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(100)",
        "ALTER TABLE advisories ADD COLUMN IF NOT EXISTS generated_by VARCHAR(30) DEFAULT 'TEMPLATE'",
    ]
    with engine.connect() as conn:
        for stmt in migration_statements:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass
