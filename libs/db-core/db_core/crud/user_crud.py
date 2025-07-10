from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models import User
from ..schemas import UserUpdate


async def create_user(session: AsyncSession, user_id: str) -> User:
    new_user = User(user_id=user_id)
    session.add(new_user)
    return new_user


async def get_user(
    session: AsyncSession, user_id: str, for_update: bool = False
) -> User | None:
    statement = select(User).where(User.user_id == user_id)
    if for_update:
        statement = statement.with_for_update()
    user = await session.exec(statement)
    if user:
        return user.first();
    else:
        return None


async def update_user(
    session: AsyncSession, user: User, user_in: UserUpdate
) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    user.sqlmodel_update(update_data)
    session.add(user)
    return user


async def delete_user(session: AsyncSession, user_id: str) -> None:
    user = await get_user(session, user_id)
    if user:
        await session.delete(user)
