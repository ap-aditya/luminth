from sqlmodel import select
from uuid import UUID

from sqlmodel.ext.asyncio.session import AsyncSession

from ..models import Canvas, Prompt
from ..schemas import CanvasCreate, CanvasUpdate, PromptCreate, PromptUpdate


async def create_canvas(
    session: AsyncSession, canvas_in: CanvasCreate, user_id: str
) -> Canvas:
    new_canvas = Canvas(**canvas_in.model_dump(), author_id=user_id)
    session.add(new_canvas)
    return new_canvas


async def get_canvas(session: AsyncSession, canvas_id: UUID) -> Canvas | None:
    canvas = await session.get(Canvas, canvas_id)
    return canvas


async def update_canvas(
    session: AsyncSession, db_canvas: Canvas, canvas_in: CanvasUpdate
) -> Canvas:
    update_data = canvas_in.model_dump(exclude_unset=True)
    db_canvas.sqlmodel_update(update_data)
    session.add(db_canvas)
    return db_canvas


async def create_prompt(session: AsyncSession, user_id: str) -> Prompt:
    prompt_in = PromptCreate(author_id=user_id)
    new_prompt = Prompt(**prompt_in.model_dump())
    session.add(new_prompt)
    return new_prompt


async def get_prompt(session: AsyncSession, prompt_id: UUID) -> Prompt | None:
    prompt = await session.get(Prompt, prompt_id)
    return prompt


async def update_prompt(
    session: AsyncSession, prompt: Prompt, prompt_in: PromptUpdate
) -> Prompt:
    update_data = prompt_in.model_dump(exclude_unset=True)
    prompt.sqlmodel_update(update_data)
    session.add(prompt)
    return prompt


async def delete_prompt(session: AsyncSession, prompt_id: UUID) -> None:
    prompt = await get_prompt(session, prompt_id)
    if not prompt:
        return
    await session.delete(prompt)
    return


async def delete_canvas(session: AsyncSession, canvas_id: UUID) -> None:
    canvas = await get_canvas(session, canvas_id)
    if not canvas:
        return
    await session.delete(canvas)
    return

async def get_canvases_for_user(
    session: AsyncSession, user_id: str, limit: int = 10
) -> list[Canvas]:
    canvases = await session.exec(
        select(Canvas).where(Canvas.author_id == user_id).limit(limit)
    )
    return canvases.all()

async def get_prompts_for_user(
    session: AsyncSession, user_id: str, limit: int = 10
) -> list[Prompt]:
    prompts = await session.exec(
        select(Prompt).where(Prompt.author_id == user_id).limit(limit)
    )
    return prompts.all()