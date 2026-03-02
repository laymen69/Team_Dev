from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, gms, notifications, reports, objectives, health, tracking, articles, complaints, leave_requests, export
from app import models
from app.db.session import engine, init_db
from app.models import Base
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Welcome to MerchandisingTeam App",
    description="this is Backend API for MerchandisingTeam App",
    version="1.0.0"
)


origins = [
    "http://localhost:8081",
    "http://localhost:19006",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")
init_db()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(gms.router, prefix="/api/gms", tags=["gms"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(health.router, tags=["health"])
app.include_router(objectives.router, prefix="/api/objectives", tags=["objectives"])
app.include_router(tracking.router,      prefix="/api/tracking",       tags=["tracking"])
app.include_router(articles.router,      prefix="/api/articles",       tags=["articles"])
app.include_router(complaints.router,    prefix="/api/complaints",     tags=["complaints"])
app.include_router(leave_requests.router,prefix="/api/leave-requests", tags=["leave"])
app.include_router(export.router,        prefix="/api/export",         tags=["exports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to MerchandisingTeam App Backend API ,"
    " I'm here to help you manage your Business"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
