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
    latest_render_at: datetime.datetime | None = None

    class Config:
        from_attributes = True


class PromptSubmissionRequest(BaseModel):
    prompt_text: str


class PromptResponse(BaseModel):
    prompt_id: uuid.UUID
    code: str | None = None
    video_url: str | None = None
    updated_at: datetime.datetime
    prompt_text: str
    latest_render_at: datetime.datetime | None = None

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


class UserResponse(BaseModel):
    user_id: str
    name: str | None
    dob: datetime.date | None = None
    avatar: str
    prompt_daily_limit: int
    render_daily_limit: int
    prompt_requests_today: int
    render_requests_today: int
    last_request_date: datetime.date | None = None

    class Config:
        from_attributes = True


class PaginatedHistoryResponse(BaseModel):
    total_items: int
    items: list[HistoryItem]
    page: int
    size: int
    total_pages: int
