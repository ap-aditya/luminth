import asyncio

from sqlmodel import SQLModel

from .database import engine


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def main():
    await create_db_and_tables()


if __name__ == "__main__":
    asyncio.run(main())
