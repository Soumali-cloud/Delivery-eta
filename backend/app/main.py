from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes.deliveries import router as deliveries_router
from app.routes.websocket import router as websocket_router
from app.routes.analytics import router as analytics_router

from app.database import engine, Base

from app import models

from app.routes.eta import router as eta_router


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="Real-Time Delivery ETA Prediction API",
    description="AI-powered delivery time prediction system",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_URL",
            ""
        ).split(",")
        if origin.strip()
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


app.include_router(
    eta_router
)
app.include_router(deliveries_router)
app.include_router(
    websocket_router
)
app.include_router(
    analytics_router
)


@app.get("/")
def root():

    return {
        "message": "Delivery ETA API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }