import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'))

  const signIn = useCallback((accessToken) => {
    localStorage.setItem('crm_token', accessToken)
    setToken(accessToken)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('crm_token')
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
