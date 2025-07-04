import datetime
import logging
import uuid
from db_core.crud import data_crud, user_crud
from db_core.models import User
from db_core.database import get_session
from db_core.models import Canvas
from db_core.schemas import CanvasCreate, CanvasUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..dependencies.security import get_current_user
from ..models import (
    CanvasResponse,
    JobSubmissionResponse,
    CanvasSubmissionRequest
)
from ..services import publish_job
from ..services.code_validator import is_code_safe

router = APIRouter()


async def get_canvas_for_user(
    canvas_id: uuid.UUID,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Canvas:
    uid = user.get("uid")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Canvas not found or you are not authorized to access it."
        )
    return canvas

async def check_render_limit(
        user_id:str,
        session:AsyncSession=Depends(get_session)
    ):
    user = await user_crud.get_user(session=session, user_id=user_id, for_update=True)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    today= datetime.datetime.now(datetime.UTC).date()
    if(user.last_request_date!=today):
        user.render_requests_today=0
        user.prompt_requests_today=0
        user.last_request_date=today

    if(user.render_requests_today<user.render_requests_today + 1):
        user.render_requests_today += 1
    session.add(user)
    session.commit()
    if user.render_requests_today >= user.render_daily_limit:
        return False
    return True


async def submit_job(canvas:Canvas):
    try:
        job_id = await publish_job.submit_render_job(
            source_id=str(canvas.canvas_id),
            code=canvas.code,
            source_type="canvas",
            user_id=str(canvas.author_id),
            request_time=canvas.latest_render_at
        )
        return {"job_id": job_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Failed to submit render job: {e}")



@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a New Canvas",
    response_model=CanvasResponse
)
async def create_new_canvas(
    canvas_in:CanvasCreate,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    
    uid = user.get("uid")
    logging.info(f"User {uid} creating new canvas.")
    new_canvas: Canvas = await data_crud.create_canvas(
        session=session, 
        user_id=uid,
        canvas_in=canvas_in
    )
    await session.commit()
    await session.refresh(new_canvas)
    return new_canvas


@router.post(
    "/render/{canvas_id}",
    summary="Submit a Canvas's Code for Rendering",
    response_model=JobSubmissionResponse
)
async def render_canvas_code(
    canvas_in: CanvasSubmissionRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    uid = user.get("uid")
    logging.info(f"User {uid} requesting render for canvas {canvas_id}.")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")

    request_time = datetime.datetime.now(datetime.UTC)
    update_data = CanvasUpdate(**canvas_in.model_dump, latest_render_at=request_time)
    await data_crud.update_canvas(session=session, canvas=canvas, canvas_in=update_data)
    await session.commit()
    await session.refresh(canvas)
    if not canvas.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Canvas has no code to render.")

    is_safe, reason = is_code_safe(canvas.code)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Code failed security validation: {reason}"
        )
    
    if not check_render_limit(uid):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Render limit exceeded. Please try again tomorrow."
        )
    
    try:
        await submit_job(canvas)
    except HTTPException as e:
        raise e
    return JobSubmissionResponse()


@router.get(
    "/{canvas_id}",
    response_model=CanvasResponse,
    summary="Get a Canvas by ID"
)
async def get_canvas(
    canvas_id: uuid.UUID,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    uid = user.get("uid")
    logging.info(f"User {uid} requesting canvas {canvas_id}.")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")
    return canvas

@router.put(
    "/{canvas_id}",
    response_model=CanvasResponse,
    summary="Update a Canvas by ID"
)
async def update_canvas(
    canvas_id: uuid.UUID,
    canvas_in: CanvasSubmissionRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    uid = user.get("uid")
    logging.info(f"User {uid} updating canvas {canvas_id}.")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")

    updated_canvas= CanvasUpdate(**canvas_in.model_dump())
    await data_crud.update_canvas(session=session, canvas=canvas, canvas_in=updated_canvas)
    await session.commit()
    await session.refresh(canvas)
    return canvas


@router.delete(
    "/{canvas_id}",
    summary="Delete a Canvas by ID"
)
async def delete_canvas(
    canvas_id: uuid.UUID,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    uid = user.get("uid")
    logging.info(f"User {uid} deleting canvas {canvas_id}.")
    canvas = await data_crud.get_canvas(session=session, canvas_id=canvas_id)
    if not canvas or canvas.author_id != uid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")
    
    try:
        await data_crud.delete_canvas(session=session, canvas=canvas)
        await session.commit()
    except Exception as e:
        await session.rollback()
        logging.error(f"Failed to delete canvas {canvas_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete canvas.")

    return {"message": "Canvas deleted successfully."}