import datetime

from sqlmodel import Field, Relationship, SQLModel


class Canvas(SQLModel):
    pass


class Prompt(SQLModel):
    pass


class User(SQLModel, table=True):
    user_id: str = Field(primary_key=True)
    name: str | None
    dob: datetime.date | None = None
    avatar: str = Field(default="Aditya")
    prompt_daily_limit: int = Field(default=10, nullable=False)
    render_daily_limit: int = Field(default=30, nullable=False)
    prompt_requests_today: int = Field(default=0, nullable=False)
    render_requests_today: int = Field(default=0, nullable=False)
    last_request_date: datetime.date | None = None
    canvases: list["Canvas"] = Relationship(
        back_populates="author", cascade_delete=True
    )
    prompts: list["Prompt"] = Relationship(back_populates="author")
