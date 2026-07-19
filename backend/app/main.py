from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers import auth, tickets
from app.security import hash_password


def _seed_admin():
    """Create the default admin user if the users table is empty."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.admin_email).first()
        if existing:
            return

        admin = User(
            email=settings.admin_email,
            hashed_password=hash_password(settings.admin_password),
            role="agent",
        )
        db.add(admin)
        db.commit()
        print(f"✓ Seeded admin user: {settings.admin_email}")
    except Exception as exc:
        print(f"✗ Seeding admin failed (table may already exist): {exc}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup and seed the admin user."""
    Base.metadata.create_all(bind=engine)
    _seed_admin()
    yield


app = FastAPI(
    title="Support CRM API",
    description="A customer-support ticketing system backend.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS settings for Vite dev server and preview (localhost:5173/4173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:4173",  # Vite preview
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tickets.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "database": "sqlite"}
