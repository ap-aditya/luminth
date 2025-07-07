import base64
import logging
import os
import shutil
from contextlib import asynccontextmanager
from typing import Any

from dropbox.exceptions import ApiError
from fastapi import FastAPI, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

from rendering_service import services
from rendering_service.core.config import settings


class PubSubMessage(BaseModel):
    data: str
    attributes: dict[str, Any] = Field(default_factory=dict)


class PushRequest(BaseModel):
    message: PubSubMessage
    subscription: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup: Initializing services...")
    await services.initialize_services()
    logging.info("Application startup: Services initialized.")
    yield

    logging.info("Application shutdown: Cleaning up resources.")


app = FastAPI(
    title="Rendering Service",
    description="Accepts Pub/Sub push requests to render Manim videos.",
    lifespan=lifespan,
    version="1.0.0",
)


def process_message(message: PubSubMessage) -> bool:
    attributes = message.attributes
    try:
        code_to_render = base64.b64decode(message.data).decode("utf-8").strip()
        job_id = attributes.get("job_id")
        user_id = attributes.get("user_id")
        if not all([job_id, user_id, code_to_render]):
            raise ValueError(
                "'job_id', 'user_id', and code data must be provided in attributes."
            )
    except (KeyError, TypeError, ValueError) as e:
        logging.error(f"Invalid message payload or attributes, will not retry: {e}")
        return True

    logging.info(f"Processing job_id '{job_id}' for user_id '{user_id}'.")

    redis_payload = {}
    final_status = "failure"

    try:
        scene_name = services.extract_first_scene_name(code_to_render)
        video_file_path = services.render_video(code_to_render, scene_name)
        dropbox_link = services.upload_and_get_link(video_file_path, job_id, scene_name)
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
        return True
    except ApiError as e:
        logging.warning(f"Job '{job_id}' failed with a retryable Dropbox error: {e}")
        return False

    except Exception as e:
        logging.error(
            f"Job '{job_id}' failed with a non-retryable error: {e}", exc_info=True
        )
        redis_payload = {
            "job_id": job_id,
            "user_id": user_id,
            "status": "failure",
            "error": str(e),
            "source_id": attributes.get("source_id"),
            "source_type": attributes.get("source_type"),
            "request_timestamp": attributes.get("request_timestamp"),
        }
        return True

    finally:
        if redis_payload:
            services.publish_redis_message(redis_payload)
        if os.path.exists(settings.VIDEO_OUTPUT_DIR):
            shutil.rmtree(settings.VIDEO_OUTPUT_DIR)
            logging.info(f"Cleaned up temporary directory: {settings.VIDEO_OUTPUT_DIR}")


@app.post("/")
async def pubsub_push_endpoint(request: PushRequest):
    should_acknowledge = await run_in_threadpool(process_message, request.message)

    if should_acknowledge:
        return Response(status_code=204)
    else:
        raise HTTPException(
            status_code=503, detail="Service temporarily unavailable, please-retry."
        )


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Rendering service is running."}
