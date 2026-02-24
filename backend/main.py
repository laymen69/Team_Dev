from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, gms, notifications, reports, objectives, health, tracking
from app import models
from app.db.session import engine, init_db
from app.models import Base

app = FastAPI(
    title="Welcome to MerchandisingTeam App",
    description="this is Backend API for MerchandisingTeam App",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:8081",  # Expo default
    "http://localhost:19006", # Expo web
    "*"                       # Allow all for dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize DB (create extension if PostGIS)
init_db()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(gms.router, prefix="/api/gms", tags=["gms"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(health.router, tags=["health"])
app.include_router(objectives.router, prefix="/api/objectives", tags=["objectives"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["tracking"])

@app.get("/")
def read_root():
    return {"message": "Welcome to MerchandisingTeam App Backend API , I'm here to help you manage your Business"}

if __name__ == "__main__":
    import uvicorn
    # Run with 0.0.0.0 to allow access from other devices (emulator, phone)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
