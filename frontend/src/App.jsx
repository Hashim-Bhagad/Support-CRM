import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'
import LoginPage       from './pages/LoginPage'
import TicketListPage  from './pages/TicketListPage'
import TicketDetailPage from './pages/TicketDetailPage'
import './index.css'

/** Wrap protected routes — redirect to /login if not authenticated */
function Protected({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Redirect logged-in users away from /login */
function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <TicketListPage />
          </Protected>
        }
      />
      <Route
        path="/tickets/:ticketId"
        element={
          <Protected>
            <TicketDetailPage />
          </Protected>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
