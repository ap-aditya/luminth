import json
import logging
import os
import re
import subprocess
import uuid

import dropbox
import redis
from dropbox.exceptions import ApiError
from dropbox.files import WriteMode

from rendering_service.core.config import settings

dbx = None


async def initialize_services():
    global dbx, redis_client
    from fastapi.concurrency import run_in_threadpool

    if all(
        [
            settings.DROPBOX_APP_KEY,
            settings.DROPBOX_APP_SECRET,
            settings.DROPBOX_REFRESH_TOKEN,
        ]
    ):
        try:
            dbx = dropbox.Dropbox(
                app_key=settings.DROPBOX_APP_KEY,
                app_secret=settings.DROPBOX_APP_SECRET,
                oauth2_refresh_token=settings.DROPBOX_REFRESH_TOKEN,
            )
            await run_in_threadpool(dbx.users_get_current_account)
            logging.info("Successfully connected to Dropbox.")
        except Exception as e:
            logging.error(f"Failed to connect to Dropbox on startup: {e}")
            dbx = None
    else:
        logging.warning("Dropbox credentials not fully configured.")

    redis_client = None
    try:
        if hasattr(settings, "VALKEY_URI") and settings.VALKEY_URI:
            redis_client = redis.Redis.from_url(
                settings.VALKEY_URI, decode_responses=True
            )
            logging.info("Successfully connected to Aiven for Valkey.")
        else:
            redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=0,
                decode_responses=True,
            )
            log_message = (
                f"Successfully connected to local Redis at {settings.REDIS_HOST}:"
                f"{settings.REDIS_PORT}."
            )
            logging.info(log_message)

        await run_in_threadpool(redis_client.ping)

    except Exception as e:
        logging.error(f"Failed to connect to Redis/Valkey on startup: {e}")
        redis_client = None


def extract_first_scene_name(code: str) -> str:
    match = re.search(r"class\s+(\w+)\s*\((?:.*\b)?Scene\b(?:.*)?\):", code)
    if not match:
        raise ValueError(
            "Could not find any class inheriting from 'Scene' in the provided code."
        )
    scene_name = match.group(1)
    logging.info(f"Dynamically extracted scene name: {scene_name}")
    return scene_name


def render_video(code: str, scene_name: str) -> str:
    script_path = f"/tmp/{uuid.uuid4()}.py"
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(code)

    logging.info(f"Starting Manim render for scene '{scene_name}'")
    command = [
        "manim",
        script_path,
        scene_name,
        "--media_dir",
        settings.VIDEO_OUTPUT_DIR,
        "-ql",
    ]
    try:
        subprocess.run(command, capture_output=True, text=True, check=True, timeout=600)
        script_name_stem = os.path.splitext(os.path.basename(script_path))[0]
        final_video_path = os.path.join(
            settings.VIDEO_OUTPUT_DIR,
            "videos",
            script_name_stem,
            "480p15",
            f"{scene_name}.mp4",
        )

        if not os.path.exists(final_video_path):
            raise FileNotFoundError(
                f"Rendered video for '{scene_name}' not found at expected path."
            )
        return final_video_path
    except subprocess.CalledProcessError as e:
        logging.error(f"Manim rendering for '{scene_name}' failed. STDERR:\n{e.stderr}")
        raise Exception(f"Manim rendering for scene '{scene_name}' failed.") from e
    finally:
        if os.path.exists(script_path):
            os.remove(script_path)


def upload_and_get_link(file_path: str, task_id: str, scene_name: str) -> str:
    if not dbx:
        raise Exception("Dropbox client is not initialized.")

    file_name = f"{task_id}_{scene_name}.mp4"
    dropbox_path = f"/{file_name}"
    logging.info(f"Uploading {file_name} to Dropbox path: {dropbox_path}")

    try:
        with open(file_path, "rb") as f:
            dbx.files_upload(f.read(), dropbox_path, mode=WriteMode("overwrite"))

        link_settings = dropbox.sharing.SharedLinkSettings(
            requested_visibility=dropbox.sharing.RequestedVisibility.public
        )
        link_metadata = dbx.sharing_create_shared_link_with_settings(
            dropbox_path, settings=link_settings
        )
        return link_metadata.url.replace(
            "www.dropbox.com", "dl.dropboxusercontent.com"
        ).replace("?dl=0", "")
    except ApiError as e:
        logging.error(f"Dropbox API Error for {file_name}: {e}")
        raise Exception(
            f"Failed to upload or create link on Dropbox for {file_name}."
        ) from e


def publish_redis_message(message: dict):
    if not redis_client:
        logging.error("Cannot publish message: Redis/Valkey client is not initialized.")
        return
    try:
        logging.info(
            f"Publishing message to Redis channel '{settings.REDIS_CHANNEL}': {message}"
        )
        redis_client.publish(settings.REDIS_CHANNEL, json.dumps(message))
    except Exception as e:
        logging.error(f"Failed to publish to Redis: {e}")
