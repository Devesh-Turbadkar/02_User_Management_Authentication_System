from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.database import Base, engine
from app.routes import auth, users, records

# For this learning project, create missing tables automatically at startup.
# In larger production systems, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User Management & Authentication API",
    description="A learning project demonstrating registration, JWT authentication, profiles, and user-owned records.",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(records.router)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
