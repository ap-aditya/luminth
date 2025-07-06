import datetime
import logging
import uuid
from typing import Annotated

from db_core.crud import data_crud, user_crud
from db_core.database import get_session
from db_core.models import Canvas, User
from db_core.schemas import CanvasCreate, CanvasUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.security import get_current_user
from ..models import CanvasResponse, CanvasSubmissionRequest, JobSubmissionResponse
from ..services import publish_job
from ..services.code_validator import is_code_safe

router = APIRouter()


async def get_canvas_for_user(
    canvas_id: uuid.UUID,
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Canvas:
    uid = user.get("uid")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found or you do are not authorized to access it.",
        )
    return canvas


async def check_and_increment_render_limit(session: AsyncSession, user: User) -> bool:
    today = datetime.datetime.now(datetime.UTC).date()

    if user.last_request_date != today:
        user.render_requests_today = 0
        user.prompt_requests_today = 0
        user.last_request_date = today

    if user.render_requests_today >= user.render_daily_limit:
        return False

    user.render_requests_today += 1
    session.add(user)
    return True


async def submit_job(canvas: Canvas):
    try:
        request_time = datetime.datetime.now(datetime.UTC)
        job_id = await publish_job.submit_render_job(
            source_id=str(canvas.canvas_id),
            code=canvas.code,
            source_type="canvas",
            user_id=str(canvas.author_id),
            request_time=request_time,
        )
        canvas.latest_render_at = request_time
        return {"job_id": job_id}
    except Exception as e:
        logging.error(
            f"Render job submission failed for canvas {canvas.canvas_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to submit render job to the processing queue.",
        ) from None


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a New Canvas",
    response_model=CanvasResponse,
)
async def create_new_canvas(
    canvas_in: CanvasCreate,
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = user.get("uid")
    logging.info(f"User {uid} creating new canvas.")
    new_canvas = await data_crud.create_canvas(
        session=session, user_id=uid, canvas_in=canvas_in
    )
    await session.commit()
    await session.refresh(new_canvas)
    return new_canvas


@router.post(
    "/render/{canvas_id}",
    summary="Submit a Canvas's SAVED Code for Rendering",
    response_model=JobSubmissionResponse,
)
async def render_canvas_code(
    canvas: Annotated[Canvas, Depends(get_canvas_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    try:
        if not canvas.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Canvas has no code to render. Please save your code first.",
            )

        is_safe, reason = is_code_safe(canvas.code)
        if not is_safe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Saved code failed security validation: {reason}",
            )

        db_user = await user_crud.get_user(
            session=session, user_id=canvas.author_id, for_update=True
        )
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        if not await check_and_increment_render_limit(session, db_user):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Render limit exceeded. Please try again tomorrow.",
            )

        job_response = await submit_job(canvas)
        session.add(canvas)
        await session.commit()
        return JobSubmissionResponse(**job_response)

    except Exception:
        await session.rollback()
        raise


@router.get("/{canvas_id}", response_model=CanvasResponse, summary="Get a Canvas by ID")
async def get_canvas(canvas: Annotated[Canvas, Depends(get_canvas_for_user)]):
    return canvas


@router.put(
    "/{canvas_id}", response_model=CanvasResponse, summary="Save/Update a Canvas by ID"
)
async def update_canvas(
    canvas_in: CanvasSubmissionRequest,
    canvas: Annotated[Canvas, Depends(get_canvas_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    logging.info(f"User {canvas.author_id} saving canvas {canvas.canvas_id}.")
    updated_canvas = CanvasUpdate(**canvas_in.model_dump(exclude_unset=True))

    await data_crud.update_canvas(
        session=session, canvas=canvas, canvas_in=updated_canvas
    )
    await session.commit()
    await session.refresh(canvas)
    return canvas


@router.delete(
    "/{canvas_id}",
    summary="Delete a Canvas by ID",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_canvas(
    canvas: Annotated[Canvas, Depends(get_canvas_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    logging.info(f"User {canvas.author_id} deleting canvas {canvas.canvas_id}.")
    await data_crud.delete_canvas(session=session, canvas=canvas)
    await session.commit()
    return None
