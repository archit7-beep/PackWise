from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import logger


class PackWiseException(Exception):
    def __init__(
        self,
        message: str,
        code: str = "BAD_REQUEST",
        status_code: int = 400,
        details: dict[str, Any] | None = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

def register_error_handlers(app: FastAPI):
    @app.exception_handler(PackWiseException)
    async def packwise_exception_handler(request: Request, exc: PackWiseException):
        request_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "request_id": request_id,
                    "details": exc.details
                }
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", None)
        logger.exception(f"Unhandled exception occurred. Request ID: {request_id}")
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                    "request_id": request_id
                }
            },
        )
