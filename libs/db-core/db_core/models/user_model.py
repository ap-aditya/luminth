import uuid
import datetime
from sqlmodel import Field, SQLModel, Relationship
class Canvas(SQLModel):
    pass

class Prompt(SQLModel):
    pass


class User(SQLModel, table=True):
    user_id: uuid.UUID = Field(
        primary_key=True
    )
    name: str = Field(index=True)
    dob: datetime.date | None= None
    avatar: str | None = None
    canvases: list["Canvas"] = Relationship(back_populates="author")
    prompts: list["Prompt"] = Relationship(back_populates="author")