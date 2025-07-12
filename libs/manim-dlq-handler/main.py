import json
import logging
import os

import functions_framework
import redis
from cloudevents.http import CloudEvent
try:
    valkey_uri = os.environ.get("VALKEY_URI")
    redis_client = redis.Redis.from_url(valkey_uri, decode_responses=True)
    redis_client.ping()
    logging.info("Successfully connected to Aiven for Valkey.")
except Exception as e:
    logging.critical(f"Fatal: Could not connect to Aiven for Valkey on startup: {e}")
    redis_client = None



@functions_framework.cloud_event
def handle_dlq_message(cloud_event: CloudEvent):
    if not redis_client:
        logging.error("Valkey client not available. Cannot process message.")
        return

    attributes = cloud_event.data["message"]["attributes"]
    job_id = attributes.get("job_id", "Unknown Job")
    logging.info(f"Processing DLQ message for job_id '{job_id}'")

    redis_payload = {
        "job_id": job_id,
        "user_id": attributes.get("user_id"),
        "status": "failure",
        "error": "Job failed after all retry attempts. The rendering service was unable to complete the request.",
        "source_id": attributes.get("source_id"),
        "source_type": attributes.get("source_type"),
        "request_timestamp": attributes.get("request_timestamp"),
    }

    try:
        redis_channel = "video_links"
        redis_client.publish(redis_channel, json.dumps(redis_payload))
        logging.info(f"Successfully published failure notice for job_id '{job_id}' to channel '{redis_channel}'.")
    except Exception as e:
        logging.error(f"Failed to publish to Valkey for job_id '{job_id}': {e}")