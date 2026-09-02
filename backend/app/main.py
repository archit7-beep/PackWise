from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_error_handlers
from app.core.logging import logger, setup_logging
from app.middleware.request_id import RequestIDMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Setup logging, future DB initialization, model loading
    setup_logging(debug=settings.DEBUG)
    logger.info("Starting PackWise API...")
    yield
    # Shutdown: Close DB connections, clear resources
    logger.info("Shutting down PackWise API...")

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Backend API for PackWise",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan
    )

    # Add Request ID Middleware (Executes early)
    application.add_middleware(RequestIDMiddleware)

    # Set all CORS enabled origins
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.frontend_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register error handlers
    register_error_handlers(application)

    # Include routers
    application.include_router(api_router, prefix="/api/v1")
    
    # Mount static files for uploads
    import os

    from fastapi.staticfiles import StaticFiles
    os.makedirs("uploads", exist_ok=True)
    application.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    return application

app = create_application()
