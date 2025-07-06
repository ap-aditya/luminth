import asyncio
import json
import logging
from typing import AsyncGenerator
import redis.asyncio as redis
from redis.asyncio.client import PubSub
from redis.exceptions import ConnectionError, RedisError
from .dependencies.config import settings
from .websocket_manager import ConnectionManager


class RedisClient:
    def __init__(self):
        self.redis_connection: redis.Redis | None = None
        self._pubsub: PubSub | None = None

    async def connect(self) -> None:
        if self.redis_connection:
            logging.info("Already connected to Redis.")
            return

        conn_kwargs = {"encoding": "utf-8", "decode_responses": True}
        try:
            if settings.VALKEY_URI:
                logging.info("Connecting to Valkey via URI...")
                self.redis_connection = redis.from_url(
                    settings.VALKEY_URI, **conn_kwargs
                )
            else:
                logging.info(
                    f"Connecting to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}..."
                )
                self.redis_connection = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    db=0,
                    **conn_kwargs,
                )

            await self.redis_connection.ping()
            self._pubsub = self.redis_connection.pubsub()
            logging.info("Successfully connected to Redis.")
        except RedisError as e:
            logging.error(f"Failed to connect to Redis: {e}")
            self.redis_connection = None
            self._pubsub = None
            raise

    async def disconnect(self) -> None:
        if self._pubsub:
            await self._pubsub.close()
            self._pubsub = None
        if self.redis_connection:
            await self.redis_connection.close()
            self.redis_connection = None
        logging.info("Redis connection closed.")

    async def listen(self, channel: str) -> AsyncGenerator[dict, None]:
        while True:
            try:
                if not self.redis_connection or not self._pubsub:
                    await self.connect()

                await self._pubsub.subscribe(channel)
                logging.info(f"Subscribed to Redis channel: '{channel}'")

                while True:
                    message = await self._pubsub.get_message(
                        ignore_subscribe_messages=True, timeout=30.0
                    )
                    if message:
                        yield message

            except ConnectionError as e:
                logging.error(f"Redis connection lost: {e}. Reconnecting in 5s...")
                await self.disconnect()
                await asyncio.sleep(5)
            except RedisError as e:
                logging.error(
                    f"A Redis error occurred: {e}. Resetting connection in 10s..."
                )
                await self.disconnect()
                await asyncio.sleep(10)
            except Exception as e:
                logging.critical(f"A critical error occurred in the listener: {e}")
                await self.disconnect()
                raise

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()


async def main(manager: ConnectionManager):
    redis_client = RedisClient()
    try:
        await redis_client.connect()
        async for message in redis_client.listen("my_channel"):
            if message and message.get("type") == "message":
                payload_str = message["data"]
                logging.info(f"Received message: {payload_str}")
                try:
                    payload_data = json.loads(payload_str)
                    user_id = payload_data.get("user_id")
                    if user_id:
                        await manager.send_personal_message(payload_data, user_id)
                    else:
                        logging.warning("Message received without 'user_id'.")
                except json.JSONDecodeError:
                    logging.error(f"Failed to decode JSON: {payload_str}")
    except Exception as e:
        logging.error(f"Application failed: {e}")
    finally:
        await redis_client.disconnect()
