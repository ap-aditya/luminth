import json
import logging

import firebase_admin
from fastapi import HTTPException, Request, Security, status
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from ..dependencies.config import settings


async def initialize_firebase():
    try:
        await run_in_threadpool(firebase_admin.initialize_app)
        logging.info(
            "Firebase Admin SDK initialized successfully via default credentials."
        )
    except Exception as e:
        logging.critical(
            f"CRITICAL ERROR: Could not initialize Firebase Admin SDK: {e}"
        )
        raise


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),
):
    try:
        id_token = credentials.credentials
        decoded_token = await run_in_threadpool(
            auth.verify_session_cookie, id_token, check_revoked=True
        )
        return decoded_token
    except firebase_admin.auth.InvalidSessionCookieError as e:
        logging.info(f"Invalid or expired Firebase session cookie: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired session: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except Exception as e:
        logging.info(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


class SecretKeyMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, app: ASGIApp, secret: str, exempt_paths: list[str] | None = None
    ) -> None:
        super().__init__(app)
        self.secret = secret
        self.exempt_paths = exempt_paths or []

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in self.exempt_paths:
            return await call_next(request)

        provided_secret = request.headers.get("x-internal-api-secret")
        if not provided_secret or provided_secret != self.secret:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden: Invalid or missing API secret."},
            )
        logging.info("Secret key middleware: Valid API secret provided.")
        return await call_next(request)
