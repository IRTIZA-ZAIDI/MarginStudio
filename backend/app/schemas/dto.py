from pydantic import BaseModel, Field
from typing import Optional, Literal, Any


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int


class Selection(BaseModel):
    type: Literal["text", "image"]
    page: int = Field(ge=1)
    content: Optional[str] = None
    bbox: Optional[dict] = None  # {x,y,w,h} in PDF pixel coords on rendered page


class AskRequest(BaseModel):
    model: Optional[str] = None
    user_query: str
    selection: Selection
    document_id: Optional[str] = None


class AskResponse(BaseModel):
    model: str
    answer: str
    used_context: dict
