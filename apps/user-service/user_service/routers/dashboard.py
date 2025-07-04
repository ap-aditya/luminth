from typing import Annotated

from db_core.crud import data_crud, user_crud
from db_core.database import get_session
from db_core.models import Canvas, Prompt, User
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from ..dependencies.security import get_current_user
from ..models import HistoryItem, HistoryItemType

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)]
)

class DashboardData(BaseModel):
    user_profile: User
    recent_activity: list[HistoryItem]

async def _get_unified_history(
    session: AsyncSession, 
    user_id: str, 
    limit: int = 10
) -> list[HistoryItem]:
    canvases = await data_crud.get_canvases_for_user(session, user_id, limit=limit)
    prompts = await data_crud.get_prompts_for_user(session, user_id, limit=limit)
    combined_items = canvases + prompts
    sorted_items = sorted(combined_items, key=lambda x: x.updated_at, reverse=True)
    recent_items = sorted_items[:limit]
    response_items = []
    for item in recent_items:
        if isinstance(item, Canvas):
            response_items.append(
                HistoryItem(
                    item_type=HistoryItemType.CANVAS,
                    item_id=item.canvas_id,
                    display_text=item.title,
                    updated_at=item.updated_at,
                )
            )
        elif isinstance(item, Prompt):
            display_text = (item.prompt_text[:75] + '...') if len(item.prompt_text) > 75 else item.prompt_text #noqa: E501
            response_items.append(
                HistoryItem(
                    item_type=HistoryItemType.PROMPT,
                    item_id=item.prompt_id,
                    display_text=display_text,
                    updated_at=item.updated_at,
                )
            )
    
    return response_items


@router.get("/", response_model=DashboardData, summary="Get Aggregated Dashboard Data")
async def get_dashboard_data(
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    uid = user.get('uid')
    db_user = await user_crud.get_user(session, uid)
    if not db_user:
        db_user=await user_crud.create_user(session, uid)
        await session.commit()
        await session.refresh(db_user)

    
    recent_activity = await _get_unified_history(session, user_id=uid, limit=10)

    return DashboardData(
        user_profile=db_user,
        recent_activity=recent_activity
    )
