import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, Loader2, LogOut, Settings } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLogo } from '@/components/AppLogo'

export function LoadingRing({ className = 'size-4' }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden="true">
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-25" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current" />
    </span>
  )
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Generate', to: '/generate' },
  { label: 'Connectors', to: '/connectors' },
  { label: 'Publishing', to: '/publishing' },
  { label: 'Knowledge', to: '/knowledge' },
]

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileMenuRef = useRef(null)
  const profileButtonRef = useRef(null)

  useEffect(() => {
    if (!profileMenuOpen) return undefined

    const closeOnOutsidePress = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setProfileMenuOpen(false)
      profileButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileMenuOpen])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await logout()
    navigate('/')
  }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-[#ded7e3] bg-[#fffaff]/95 px-4 backdrop-blur-xl sm:px-6">
      <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Sada home">
        <AppLogo />
        <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
          Sada
        </span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 md:flex lg:gap-7 xl:gap-8">
        {navLinks.map((link) => {
          const isActive = link.to === '/'
            ? location.pathname === '/'
            : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
          const className = `whitespace-nowrap text-[15px] transition-colors lg:text-base ${isActive ? 'font-semibold text-[#381e72]' : 'text-[#6a6170] hover:text-[#381e72]'}`
          return link.to ? (
            <Link key={link.to} to={link.to} className={className} aria-current={isActive ? 'page' : undefined}>
              {link.label}
            </Link>
          ) : (
            <a key={link.href} href={link.href} className={className}>
              {link.label}
            </a>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <div ref={profileMenuRef} className="relative">
          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => setProfileMenuOpen((current) => !current)}
            className="account-trigger flex h-11 items-center gap-1 rounded-xl px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            aria-controls="account-menu"
          >
            <span className="user-avatar flex size-9 items-center justify-center rounded-full text-xs font-bold">
              {initials || 'A'}
            </span>
            <ChevronDown className={`size-3.5 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          <AnimatePresence>
            {profileMenuOpen ? (
              <motion.div
                id="account-menu"
                role="menu"
                aria-label="Account menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 top-[calc(100%+7px)] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-[#ded7e3] bg-[#fffaff] p-2 shadow-[0_16px_40px_rgba(45,31,52,0.16)]"
              >
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-[#201a25]">{user?.name || 'Sada user'}</p>
                  {user?.email ? <p className="mt-0.5 truncate text-xs text-[#7b7180]">{user.email}</p> : null}
                </div>
                <div className="my-1 h-px bg-[#e7dfe9]" />
                {user?.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="account-menu-accent-item flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094]"
                  >
                    <LayoutDashboard className="size-[17px]" />
                    Admin dashboard
                  </Link>
                ) : null}
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="account-menu-accent-item flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094]"
                >
                  <Settings className="size-[17px]" />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-[#9f2949] transition-colors hover:bg-[#fbe9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoggingOut ? <Loader2 className="size-[17px] animate-spin" /> : <LogOut className="size-[17px]" />}
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
