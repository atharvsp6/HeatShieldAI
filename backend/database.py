from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import get_settings

settings = get_settings()

raw_url = (settings.DATABASE_URL or "").strip()
connect_args = {}
if raw_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

db_url = raw_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(db_url, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from sqlalchemy import text


def init_db():
    """Create all tables and apply safe non-breaking schema migrations."""
    Base.metadata.create_all(bind=engine)

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
