import datetime

from sqlmodel import Field, SQLModel


class UserUpdate(SQLModel):
    name: str | None = None
    dob: str | None = None
    avatar: str | None = None


class CanvasCreate(SQLModel):
    code: str | None = None
    title: str | None = Field(default="Untitled Canvas")


class CanvasUpdate(SQLModel):
    code: str | None = None
    video_url: str | None = None
    title: str | None = None
    latest_render_at: datetime.datetime | None = None


class PromptCreate(SQLModel):
    prompt_text: str | None = Field(default="Describe your scene here")
    author_id: str


class PromptUpdate(SQLModel):
    video_url: str | None = None
    prompt_text: str | None = None
    code: str | None = None
    latest_render_at: datetime.datetime | None = None
