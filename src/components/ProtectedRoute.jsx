import { Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    )
  }

  return children
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace state={{ adminAccessDenied: true }} />
  }

  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    const from = location.state?.from
    const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
      ? from
      : '/'
    return <Navigate to={destination} replace />
  }

  return children
}
