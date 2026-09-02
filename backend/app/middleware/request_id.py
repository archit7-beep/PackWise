import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract existing request ID or generate a new one
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
            
        # Attach it to the request state so routes/loggers can access it
        request.state.request_id = request_id
        
        # Process the request
        response = await call_next(request)
        
        # Add it to the response headers
        response.headers["X-Request-ID"] = request_id
        return response
