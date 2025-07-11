import datetime
import logging
import uuid
import grpc
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
            channel = grpc.insecure_channel(settings.emulator_host)
            publisher = pubsub_v1.PublisherClient(
                credentials=AnonymousCredentials(),
                client_options=ClientOptions(api_endpoint=settings.emulator_host),
                channel=channel
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


def submit_render_job(
    source_id: str,
    code: str,
    source_type: str,
    user_id: str,
    request_time_str: str,
) -> str:
    if not publisher or not topic_path:
        raise ConnectionError("Pub/Sub publisher is not available.")

    job_id = str(uuid.uuid4())
    logging.info(f"Submitting render job {job_id} for user {user_id}")
    attributes = {
        "user_id": user_id,
        "job_id": job_id,
        "source_id": source_id,
        "source_type": source_type,
        "request_timestamp": request_time_str,
    }
    logging.info(f"Preparing to publish attributes: {attributes}")
    try:
        future = publisher.publish(
            topic_path,
            data=code.encode("utf-8"),
            **attributes,
        )
        message_id = future.result()
        logging.info(f"Successfully published message {message_id} for job {job_id}.")
        return job_id
    except Exception as e:
        logging.error(f"Failed to publish message for job {job_id}: {e}")
        raise
