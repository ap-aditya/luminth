from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
from sqlmodel.ext.asyncio.session import AsyncSession
import os
from typing import AsyncGenerator
from contextlib import asynccontextmanager

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


@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session





