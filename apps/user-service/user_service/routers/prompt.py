import datetime
import logging
import uuid
from enum import Enum
from typing import Annotated

from db_core.crud import data_crud, user_crud
from db_core.database import get_session
from db_core.models import Prompt, User
from db_core.schemas import PromptUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.security import get_current_user
from ..models import (
    JobSubmissionResponse,
    PromptResponse,
    PromptSubmissionRequest,
)
from ..services import publish_job
from ..services.code_validator import is_code_safe
from ..services.generate_code import generate_manim_code

router = APIRouter()


async def get_prompt_for_user(
    prompt_id: uuid.UUID,
    user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Prompt:
    uid = user.get("uid")
    prompt = await data_crud.get_prompt(session=session, prompt_id=prompt_id)
    if not prompt or prompt.author_id != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or you are not authorized to access it.",
        )
    return prompt


class LimitType(str, Enum):
    GENERATE = "generate"
    RENDER = "render"


async def check_and_increment_limit(
    session: AsyncSession, user: User, limit_type: LimitType
) -> bool:
    today = datetime.datetime.now(datetime.UTC).date()
    if user.last_request_date != today:
        user.render_requests_today = 0
        user.prompt_requests_today = 0
        user.last_request_date = today

    if limit_type == LimitType.GENERATE:
        if user.prompt_requests_today >= user.prompt_daily_limit:
            return False
        user.prompt_requests_today += 1
    elif limit_type == LimitType.RENDER:
        if user.render_requests_today >= user.render_daily_limit:
            return False
        user.render_requests_today += 1

    session.add(user)
    return True


async def submit_job(prompt: Prompt):
    try:
        request_time = datetime.datetime.now(datetime.UTC)
        job_id = await publish_job.submit_render_job(
            source_id=str(prompt.prompt_id),
            code=prompt.code,
            source_type="prompt",
            user_id=str(prompt.author_id),
            request_time=request_time,
        )
        prompt.latest_render_at = request_time
        return {"job_id": job_id}
    except Exception as e:
        logging.error(
            f"Render job submission failed for prompt {prompt.prompt_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to submit render job to the processing queue.",
        ) from None


@router.post(
    "/", status_code=status.HTTP_201_CREATED, summary="Create a New Blank Prompt"
)
async def create_new_prompt(
    user: Annotated[dict,Depends(get_current_user)],
    session: Annotated[AsyncSession,Depends(get_session)]
):
    uid = user.get("uid")
    logging.info(f"User {uid} creating new prompt.")
    new_prompt = await data_crud.create_prompt(session=session, user_id=uid)
    await session.commit()
    await session.refresh(new_prompt)
    return {
        "prompt_id": new_prompt.prompt_id,
        "message": "New Prompt created successfully.",
    }


@router.post(
    "/generate/{prompt_id}/", 
    response_model=PromptResponse, 
    summary="Generate Code from Prompt Text",
)
async def generate_code_from_prompt(
    prompt_in: PromptSubmissionRequest,
    prompt: Annotated[Prompt, Depends(get_prompt_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = prompt.author_id
    logging.info(f"User {uid} generating code for prompt {prompt.prompt_id}.")
    try:
        db_user = await user_crud.get_user(
            session=session, user_id=uid, for_update=True
        )
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        if not await check_and_increment_limit(session, db_user, LimitType.GENERATE):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Code generation limit exceeded.",
            )

        try:
            generated_code = await generate_manim_code(prompt_in.prompt_text)
        except Exception as e:
            logging.error(f"Code generation failed for user {uid}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate code from prompt.",
            ) from None

        update_data = PromptUpdate(
            code=generated_code, prompt_text=prompt_in.prompt_text
        )
        await data_crud.update_prompt(
            session=session, prompt=prompt, prompt_in=update_data
        )

        await session.commit()
        await session.refresh(prompt)
        return prompt

    except Exception:
        await session.rollback()
        raise


@router.post(
    "/render/{prompt_id}",
    response_model=JobSubmissionResponse,
    summary="Submit a Prompt's Generated Code for Rendering",
)
async def render_prompt_code(
    prompt: Annotated[Prompt, Depends(get_prompt_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    uid = prompt.author_id
    logging.info(f"User {uid} rendering code for prompt {prompt.prompt_id}.")
    try:
        if not prompt.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt has no code to render. Please generate code first.",
            )

        is_safe, reason = is_code_safe(prompt.code)
        if not is_safe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Generated code failed security validation: {reason}",
            )

        db_user = await user_crud.get_user(
            session=session, user_id=uid, for_update=True
        )

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        if not await check_and_increment_limit(session, db_user, LimitType.RENDER):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Render limit exceeded.",
            )

        job_response = await submit_job(prompt)
        session.add(prompt)
        await session.commit()
        return JobSubmissionResponse(**job_response)

    except Exception:
        await session.rollback()
        raise


@router.get("/{prompt_id}", response_model=PromptResponse, summary="Get a Prompt by ID")
async def get_prompt(prompt: Annotated[Prompt, Depends(get_prompt_for_user)]):
    return prompt


@router.delete(
    "/{prompt_id}",
    summary="Delete a Prompt by ID",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_prompt(
    prompt: Annotated[Prompt, Depends(get_prompt_for_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    logging.info(f"User {prompt.author_id} deleting prompt {prompt.prompt_id}.")
    await data_crud.delete_prompt(session=session, prompt=prompt)
    await session.commit()
    return None
