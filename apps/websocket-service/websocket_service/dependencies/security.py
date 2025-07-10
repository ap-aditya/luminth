import json
import logging

import firebase_admin
from fastapi import HTTPException, Security, status, WebSocket
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials

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
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),  # noqa : B008
):

    try:
        id_token = credentials.credentials
        decoded_token = await run_in_threadpool(auth.verify_id_token, id_token)
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


async def get_current_user_ws(
    websocket: WebSocket,
):
    try:
        session_cookie = websocket.cookies.get("session")

        if not session_cookie:
            logging.warning("WebSocket connection attempt without a session cookie.")
            await websocket.close(code=4001, reason="Session cookie not found")
            return None

        decoded_token = await run_in_threadpool(
            auth.verify_session_cookie, session_cookie, check_revoked=True
        )
        return decoded_token

    except firebase_admin.auth.InvalidSessionCookieError as e:
        logging.warning(f"Invalid or expired Firebase session cookie: {e}")
        await websocket.close(code=4003, reason="Invalid or expired session")
        return None
    except Exception as e:
        logging.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=4000, reason="Authentication failed")
        return None
