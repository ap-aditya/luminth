import firebase_admin
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from fastapi import HTTPException


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
    
