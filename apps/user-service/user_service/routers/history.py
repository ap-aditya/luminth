from typing import Annotated

from db_core.database import get_session
from db_core.models import Canvas, Prompt
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, literal_column, select, union_all
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.security import get_current_user
from ..models import HistoryItem, HistoryItemType

router = APIRouter(
    prefix="/history", tags=["History"], dependencies=[Depends(get_current_user)]
)


class PaginatedHistoryResponse(BaseModel):
    total_items: int
    items: list[HistoryItem]
    page: int
    size: int
    total_pages: int


def common_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Number of items per page"),
):
    skip = (page - 1) * size
    return {"skip": skip, "limit": size, "page": page, "size": size}


PaginationDep = Annotated[dict, Depends(common_pagination_params)]


async def _get_paginated_unified_history(
    session: AsyncSession, user_id: str, skip: int, limit: int
) -> tuple[list[HistoryItem], int]:

    canvas_select = select(
        literal_column(f"'{HistoryItemType.CANVAS.value}'").label("item_type"),
        Canvas.canvas_id.label("item_id"),
        Canvas.title.label("display_text"),
        Canvas.updated_at,
    ).where(Canvas.author_id == user_id)

    prompt_select = select(
        literal_column(f"'{HistoryItemType.PROMPT.value}'").label("item_type"),
        Prompt.prompt_id.label("item_id"),
        Prompt.prompt_text.label("display_text"),
        Prompt.updated_at,
    ).where(Prompt.author_id == user_id)

    unified_query = union_all(canvas_select, prompt_select).alias("unified_history")
    count_query = select(func.count()).select_from(unified_query)
    total_result = await session.execute(count_query)
    total_count = total_result.scalar_one()
    data_query = (
        select(unified_query)
        .order_by(unified_query.c.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await session.execute(data_query)

    response_items = []
    for row in result.mappings():
        item_type = HistoryItemType(row["item_type"])
        display_text = row["display_text"]
        if item_type == HistoryItemType.PROMPT and len(display_text) > 75:
            display_text = display_text[:75] + "..."

        response_items.append(
            HistoryItem(
                item_type=item_type,
                item_id=row["item_id"],
                display_text=display_text,
                updated_at=row["updated_at"],
            )
        )

    return response_items, total_count


@router.get(
    "/", response_model=PaginatedHistoryResponse, summary="Get Paginated User History"
)
async def get_paginated_history(
    pagination: PaginationDep,
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = user.get("uid")
    paginated_items, total_items = await _get_paginated_unified_history(
        session=session, user_id=uid, skip=pagination["skip"], limit=pagination["limit"]
    )

    return PaginatedHistoryResponse(
        total_items=total_items,
        items=paginated_items,
        page=pagination["page"],
        size=len(paginated_items),
        total_pages=(total_items + pagination["size"] - 1) // pagination["size"],
    )
