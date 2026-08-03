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

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
