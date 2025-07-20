from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..dependencies.config import settings


def get_request_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return get_remote_address(request)


if not settings.REDIS_RL_URL:
    limiter = Limiter(key_func=get_request_identifier)
else:
    limiter = Limiter(
        key_func=get_request_identifier, 
        storage_uri=settings.REDIS_RL_URL,
        in_memory_fallback_enabled=True,
        swallow_errors=True
    )
