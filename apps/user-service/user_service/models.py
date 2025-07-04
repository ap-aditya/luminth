import datetime
import uuid
from enum import Enum

from pydantic import BaseModel, Field


class CanvasSubmissionRequest(BaseModel):
    title: str | None = None
    code: str | None = None


class CanvasResponse(BaseModel):
    canvas_id: uuid.UUID
    title: str
    code: str | None = None
    video_url: str | None = None
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class PromptSubmissionRequest(BaseModel):
    prompt_text: str


class PromptResponse(BaseModel):
    prompt_id: uuid.UUID
    code: str | None = None
    video_url: str | None = None
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class JobSubmissionResponse(BaseModel):
    message: str = Field(default="Render job submitted successfully.")


class HistoryItemType(str, Enum):
    CANVAS = "canvas"
    PROMPT = "prompt"

class HistoryItem(BaseModel):
    item_type: HistoryItemType
    item_id: uuid.UUID
    display_text: str
    updated_at: datetime.datetime