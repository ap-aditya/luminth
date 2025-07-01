from sqlmodel import SQLModel
import datetime

class UserUpdate(SQLModel):
    name: str | None = None
    dob: str | None = None
    avatar: str | None = None

class CanvasCreate(SQLModel):
    code:str
    title: str | None = None
    latest_render_at: datetime.datetime

class CanvasUpdate(SQLModel):
    code: str | None = None
    video_url: str | None = None
    title: str | None = None
    latest_render_at: datetime.datetime | None = None

class PromptCreate(SQLModel):
    prompt: str
    code: str | None = None
    latest_render_at: datetime.datetime
    
class PromptUpdate(SQLModel):
    video_url: str | None = None
    prompt: str | None = None
    code: str | None = None
    latest_render_at: datetime.datetime | None = None