import { useState, useEffect } from 'react'
import { createTicket } from '../api'
import { toast } from './Toast'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Card } from './ui/Card'
import { X } from 'lucide-react'

const EMPTY = { customerName: '', customerEmail: '', subject: '', description: '' }

export function CreateTicketModal({ onClose, onCreated }) {
  const [fields, setFields]   = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function set(key, val) {
    setFields((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!fields.customerName.trim())  e.customerName  = 'Customer name is required.'
    if (!fields.customerEmail.trim()) e.customerEmail = 'Customer email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.customerEmail))
      e.customerEmail = 'Enter a valid email address.'
    if (!fields.subject.trim())       e.subject       = 'Subject is required.'
    if (!fields.description.trim())   e.description   = 'Description is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const result = await createTicket({
        customer_name:  fields.customerName.trim(),
        customer_email: fields.customerEmail.trim(),
        subject:        fields.subject.trim(),
        description:    fields.description.trim(),
      })
      toast(`Ticket ${result.ticket_id} created`)
      onCreated(result)
    } catch {
      toast('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-100 flex items-start justify-center p-4 pt-15 overflow-y-auto"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <Card className="w-full max-w-lg animate-modal-in">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-base font-semibold tracking-tight text-gray-950" id="modal-title">
            New Ticket
          </h2>
          <button
            className="bg-transparent border-none cursor-pointer text-gray-400 rounded-md p-1 flex items-center justify-center transition-colors hover:bg-gray-100 hover:text-gray-950"
            onClick={onClose}
            aria-label="Close dialog"
            id="btn-modal-close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 flex flex-col gap-3.5">
            <Input
              id="ct-name"
              label="Customer Name"
              placeholder="Full name"
              value={fields.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              error={errors.customerName}
              disabled={loading}
            />

            <Input
              id="ct-email"
              label="Customer Email"
              type="email"
              placeholder="customer@example.com"
              value={fields.customerEmail}
              onChange={(e) => set('customerEmail', e.target.value)}
              error={errors.customerEmail}
              disabled={loading}
            />

            <Input
              id="ct-subject"
              label="Subject"
              placeholder="Brief summary of the issue"
              value={fields.subject}
              onChange={(e) => set('subject', e.target.value)}
              error={errors.subject}
              disabled={loading}
            />

            <Textarea
              id="ct-description"
              label="Description"
              placeholder="Describe the customer's issue in detail…"
              rows={4}
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
              error={errors.description}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
            <Button
              id="btn-cancel-ticket"
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              id="btn-create-ticket"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
