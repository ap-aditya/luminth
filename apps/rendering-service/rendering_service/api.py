import base64
import logging
import os
import shutil
from dropbox.exceptions import ApiError
from fastapi import APIRouter, HTTPException, Request
from rendering_service import services
from rendering_service.core.config import settings

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
        job_id = attributes.get("job_id")
        user_id = attributes.get("user_id")
        if not all([job_id, user_id, code_to_render]):
            raise ValueError("'job_id', 'user_id', and code data must be provided.")
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid message payload: {e}"
        ) from e

    logging.info(f"Processing job_id '{job_id}' for user_id '{user_id}'.")

    redis_payload = {}
    final_status = "failure"

    try:
        scene_name = services.extract_first_scene_name(code_to_render)
        video_file_path = services.render_video(code_to_render, scene_name)
        dropbox_link = services.upload_and_get_link(
            video_file_path, job_id, scene_name
        )
        final_status = "success"
        redis_payload = {
            "job_id": job_id,
            "user_id": user_id,
            "status": final_status,
            "video_url": dropbox_link,
            "source_id": attributes.get("source_id"),
            "source_type": attributes.get("source_type"),
            "request_timestamp": attributes.get("request_timestamp"),
        }
    except ApiError as e:
        logging.warning(f"Job '{job_id}' failed with a retryable Dropbox error: {e}")
        raise HTTPException(
            status_code=503, 
            detail=f"Dropbox service error: {e}"
        ) from e

    except Exception as e:
        logging.error(f"Job '{job_id}' failed: {e}")
        redis_payload = {
            "job_id": job_id,
            "user_id": user_id,
            "status": "failure",
            "error": str(e),
            "source_id": attributes.get("source_id"),
            "source_type": attributes.get("source_type"),
            "request_timestamp": attributes.get("request_timestamp"),
        }

    finally:
        if redis_payload:
            services.publish_redis_message(redis_payload)
        if os.path.exists(settings.VIDEO_OUTPUT_DIR):
            shutil.rmtree(settings.VIDEO_OUTPUT_DIR)
            logging.info(f"Cleaned up temporary directory: {settings.VIDEO_OUTPUT_DIR}")

    return {"status": final_status, "job_id": job_id}
