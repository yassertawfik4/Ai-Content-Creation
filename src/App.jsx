import { AuthProvider } from '@/contexts/AuthContext'
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary'
import { AppRoutes } from '@/app/router/AppRoutes'

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
