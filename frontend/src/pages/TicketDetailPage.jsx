import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicket, updateTicket } from '../api'
import { TopBar } from '../components/TopBar'
import { StatusBadge } from '../components/StatusBadge'
import { toast } from '../components/Toast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { ArrowLeft, User, Mail } from 'lucide-react'

const STATUSES = ['Open', 'In Progress', 'Closed']

function statusBtnClass(s, current) {
  if (s !== current) return 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-950'
  if (s === 'Open')        return 'bg-blue-50 text-blue-700 border-blue-200'
  if (s === 'In Progress') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (s === 'Closed')      return 'bg-gray-100 text-gray-600 border-gray-300'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function NoteSkeleton() {
  return (
    <div className="px-5 py-3.5 border-b border-gray-200 last:border-b-0">
      <Skeleton className="h-3.5 w-[90%] mb-2" />
      <Skeleton className="h-3.5 w-[60%] mb-2" />
      <Skeleton className="h-[11px] w-[100px]" />
    </div>
  )
}

function DetailSkeleton() {
  return (
    <>
      <Card className="p-5 mb-5">
        <Skeleton className="h-[11px] w-[70px] mb-2" />
        <Skeleton className="h-5 w-[55%] mb-3" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200">
              <Skeleton className="h-3 w-[120px]" />
            </div>
            <div className="p-5 flex flex-col gap-2.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-[85%]" />
              <Skeleton className="h-3.5 w-[70%]" />
            </div>
          </Card>
          <Card>
            <div className="px-5 py-4 border-b border-gray-200">
              <Skeleton className="h-3 w-20" />
            </div>
            <NoteSkeleton />
            <NoteSkeleton />
          </Card>
        </div>
        <Card className="h-[180px]" />
      </div>
    </>
  )
}

export default function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate     = useNavigate()

  const [ticket, setTicket]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving]     = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTicket(ticketId)
      .then((data) => { if (!cancelled) setTicket(data) })
      .catch(() => { if (!cancelled) navigate('/', { replace: true }) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ticketId, navigate])

  async function handleStatusChange(newStatus) {
    if (newStatus === ticket.status) return
    setStatusSaving(true)
    try {
      const result = await updateTicket(ticketId, { status: newStatus })
      setTicket((t) => ({ ...t, status: result.status }))
      toast(`Status updated to "${result.status}"`)
    } catch {
      toast('Failed to update status.')
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      await updateTicket(ticketId, { note_text: noteText.trim() })
      const newNote = {
        id: Date.now(),
        note_text: noteText.trim(),
        created_at: now,
      }
      setTicket((t) => ({ ...t, notes: [...(t.notes ?? []), newNote] }))
      setNoteText('')
      toast('Note added')
    } catch {
      toast('Failed to add note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar />

      <main className="max-w-[1100px] w-full mx-auto px-6 py-7">
        <button
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 bg-transparent border-none cursor-pointer p-0 mb-4 transition-colors hover:text-gray-950"
          onClick={() => navigate('/')}
          id="btn-back"
        >
          <ArrowLeft size={15} />
          All Tickets
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : ticket ? (
          <>
            {/* Ticket header */}
            <Card className="p-5 mb-5">
              <p className="font-mono text-[13px] font-medium text-gray-400 mb-1.5">{ticket.ticket_id}</p>
              <h1 className="text-lg font-semibold tracking-tight text-gray-950 mb-2.5">{ticket.subject}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={ticket.status} />
                <span className="text-[13px] text-gray-400">Opened {formatDate(ticket.created_at)}</span>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
              {/* Left column — description + notes */}
              <div className="flex flex-col gap-4">

                {/* Description */}
                <Card>
                  <Card.Header>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-sm text-gray-950 leading-relaxed whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </Card.Body>
                </Card>

                {/* Notes */}
                <Card>
                  <Card.Header>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                      Notes
                      {ticket.notes?.length > 0 && (
                        <span className="ml-2 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-500 px-[7px] py-[1px]">
                          {ticket.notes.length}
                        </span>
                      )}
                    </span>
                  </Card.Header>

                  {/* Existing notes — oldest first */}
                  <div className="flex flex-col">
                    {(!ticket.notes || ticket.notes.length === 0) ? (
                      <div className="py-6 px-5 text-center text-gray-400 text-sm">
                        No notes yet. Add the first one below.
                      </div>
                    ) : (
                      [...ticket.notes]
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map((note) => (
                          <div key={note.id} className="px-5 py-3.5 border-b border-gray-200 last:border-b-0">
                            <p className="text-sm text-gray-950 leading-relaxed whitespace-pre-wrap mb-1.5">
                              {note.note_text}
                            </p>
                            <time className="text-xs text-gray-400 font-mono" dateTime={note.created_at}>
                              {formatDateTime(note.created_at)}
                            </time>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Add note */}
                  <form className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2.5" onSubmit={handleAddNote}>
                    <textarea
                      id="note-textarea"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 shadow-xs outline-none transition-[border-color,box-shadow] duration-150 resize-y min-h-[72px] leading-relaxed placeholder:text-gray-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)] disabled:opacity-50"
                      placeholder="Add a note…"
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      disabled={saving}
                    />
                    <div className="flex justify-end">
                      <Button
                        id="btn-add-note"
                        type="submit"
                        disabled={saving || !noteText.trim()}
                      >
                        {saving ? 'Saving…' : 'Add Note'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Right column — customer info + status */}
              <div className="flex flex-col gap-4">

                {/* Customer */}
                <Card>
                  <Card.Header>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <div className="flex flex-col gap-1 mb-4 last:mb-0">
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <User size={14} /> Name
                      </span>
                      <span className="text-sm text-gray-950 leading-relaxed">{ticket.customer_name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <Mail size={14} /> Email
                      </span>
                      <a
                        href={`mailto:${ticket.customer_email}`}
                        className="text-sm text-blue-600 no-underline leading-relaxed"
                      >
                        {ticket.customer_email}
                      </a>
                    </div>
                  </Card.Body>
                </Card>

                {/* Status */}
                <Card>
                  <Card.Header>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </span>
                    {statusSaving && (
                      <span className="text-xs text-gray-400">Saving…</span>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <div className="flex flex-col gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          id={`status-btn-${s.toLowerCase().replace(' ', '-')}`}
                          className={`font-medium text-[13px] px-3 py-1.5 rounded-md border cursor-pointer transition-all duration-150 text-left justify-start
                            ${statusBtnClass(s, ticket.status)}`}
                          onClick={() => handleStatusChange(s)}
                          disabled={statusSaving}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

              </div>
            </div>
          </>
        ) : null}
      </main>
    </>
  )
}
