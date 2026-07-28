"""
Main FastAPI application — ML Service Guru Batik
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import segmentation

app = FastAPI(
    title="Guru Batik ML Service",
    description="Machine Learning service untuk segmentasi pelanggan RFM dan K-Means clustering",
    version="1.0.0",
    docs_url="/ml/docs",
    redoc_url="/ml/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(segmentation.router, prefix="/ml")


@app.get("/ml/health")
def health_check():
    return {"status": "ok", "service": "Guru Batik ML Service"}
