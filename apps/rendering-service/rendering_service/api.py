import base64
import logging
import shutil
import os
from fastapi import APIRouter, Request, HTTPException
from rendering_service.core.config import settings
from rendering_service import services

router = APIRouter()

@router.post("/")
async def process_rendering_job(request: Request):
    envelope = await request.json()
    if not envelope or "message" not in envelope:
        raise HTTPException(status_code=400, detail="Invalid Pub/Sub message format.")

    message = envelope["message"]
    attributes = message.get("attributes", {})

    try:
        code_to_render = base64.b64decode(message["data"]).decode("utf-8").strip()
        task_id = attributes.get("task_id")
        user_id = attributes.get("user_id")
        if not all([task_id, user_id, code_to_render]):
            raise ValueError("'task_id', 'user_id', and code data must be provided.")
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid message payload: {e}")

    logging.info(f"Processing task_id '{task_id}' for user_id '{user_id}'.")

    redis_payload = {}
    final_status = "failure"

    try:
        scene_name = services.extract_first_scene_name(code_to_render)
        video_file_path = services.render_video(code_to_render, scene_name)
        dropbox_link = services.upload_and_get_link(
            video_file_path, task_id, scene_name
        )
        final_status = "success"
        redis_payload = {
            "task_id": task_id,
            "user_id": user_id,
            "status": final_status,
            "video_url": dropbox_link,
        }

    except Exception as e:
        logging.error(f"Task '{task_id}' failed: {e}")
        redis_payload = {
            "task_id": task_id,
            "user_id": user_id,
            "status": "failure",
            "error": str(e),
        }
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if redis_payload:
            services.publish_redis_message(redis_payload)
        if os.path.exists(settings.VIDEO_OUTPUT_DIR):
            shutil.rmtree(settings.VIDEO_OUTPUT_DIR)
            logging.info(f"Cleaned up temporary directory: {settings.VIDEO_OUTPUT_DIR}")

    return {"status": final_status, "task_id": task_id}
