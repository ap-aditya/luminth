import datetime
import logging
import uuid

from google.api_core.client_options import ClientOptions
from google.auth.credentials import AnonymousCredentials
from google.cloud import pubsub_v1
from ..dependencies.config import settings

publisher = None
topic_path = None


async def initialize_publisher():
    global publisher, topic_path
    try:
        if settings.emulator_host:
            logging.info(f"Connecting to Pub/Sub emulator at {settings.emulator_host}")
            publisher = pubsub_v1.PublisherClient( 
                credentials=AnonymousCredentials(),
                client_options=ClientOptions(api_endpoint=settings.emulator_host),
            )
        else:
            logging.info("Connecting to production Pub/Sub")
            publisher = pubsub_v1.PublisherClient()

        topic_path = publisher.topic_path(
            settings.GCP_PROJECT_ID, settings.RENDER_TOPIC_ID
        )
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
    if not publisher or not topic_path:
        raise ConnectionError("Pub/Sub publisher is not available.")

    job_id = str(uuid.uuid4())
    logging.info(f"Submitting render job {job_id} for user {user_id}")

    try:
        future = publisher.publish(
            topic_path,
            data=code.encode("utf-8"),
            attributes={
                "user_id": user_id,
                "job_id": job_id,
                "source_id": source_id,
                "source_type": source_type,
                "request_timestamp": request_time.isoformat(),
            },
        )
        message_id = await future
        logging.info(f"Successfully published message {message_id} for job {job_id}.")
        return job_id
    except Exception as e:
        logging.error(f"Failed to publish message for job {job_id}: {e}")
        raise
