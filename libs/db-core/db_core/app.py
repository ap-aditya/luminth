from sqlmodel import SQLModel, Session, Relationship, create_engine, Field, select
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
from sqlmodel.ext.asyncio.session import AsyncSession
import asyncio
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


class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    headquarters: str
    heroes: list["Hero"] = Relationship(back_populates="team")


class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    secret_name: str
    age: int | None = Field(default=None, index=True)

    team_id: int | None = Field(default=None, foreign_key="team.id")
    team: Team | None = Relationship(back_populates="heroes")


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def create_heroes():
    async with get_session() as session:
        team_preventers = Team(name="Preventers", headquarters="Sharp Tower")
        team_z_force = Team(name="Z-Force", headquarters="Sister Margaret's Bar")
        # session.add(team_preventers)
        # session.add(team_z_force)
        # session.commit()

        hero_deadpond = Hero(
            name="Deadpond", secret_name="Dive Wilson", team=team_z_force
        )
        hero_rusty_man = Hero(
            name="Rusty-Man",
            secret_name="Tommy Sharp",
            age=48,
            team=team_preventers,
        )
        hero_spider_boy = Hero(name="Spider-Boy", secret_name="Pedro Parqueador")
        session.add(hero_deadpond)
        session.add(hero_rusty_man)
        session.add(hero_spider_boy)
        await session.commit()

        await session.refresh(hero_deadpond)
        await session.refresh(hero_rusty_man)
        await session.refresh(hero_spider_boy)

        print("Created hero:", hero_deadpond)
        print("Created hero:", hero_rusty_man)
        print("Created hero:", hero_spider_boy)


async def select_heroes():
    async with get_session() as session:
        statement = select(Team).where(Team.name == "Preventers")
        result = await session.exec(statement)
        team_preventers = result.one()
        await session.refresh(team_preventers, attribute_names=["heroes"])
        print("Preventers heroes:", team_preventers.heroes)


async def main():
    # await create_db_and_tables()
    # await create_heroes()
    await select_heroes()


if __name__ == "__main__":
    asyncio.run(main())
