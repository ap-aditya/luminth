import uuid
import datetime
from sqlmodel import Field, SQLModel, Relationship
from .user_model import User

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class Canvas(SQLModel, table=True):
    canvas_id: uuid.UUID  =  Field(
        default_factory=uuid.uuid4, 
        primary_key=True, 
        index=True
    )
    code: str | None = None
    video_url:str | None = None
    created_at: datetime.datetime = Field(
        default_factory=get_utc_now, 
        nullable=False
    )
    author_id: uuid.UUID = Field(foreign_key="user.user_id", index=True)
    author: User = Relationship(back_populates="canvases")