import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '@/lib/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [storedToken] = useState(() => authApi.getStoredTokens().accessToken)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(storedToken))

  useEffect(() => {
    if (!storedToken) return undefined

    let active = true
    authApi
      .getCurrentUser(storedToken)
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        authApi.storeAuthData({ user: currentUser })
      })
      .catch(() => {
        if (active) authApi.clearAuthData()
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [storedToken])

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password })
    authApi.storeAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const data = await authApi.register({ name, email, password })
    authApi.storeAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    const { accessToken } = authApi.getStoredTokens()
    authApi.clearAuthData()
    setUser(null)
    if (accessToken) {
      authApi.logout(accessToken).catch(() => {})
    }
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
