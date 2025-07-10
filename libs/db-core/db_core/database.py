import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

load_dotenv()
DB_URL = os.getenv("DB_URL")

engine = create_async_engine(
    DB_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=False,
    connect_args={"ssl": True},
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session


@asynccontextmanager
async def get_session_context():
    session_gen = get_session()
    session = await session_gen.__anext__()
    try:
        yield session
    finally:
        try:
            await session_gen.__anext__()
        except StopAsyncIteration:
            pass
