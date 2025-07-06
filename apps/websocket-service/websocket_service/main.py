import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Annotated

from db_core.database import get_session
from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect

from .dependencies.config import settings
from .dependencies.message_processing import process_payload
from .dependencies.security import get_current_user, initialize_firebase
from .redis_client import RedisClient
from .websocket_manager import ConnectionManager

connection_manager = ConnectionManager()
redis_client = RedisClient()


async def redis_message_processor():
    logging.info("Starting Redis message processor...")
    async for message in redis_client.listen(settings.REDIS_CHANNEL):
        if message and message.get("type") == "message":
            payload_str = message["data"]
            logging.info(f"Received from Redis: {payload_str}")

            try:
                payload_data = json.loads(payload_str)
                user_id = payload_data.get("user_id")
                async with get_session() as session:
                    user_message = await process_payload(payload_data, session=session)

                if user_message and user_id:
                    await connection_manager.send_personal_message(
                        user_message, user_id
                    )

            except json.JSONDecodeError:
                logging.error(f"Could not decode JSON from message: {payload_str}")
            except Exception as e:
                user_id_for_log = locals().get("user_id", "unknown")
                logging.error(
                    f"Error processing message for user '{user_id_for_log}': {e}"
                )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup: Initializing resources...")
    listener_task = asyncio.create_task(redis_message_processor())
    logging.info("Redis listener task has been started.")
    await initialize_firebase()
    yield

    logging.info("Application shutdown: Cleaning up resources...")
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        logging.info("Redis listener task successfully cancelled.")

    await redis_client.disconnect()
    logging.info("Shutdown complete.")


app = FastAPI(
    title="WebSocket Progress Service",
    description="Streams real-time progress updates from a Redis backend to authenticated users.",  # noqa: E501
    version="1.0.0",
    lifespan=lifespan,
)


@app.websocket("/ws/progress")
async def websocket_endpoint(
    websocket: WebSocket,
    user: Annotated[dict, Depends(get_current_user)],
):
    user_id = user.get("uid")
    await connection_manager.connect(websocket, user_id)
    logging.info(
        f"User '{user_id}' connected. Total connections for user: {len(connection_manager.get_user_connections(user_id))}"  # noqa: E501
    )

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logging.info(f"User '{user_id}' disconnected.")
    except Exception as e:
        logging.error(f"An error occurred in the WebSocket for user '{user_id}': {e}")
    finally:
        connection_manager.disconnect(websocket, user_id)
        logging.info(f"Cleaned up connection for user '{user_id}'.")
