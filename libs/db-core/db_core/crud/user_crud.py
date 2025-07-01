from uuid import UUID

from sqlmodel.ext.asyncio.session import AsyncSession

from ..models import User
from ..schemas import UserUpdate


async def create_user(
    session: AsyncSession, user_id: UUID
) -> User:
    new_user = User(user_id=user_id)
    session.add(new_user)
    return new_user

async def get_user(
    session: AsyncSession, user_id: UUID
) -> User | None:
    user = await session.get(User, user_id)
    if user:
        return user
    else:
        return None

async def update_user(
    session: AsyncSession, db_user: User, user_in: UserUpdate
) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(update_data)
    session.add(db_user)
    return db_user

async def delete_user(
    session: AsyncSession, user_id: UUID
) -> None:
    user = await get_user(session, user_id)
    if user:
        session.delete(user)
        