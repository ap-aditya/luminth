from sqlmodel import SQLModel, Field
import datetime

class UserUpdate(SQLModel):
    name: str | None = None
    dob: str | None = None
    avatar: str | None = None

class CanvasCreate(SQLModel):
    code:str| None=None
    title: str = Field(Default="Untitled Canvas")

class CanvasUpdate(SQLModel):
    code: str | None = None
    video_url: str | None = None
    title: str | None = None
    latest_render_at: datetime.datetime | None = None

class PromptCreate(SQLModel):
    prompt_text: str =Field(default="Describe your scene here")
    
class PromptUpdate(SQLModel):
    video_url: str | None = None
    prompt_text: str | None = None
    code: str | None = None
    latest_render_at: datetime.datetime | None = None