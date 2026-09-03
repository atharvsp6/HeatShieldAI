"""
HeatShield AI - Main Application Entry Point

AI-powered Heatwave Intelligence and Early Warning Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database import init_db, SessionLocal
from routes.auth import router as auth_router
from routes.regions import router as regions_router
from routes.stations import router as stations_router
from routes.core import router as core_router
from seed import seed_database

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Heatwave Intelligence and Early Warning Platform",
)

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8443",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8443",
    "https://heatshield.atharvpatil.me",
    "https://atharvpatil.me",
]
if settings.FRONTEND_URL:
    for u in settings.FRONTEND_URL.split(","):
        clean_u = u.strip().rstrip("/")
        if clean_u and clean_u not in origins:
            origins.append(clean_u)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*(atharvpatil\.me|vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(regions_router)
app.include_router(stations_router)
app.include_router(core_router)


@app.on_event("startup")
def startup_event():
    """Initialize database and seed data on startup."""
    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    print("[OK] Application ready!")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
