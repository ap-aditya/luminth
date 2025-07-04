import datetime
import uuid

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

from .user_model import User


def get_utc_now():
    return datetime.datetime.now(datetime.UTC)


class Canvas(SQLModel, table=True):
    canvas_id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True
    )
    title: str
    code: str | None = None
    video_url: str | None = None
    updated_at: datetime.datetime = Field(
        default_factory=get_utc_now, sa_column=Column(DateTime(timezone=True))
    )
    latest_render_at: datetime.datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )
    author_id: str = Field(foreign_key="user.user_id", index=True)
    author: User = Relationship(back_populates="canvases")
