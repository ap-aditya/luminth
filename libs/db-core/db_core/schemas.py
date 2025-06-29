from sqlmodel import SQLModel


class UserUpdate(SQLModel):
    name: str | None = None
    dob: str | None = None
    avatar: str | None = None

class CanvasCreate(SQLModel):
    code:str

class CanvasUpdate(SQLModel):
    code: str | None = None
    video_url: str | None = None

class PromptCreate(SQLModel):
    prompt: str
    code: str | None = None
    
class PromptUpdate(SQLModel):
    video_url: str | None = None
    prompt: str | None = None
    code: str | None = None