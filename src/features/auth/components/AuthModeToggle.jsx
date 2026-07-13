import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MODES = [
  { label: 'Sign In', to: '/login' },
  { label: 'Sign Up', to: '/register' },
]

export function AuthModeToggle({ className }) {
  const { pathname } = useLocation()

  return (
    <div className={cn('inline-flex items-center self-center rounded-full bg-muted p-1', className)}>
      {MODES.map((mode) => {
        const isActive = pathname === mode.to
        return (
          <Link
            key={mode.to}
            to={mode.to}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full transition-colors',
                isActive ? 'bg-primary' : 'bg-muted-foreground/40',
              )}
            />
            {mode.label}
          </Link>
        )
      })}
    </div>
  )
}
