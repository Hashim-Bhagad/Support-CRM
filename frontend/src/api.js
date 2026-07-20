import axios from 'axios'

// In development: VITE_API_BASE_URL is empty → requests go through Vite proxy
// In production:  VITE_API_BASE_URL = "https://api.yoursite.com" → direct calls
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/'

const api = axios.create({
  baseURL: API_BASE,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export async function login(email, password) {
  const params = new URLSearchParams({ username: email, password })
  const { data } = await api.post('/api/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data // { access_token, token_type }
}

// ── Tickets ──────────────────────────────────────────────────
export async function listTickets({ status, search } = {}) {
  const params = {}
  if (status)  params.status = status
  if (search)  params.search = search
  const { data } = await api.get('/api/tickets', { params })
  return data
}

export async function createTicket(payload) {
  const { data } = await api.post('/api/tickets', payload)
  return data // { ticket_id, created_at }
}

export async function getTicket(ticketId) {
  const { data } = await api.get(`/api/tickets/${ticketId}`)
  return data
}

export async function updateTicket(ticketId, payload) {
  // payload: { status?, note_text? }
  const { data } = await api.put(`/api/tickets/${ticketId}`, payload)
  return data
}

export default api
