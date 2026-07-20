import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { Headphones, ChevronRight, LogOut } from 'lucide-react'

export function TopBar() {
  const { signOut } = useAuth()
  const location = useLocation()

  // Build breadcrumb segments from the current path
  const isTicketDetail = /^\/tickets\/TKT-\d{3,}$/.test(location.pathname)

  return (
    <header className="h-[52px] flex items-center justify-between px-6 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 no-underline text-gray-950 shrink-0">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Headphones size={16} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">SupportDesk</span>
        </Link>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-400 ml-1">
          {isTicketDetail ? (
            <>
              <Link to="/" className="font-medium text-gray-500 no-underline hover:text-gray-950 transition-colors">
                Tickets
              </Link>
              <ChevronRight size={12} />
              <span className="text-gray-950 font-medium">{location.pathname.split('/').pop()}</span>
            </>
          ) : (
            <span className="text-gray-950">Tickets</span>
          )}
        </nav>
      </div>

      <Button variant="ghost" size="sm" onClick={signOut} id="btn-logout">
        <LogOut size={15} />
        Log out
      </Button>
    </header>
  )
}
