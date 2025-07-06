import json
import logging

import firebase_admin
from fastapi import HTTPException, Security, status
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials

from ..dependencies.config import settings


async def initialize_firebase():
    try:
        service_account_info_str = settings.FIREBASE_SERVICE_ACCOUNT_KEY
        if service_account_info_str:
            service_account_info = json.loads(service_account_info_str)
            cred = credentials.Certificate(service_account_info)
            await run_in_threadpool(firebase_admin.initialize_app, cred)
            logging.info(
                "Firebase Admin SDK initialized successfully via environment variable."
            )
        else:
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
