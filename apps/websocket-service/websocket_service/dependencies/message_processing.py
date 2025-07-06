import logging
import datetime
from db_core.crud import data_crud
from db_core.schemas import CanvasUpdate, PromptUpdate
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import UserMessage


async def process_payload(
    payload_data: dict, session: AsyncSession
) -> UserMessage | None:

    source_type = payload_data.get("source_type")
    source_id = payload_data.get("source_id")
    request_timestamp_str= payload_data.get("request_timestamp")
    request_timestamp = datetime.datetime.fromisoformat(request_timestamp_str)
    status = payload_data.get("status")
    video_url = payload_data.get("video_url")

    source_map = {
        "canvas": {
            "get": data_crud.get_canvas,
            "update": data_crud.update_canvas,
            "update_model": CanvasUpdate,
            "id_arg": "canvas_id",
        },
        "prompt": {
            "get": data_crud.get_prompt,
            "update": data_crud.update_prompt,
            "update_model": PromptUpdate,
            "id_arg": "prompt_id",
        },
    }

    config = source_map.get(source_type)
    if not config:
        logging.warning(f"Unknown source_type received: {source_type}")
        return None

    item_id_kwargs = {config["id_arg"]: source_id}
    item = await config["get"](session=session, **item_id_kwargs)

    if not item or item.latest_render_at > request_timestamp:
        return None

    if status == "success" and video_url:
        update_data = config["update_model"](video_url=video_url)
        await config["update"](
            session=session,
            **item_id_kwargs,
            **{
                (
                    "canvas_update" if source_type == "canvas" else "prompt_update"
                ): update_data
            },
        )
        await session.commit()

        return UserMessage(
            message=f"Your {source_type} has been successfully rendered.",
            video_url=video_url,
            source_id=source_id,
            source_type=source_type,
            status="success",
        )
    else:
        return UserMessage(
            status="failure",
            message=f"An error occurred while processing your request for {source_type} with ID {source_id}.", # noqa: E501
            source_id=source_id,
            source_type=source_type,
            detail=payload_data.get("error", "Unknown error occurred"),
        )
