import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '@/lib/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async (options = {}) => {
    const data = await authApi.getSession(options)
    setUser(data?.user ?? null)
    return data
  }, [])

  useEffect(() => {
    let active = true
    authApi
      .getSession()
      .then((data) => {
        if (active) setUser(data?.user ?? null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshSession])

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await authApi.signInEmail({
      email,
      password,
      callbackURL: window.location.origin,
      rememberMe,
    })
    setUser(data?.user ?? null)
    return data?.user ?? null
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const data = await authApi.signUpEmail({
      name,
      email,
      password,
      callbackURL: window.location.origin,
    })
    setUser(null)
    return data?.user ?? null
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.signOut()
    } catch {
      // The local session state must still be cleared if the server is unreachable.
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, register, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
