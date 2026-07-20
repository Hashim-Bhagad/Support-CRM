from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ---- Auth ----
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


# ---- Tickets ----
class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class NoteOut(BaseModel):
    id: int
    note_text: str
    created_by: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketOut(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TicketDetailOut(TicketOut):
    notes: list[NoteOut] = []


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    note_text: Optional[str] = None


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime
