from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Note, Ticket, User
from app.schemas import (TicketCreate, TicketCreateResponse, TicketDetailOut,
                         TicketListItem, TicketUpdate, TicketUpdateResponse)
from app.security import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def _generate_ticket_id(db_id: int) -> str:
    # Return ``TKT-001`` style ID from the integer primary key.
    return f"TKT-{db_id:03d}"


@router.post("", response_model=TicketCreateResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Insert first with a placeholder ticket_id so we get the autoincrement id,
    # then update ticket_id to the real "TKT-00X" value once we know it.
    ticket = Ticket(
        ticket_id="",  # will be set after flush
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        subject=payload.subject,
        description=payload.description,
        status="Open",
    )
    db.add(ticket)
    db.flush()  # get the auto-generated ``id``

    ticket.ticket_id = _generate_ticket_id(ticket.id)
    db.commit()
    db.refresh(ticket)

    return TicketCreateResponse(ticket_id=ticket.ticket_id, created_at=ticket.created_at)


@router.get("", response_model=list[TicketListItem])
def list_tickets(
    status_filter: str | None = Query(None, alias="status"),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # List tickets, optionally filtered by **status** and/or **search**.
    query = db.query(Ticket)

    if status_filter:
        query = query.filter(Ticket.status == status_filter)

    if search:
        like = f"%{search}%"
        query = query.filter(
            Ticket.customer_name.ilike(like)
            | Ticket.customer_email.ilike(like)
            | Ticket.subject.ilike(like)
            | Ticket.description.ilike(like)
            | Ticket.ticket_id.ilike(like)
        )

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return tickets


@router.get("/{ticket_id}", response_model=TicketDetailOut)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Return full ticket detail including all notes.
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
        )
    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Update a ticket's status and/or add a note.

    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
        )

    if payload.status is not None:
        ticket.status = payload.status

    if payload.note_text is not None and payload.note_text.strip():
        note = Note(
            ticket_id=ticket_id,
            note_text=payload.note_text.strip(),
            created_by=current_user.id,
        )
        db.add(note)

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)

    return TicketUpdateResponse(success=True, updated_at=ticket.updated_at)
