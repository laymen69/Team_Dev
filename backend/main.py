from fastapi import FastAPI ,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.api import auth, users, gms, notifications, reports, objectives, health, tracking, articles, complaints, leave_requests, export, stats
from app import models
from app.db.session import engine, init_db
from app.models import Base
import os
from fastapi.staticfiles import StaticFiles
import time
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
from app.db import indexes
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Welcome to MerchandisingTeam App",
    description="this is Backend API for MerchandisingTeam App",
    version="1.0.0",
    lifespan=lifespan
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


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    process_time_ms = (time.time() - start) * 1000
    response.headers["X-Process-Time-ms"] = f"{process_time_ms:.2f}"
    return response


os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) # type: ignore

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"message": "Not Found"})

app.include_router(auth.router,          prefix="/api/auth",           tags=["auth"])
app.include_router(users.router,         prefix="/api/users",          tags=["users"])
app.include_router(gms.router,           prefix="/api/gms",            tags=["gms"])
app.include_router(notifications.router, prefix="/api/notifications",  tags=["notifications"])
app.include_router(reports.router,       prefix="/api/reports",        tags=["reports"])
app.include_router(health.router,                                      tags=["health"])
app.include_router(objectives.router,    prefix="/api/objectives",     tags=["objectives"])
app.include_router(tracking.router,      prefix="/api/tracking",       tags=["tracking"])
app.include_router(articles.router,      prefix="/api/articles",       tags=["articles"])
app.include_router(complaints.router,    prefix="/api/complaints",     tags=["complaints"])
app.include_router(leave_requests.router,prefix="/api/leave-requests", tags=["leave"])
app.include_router(export.router,        prefix="/api/export",         tags=["exports"])
app.include_router(stats.router,         prefix="/api/stats",          tags=["stats"])

@app.get("/")
def read_root():
    return {"message": "Welcome to MerchandisingTeam App Backend API ,"
    " I'm here to help you manage your Business"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
