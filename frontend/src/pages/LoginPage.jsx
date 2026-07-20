import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Headphones, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim())    { setError('Email is required.'); return }
    if (!password)        { setError('Password is required.'); return }

    setLoading(true)
    try {
      const { access_token } = await login(email.trim(), password)
      signIn(access_token)
      navigate('/', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || 'Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-sm p-9 shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-7">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Headphones size={18} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-gray-950">
            SupportDesk
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tighter text-gray-950 mb-1.5">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">Sign in to your agent account to continue.</p>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-[13px] text-red-800 leading-relaxed mb-4" role="alert" id="login-error">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="agent@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            disabled={loading}
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />

          <Button
            id="btn-login"
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Log In'}
          </Button>
        </form>

        <p className="mt-5 text-xs text-gray-400 text-center leading-relaxed">
          Internal tool — contact your administrator for access.
        </p>
      </Card>
    </main>
  )
}
