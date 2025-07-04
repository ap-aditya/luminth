import datetime
import logging
import uuid

from google.cloud import pubsub_v1

from ..dependencies.config import settings

try:
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(settings.GCP_PROJECT_ID, settings.RENDER_TOPIC_ID)
    logging.info(f"Pub/Sub publisher initialized for topic: {topic_path}")
except Exception as e:
    logging.error(f"Could not initialize Pub/Sub publisher: {e}")
    publisher = None


async def submit_render_job(
    source_id: str,
    code: str,
    source_type: str,
    user_id: str,
    request_time: datetime.datetime,
) -> str:
    if not publisher:
        raise ConnectionError("Pub/Sub publisher is not available.")

    job_id = str(uuid.uuid4())

    logging.info(
        f"Submitting render job {job_id} for user {user_id} "
        f"from source {source_id} ({source_type})."
    )

    try:
        future = publisher.publish(
            topic_path,
            data=code.encode("utf-8"),
            user_id=user_id,
            job_id=job_id,
            source_id=source_id,
            source_type=source_type,
            request_timestamp=request_time.isoformat(),
        )
        message_id = future.result(timeout=10)
        logging.info(f"Successfully published message {message_id} for job {job_id}.")
        return job_id
    except Exception as e:
        logging.error(f"Failed to publish message for job {job_id}: {e}")
        raise
