import datetime
import uuid

from sqlmodel import Field, Relationship, SQLModel

from .user_model import User


def get_utc_now():
    return datetime.datetime.now(datetime.UTC)

class Prompt(SQLModel, table=True):
    prompt_id: uuid.UUID  =  Field(
        default_factory=uuid.uuid4, 
        primary_key=True, 
        index=True
    )
    prompt_text: str
    code: str | None = None
    video_url:str | None = None
    updated_at: datetime.datetime = Field(
        default_factory=get_utc_now, 
        nullable=False
    )
    latest_render_at: datetime.datetime | None = None
    author_id: str = Field(foreign_key="user.user_id", index=True)
    author: User = Relationship(back_populates="prompts")
    