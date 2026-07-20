import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listTickets } from '../api'
import { TopBar } from '../components/TopBar'
import { StatusBadge } from '../components/StatusBadge'
import { SkeletonRows } from '../components/SkeletonRows'
import { CreateTicketModal } from '../components/CreateTicketModal'
import { Button } from '../components/ui/Button'
import { Search, Plus, Inbox } from 'lucide-react'

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Closed']

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function TicketListPage() {
  const navigate = useNavigate()

  const [tickets, setTickets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showModal, setShowModal]       = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilter !== 'All') params.status = activeFilter
      if (search.trim())          params.search = search.trim()
      const data = await listTickets(params)
      setTickets(data)
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter, search])

  // Debounce search — refetch 350ms after user stops typing
  useEffect(() => {
    const id = setTimeout(fetchTickets, 350)
    return () => clearTimeout(id)
  }, [fetchTickets])

  function handleCreated() {
    setShowModal(false)
    fetchTickets()
  }

  return (
    <>
      <TopBar />

      <main className="max-w-[1100px] w-full mx-auto px-6 py-7">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-950">Tickets</h1>
            {!loading && (
              <p className="text-[13px] text-gray-400 mt-0.5">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}{activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
              </p>
            )}
          </div>
          <Button
            id="btn-new-ticket"
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} strokeWidth={2.5} />
            New Ticket
          </Button>
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search size={15} />
            </div>
            <input
              id="search-tickets"
              type="search"
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-950 shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]"
              placeholder="Search by name, ID, email, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tickets"
            />
          </div>

          <div className="flex gap-0.5 p-0.5 bg-gray-100 border border-gray-200 rounded-lg" role="group" aria-label="Status filter">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase().replace(' ', '-')}`}
                className={`font-medium text-[13px] rounded-md px-3 py-1 cursor-pointer whitespace-nowrap transition-colors duration-150
                  ${activeFilter === f
                    ? 'bg-white text-gray-950 shadow-xs'
                    : 'bg-transparent text-gray-500 hover:text-gray-950 hover:bg-black/5'
                  }`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse" aria-label="Ticket list">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5 bg-gray-50 whitespace-nowrap">ID</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5 bg-gray-50 whitespace-nowrap">Customer</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5 bg-gray-50 whitespace-nowrap">Subject</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5 bg-gray-50 whitespace-nowrap">Status</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5 bg-gray-50 whitespace-nowrap">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={7} />
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0 border-none">
                    <div className="py-16 px-6 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-1">
                        <Inbox size={22} strokeWidth={1.5} />
                      </div>
                      <p className="text-[15px] font-semibold text-gray-950">No tickets found</p>
                      <p className="text-sm text-gray-500 max-w-[300px] leading-relaxed">
                        {search || activeFilter !== 'All'
                          ? 'Try adjusting your search or filter.'
                          : 'Create your first ticket to get started.'}
                      </p>
                      {!search && activeFilter === 'All' && (
                        <Button onClick={() => setShowModal(true)} className="mt-1">
                          <Plus size={14} strokeWidth={2.5} />
                          New Ticket
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/tickets/${ticket.ticket_id}`)}
                    className="transition-colors duration-100 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    aria-label={`Ticket ${ticket.ticket_id}: ${ticket.subject}`}
                  >
                    <td className="px-4 py-[13px] text-sm text-gray-500 border-b border-gray-200 align-middle">
                      <span className="font-mono text-[13px] font-medium text-gray-500">{ticket.ticket_id}</span>
                    </td>
                    <td className="px-4 py-[13px] text-sm text-gray-500 border-b border-gray-200 align-middle">
                      {ticket.customer_name}
                    </td>
                    <td className="px-4 py-[13px] text-sm font-medium text-gray-950 border-b border-gray-200 align-middle max-w-[300px] truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-[13px] text-sm border-b border-gray-200 align-middle">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-[13px] text-[13px] text-gray-400 border-b border-gray-200 align-middle whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
