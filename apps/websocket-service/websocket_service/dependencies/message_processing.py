import datetime
import logging

from db_core.crud import data_crud
from db_core.schemas import CanvasUpdate, PromptUpdate
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import UserMessage


async def process_payload(
    payload_data: dict, session: AsyncSession
) -> UserMessage | None:

    source_type = payload_data.get("source_type")
    source_id = payload_data.get("source_id")
    request_timestamp_str = payload_data.get("request_timestamp")
    request_timestamp = datetime.datetime.fromisoformat(request_timestamp_str)
    status = payload_data.get("status")
    video_url = payload_data.get("video_url")
    if source_type == "canvas":
        item = await data_crud.get_canvas(session=session, canvas_id=source_id)
    elif source_type == "prompt":
        item = await data_crud.get_prompt(session=session, prompt_id=source_id)
    else:
        logging.warning(f"Unknown source_type received: {source_type}")
        return None

    if not item or ((item.latest_render_at is not None) and item.latest_render_at > request_timestamp):
        return None

    if status == "success" and video_url:
        if source_type == "canvas":
            update_data = CanvasUpdate(video_url=video_url)
            await data_crud.update_canvas(session=session, db_canvas=item, canvas_in=update_data)
        elif source_type == "prompt":
            update_data = PromptUpdate(video_url=video_url)
            await data_crud.update_prompt(session=session, prompt=item, prompt_in=update_data)
        
        await session.commit()

        return UserMessage(
            message=f"Your {source_type} has been successfully rendered.",
            video_url=video_url,
            source_id=str(source_id),
            source_type=source_type,
            status="success",
        )
    else:
        return UserMessage(
            status="failure",
            message=f"An error occurred while processing your request for {source_type} with ID {source_id}.",
            source_id=str(source_id),
            source_type=source_type,
            detail=payload_data.get("error", "Unknown error occurred"),
        )
