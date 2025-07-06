import firebase_admin
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseFunction
from starlette.responses import Response, JSONResponse
from starlette.types import ASGIApp


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),  # noqa : B008
):

    try:
        id_token = credentials.credentials
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except firebase_admin.auth.InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except Exception as e:
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

    async def dispatch(
        self, request: Request, call_next: RequestResponseFunction
    ) -> Response:
        if request.url.path in self.exempt_paths:
            return await call_next(request)

        provided_secret = request.headers.get("x-internal-api-secret")
        if not provided_secret or provided_secret != self.secret:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden: Invalid or missing API secret."},
            )

        return await call_next(request)
