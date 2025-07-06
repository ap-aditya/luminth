import asyncio
import json
import logging
from collections import defaultdict
from typing import List
from fastapi import WebSocket
from starlette.websockets import WebSocketState


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        connections = self.active_connections.get(user_id)
        if connections:
            try:
                connections.remove(websocket)
            except ValueError:
                logging.debug(f"WebSocket for user '{user_id}' already removed.")

            if not connections:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        connections = self.active_connections.get(user_id, [])
        if not connections:
            return

        message_json = json.dumps(message)

        tasks = []
        stale_connections = []
        for connection in connections:
            if connection.client_state == WebSocketState.CONNECTED:
                tasks.append(connection.send_text(message_json))
            else:
                stale_connections.append(connection)

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logging.warning(
                        f"Failed to send to a websocket for user {user_id}: {result}"
                    )
                    stale_connections.append(tasks[i].__self__)

        if stale_connections:
            logging.debug(
                f"Removing {len(stale_connections)} stale connection(s) for user {user_id}."
            )
            for conn in set(stale_connections):
                self.disconnect(conn, user_id)

    def get_user_connections(self, user_id: str) -> List[WebSocket]:
        return self.active_connections.get(user_id, [])
