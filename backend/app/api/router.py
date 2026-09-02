from fastapi import APIRouter

from app.api.routes import health, inspections

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])
