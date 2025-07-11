import logging

import firebase_admin
from fastapi import WebSocket
from fastapi.concurrency import run_in_threadpool
from firebase_admin import auth


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

async def get_current_user_ws(websocket: WebSocket):
    try:
        auth_data = await websocket.receive_json()
        
        if auth_data.get("type") != "auth" or not auth_data.get("token"):
            logging.warning(
                "WebSocket connection attempt with invalid auth message format."
            )
            await websocket.close(code=4001, reason="Invalid auth message")
            return None

        token = auth_data["token"]
        decoded_token = await run_in_threadpool(auth.verify_id_token, token)
        return decoded_token

    except firebase_admin.auth.InvalidIdTokenError as e:
        logging.warning(f"Invalid or expired Firebase ID token for WebSocket: {e}")
        await websocket.close(code=4003, reason="Invalid or expired token")
        return None
    except Exception as e:
        logging.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=4000, reason="Authentication failed")
        return None

