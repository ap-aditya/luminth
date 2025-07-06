from pydantic import BaseModel, Field


class UserMessage(BaseModel):
    message: str
    video_url: str | None = None
    source_id: str
    source_type: str
    status: str | None = Field(default="success")
    detail: str | None = None
