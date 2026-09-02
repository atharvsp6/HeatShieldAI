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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
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
