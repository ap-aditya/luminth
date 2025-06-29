import datetime
import uuid

from sqlmodel import Field, Relationship, SQLModel

from .user_model import User


def get_utc_now():
    return datetime.datetime.now(datetime.UTC)

class Canvas(SQLModel, table=True):
    canvas_id: uuid.UUID  =  Field(
        default_factory=uuid.uuid4, 
        primary_key=True, 
        index=True
    )
    title: str | None =None
    code: str | None = None
    video_url:str | None = None
    latest_render_at: datetime.datetime | None = Field(
        default=None
    )
    author_id: uuid.UUID = Field(foreign_key="user.user_id", index=True)
    author: User = Relationship(back_populates="canvases")