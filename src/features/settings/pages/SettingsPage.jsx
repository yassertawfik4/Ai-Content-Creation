import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenText,
  Check,
  ChevronRight,
  CircleUserRound,
  Clipboard,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  Laptop,
  Loader2,
  LockKeyhole,
  LogOut,
  Moon,
  MonitorCog,
  Palette,
  PlugZap,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  WandSparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { changePassword, getErrorMessage, updateUser } from '@/lib/authApi'
import { readUserPreferences, saveUserPreferences } from '@/lib/userPreferences'
import {
  passwordSettingsSchema,
  profileSettingsSchema,
} from '../schema/settingsSchema'

const inputClassName =
  'h-12 w-full rounded-2xl border border-[#d9cfe1] bg-white px-4 text-sm text-[#2f2735] shadow-[0_1px_2px_rgba(29,27,32,0.03)] outline-none transition placeholder:text-[#9a909f] focus:border-[#675094] focus:ring-4 focus:ring-[#675094]/10 disabled:bg-[#f5f1f7] disabled:text-[#7b7180]'

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
]

const accentPresets = [
  { color: '#4f378a', label: 'Aether violet' },
  { color: '#2563eb', label: 'Electric blue' },
  { color: '#0f766e', label: 'Ocean teal' },
  { color: '#15803d', label: 'Forest green' },
  { color: '#c2410c', label: 'Ember orange' },
  { color: '#be185d', label: 'Orchid pink' },
]

function initialsFor(name) {
  return String(name || 'A')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function SettingsBrand() {
  return (
    <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-[13px] bg-[#381e72] text-white shadow-[0_7px_18px_rgba(56,30,114,0.24)]">
      <span className="absolute -right-1 -top-2 size-6 rounded-full bg-[#b7f36b]" />
      <Sparkles className="relative size-5" strokeWidth={2.2} />
    </span>
  )
}

function SectionCard({ id, eyebrow, title, description, icon: Icon, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="scroll-mt-28 overflow-hidden rounded-[26px] border border-[#e0d7e5] bg-[#fffaff]/92 shadow-[0_14px_44px_rgba(55,38,65,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-4 border-b border-[#ece4ee] px-5 py-5 sm:px-7">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eee5f7] text-[#4f378a] ring-1 ring-[#ded0ea]">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#79688b]">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.35px] text-[#241d29]">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#716777]">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </motion.section>
  )
}

function FieldError({ id, message }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-[#a42f42]">
      {message}
    </p>
  ) : null
}

function PasswordField({ id, label, error, register, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#3a313f]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClassName} pr-12 ${error ? 'border-[#ba546c] focus:border-[#a42f42] focus:ring-[#a42f42]/10' : ''}`}
          {...register}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#746979] transition hover:bg-[#f1eaf4] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094]"
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

function StatusMessage({ state }) {
  return (
    <AnimatePresence mode="wait">
      {state?.message ? (
        <motion.div
          key={`${state.type}-${state.message}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role={state.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            state.type === 'error'
              ? 'border-[#efc5cf] bg-[#fff2f5] text-[#8f2942]'
              : 'border-[#cfe5bf] bg-[#f3faed] text-[#355f20]'
          }`}
        >
          {state.type === 'error' ? <LockKeyhole className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}
          <span>{state.message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function SettingsPage() {
  const { user, logout, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [profileStatus, setProfileStatus] = useState(null)
  const [passwordStatus, setPasswordStatus] = useState(null)
  const [preferences, setPreferences] = useState(readUserPreferences)
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { name: user?.name || '' },
  })
  const passwordForm = useForm({
    resolver: zodResolver(passwordSettingsSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  })

  useEffect(() => {
    profileForm.reset({ name: user?.name || '' })
  }, [profileForm, user?.name])

  const updatePreferences = (updates) => {
    setPreferences((current) => saveUserPreferences({ ...current, ...updates }))
  }

  const newPassword = useWatch({
    control: passwordForm.control,
    name: 'newPassword',
    defaultValue: '',
  })
  const strength = useMemo(() => {
    const checks = [
      newPassword.length >= 8,
      /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      /\d/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ]
    return checks.filter(Boolean).length
  }, [newPassword])

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileStatus(null)
    try {
      await updateUser(values)
      await refreshSession({ disableCookieCache: true })
      setProfileStatus({ type: 'success', message: 'Your profile name has been updated.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: getErrorMessage(error) })
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordStatus(null)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      })
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: values.revokeOtherSessions,
      })
      setPasswordStatus({
        type: 'success',
        message: values.revokeOtherSessions
          ? 'Password changed. Other signed-in devices have been disconnected.'
          : 'Your password has been changed successfully.',
      })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: getErrorMessage(error) })
    }
  })

  const copyAccountId = async () => {
    if (!user?.id) return
    await navigator.clipboard.writeText(user.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await logout()
    navigate('/')
  }

  const joinedDate = user?.createdAt
    ? new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(user.createdAt))
    : 'Recently'

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8f2f8] text-[#241d29]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 top-20 size-[420px] rounded-full bg-[#dfcef1]/35 blur-3xl" />
        <div className="absolute -left-40 top-[40%] size-[360px] rounded-full bg-[#f1cad5]/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(#8e799d_0.7px,transparent_0.7px)] [background-size:20px_20px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[#ded7e3]/90 bg-[#fffaff]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Sada home">
            <SettingsBrand />
            <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
              Sada
            </span>
          </Link>
          <span className="hidden h-6 w-px bg-[#dfd6e2] sm:block" />
          <span className="text-sm font-medium text-[#6e6374]">Account settings</span>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[1240px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <aside className="lg:sticky lg:top-[104px] lg:h-fit lg:self-start">
          <div className="overflow-hidden rounded-[26px] border border-[#e0d7e5] bg-[#fffaff]/90 p-4 shadow-[0_14px_44px_rgba(55,38,65,0.07)] backdrop-blur-xl">
            <div className="settings-profile-summary rounded-[21px] bg-[linear-gradient(145deg,#eee2f6,#f9edf1)] p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#4f378a] text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.24)]">
                  {initialsFor(user?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#2b2230]">{user?.name || 'Sada user'}</p>
                  <p className="mt-0.5 truncate text-xs text-[#796f7e]">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-[#46692e]">
                <BadgeCheck className="size-4" />
                {user?.emailVerified ? 'Verified account' : 'Email verification pending'}
              </div>
            </div>

            <nav className="mt-3 space-y-1" aria-label="Settings sections">
              {[
                ['profile', UserRound, 'Profile'],
                ['security', KeyRound, 'Password & security'],
                ['preferences', MonitorCog, 'Preferences'],
                ['account', CircleUserRound, 'Account details'],
              ].map(([href, Icon, label]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#625768] transition hover:bg-[#f1eaf4] hover:text-[#4f378a]"
                >
                  <Icon className="size-[18px]" />
                  {label}
                  <ChevronRight className="ml-auto size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 px-1 pb-2 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#806f90]">Personal workspace</p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-1.1px] text-[#241d29] sm:text-[40px] sm:leading-[1.08]">
                Make Sada feel like yours.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#706576]">
                Keep your identity current, strengthen your sign-in, and tune the interface to the way you work.
              </p>
            </div>
            <Link
              to="/generate"
              className="inline-flex min-h-11 shrink-0 self-end items-center gap-2 rounded-2xl border border-[#d9cfe1] bg-white px-4 text-sm font-semibold text-[#4f378a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#bca9cf] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] sm:self-start"
            >
              <ArrowLeft className="size-4" />
              Back to workspace
            </Link>
          </motion.div>

          <SectionCard
            id="profile"
            eyebrow="Identity"
            title="Profile information"
            description="This name appears in your account menu and throughout your workspace."
            icon={UserRound}
          >
            <form onSubmit={saveProfile} className="space-y-5" noValidate>
              <StatusMessage state={profileStatus} />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-name" className="mb-2 block text-sm font-semibold text-[#3a313f]">Display name</label>
                  <input
                    id="settings-name"
                    autoComplete="name"
                    aria-invalid={Boolean(profileForm.formState.errors.name)}
                    aria-describedby={profileForm.formState.errors.name ? 'settings-name-error' : undefined}
                    className={inputClassName}
                    {...profileForm.register('name')}
                  />
                  <FieldError id="settings-name-error" message={profileForm.formState.errors.name?.message} />
                </div>
                <div>
                  <label htmlFor="settings-email" className="mb-2 block text-sm font-semibold text-[#3a313f]">Email address</label>
                  <input id="settings-email" value={user?.email || ''} readOnly className={inputClassName} />
                  <p className="mt-1.5 text-xs text-[#7b7180]">Your sign-in email is managed securely and cannot be changed here.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#4f378a] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d4597] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {profileForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {profileForm.formState.isSubmitting ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            id="security"
            eyebrow="Security"
            title="Change your password"
            description="Use a unique password you do not use for another account."
            icon={KeyRound}
          >
            <form onSubmit={savePassword} className="space-y-5" noValidate>
              <StatusMessage state={passwordStatus} />
              <PasswordField
                id="current-password"
                label="Current password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                register={passwordForm.register('currentPassword')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="New password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.newPassword?.message}
                  register={passwordForm.register('newPassword')}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  register={passwordForm.register('confirmPassword')}
                />
              </div>

              <div className="rounded-2xl border border-[#e4dae8] bg-[#faf6fb] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#413647]">Password strength</p>
                  <span className="text-xs font-bold text-[#6c5d75]">
                    {['Start typing', 'Weak', 'Fair', 'Good', 'Strong'][strength]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => (
                    <span key={level} className={`h-1.5 rounded-full transition-colors ${strength >= level ? (strength >= 4 ? 'bg-[#5c7c3d]' : 'bg-[#7b5aa5]') : 'bg-[#e5dce8]'}`} />
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-[#766b7b]">A strong password mixes upper and lowercase letters, numbers, and symbols.</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e2d8e6] bg-white p-4 transition hover:border-[#cbb9d5]">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#4f378a]"
                  {...passwordForm.register('revokeOtherSessions')}
                />
                <span>
                  <span className="block text-sm font-semibold text-[#3a313f]">Sign out other devices</span>
                  <span className="mt-1 block text-xs leading-5 text-[#766b7b]">Recommended if you are changing your password because of suspicious activity.</span>
                </span>
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#4f378a] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d4597] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-55"
                >
                  {passwordForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            id="preferences"
            eyebrow="Comfort"
            title="Interface preferences"
            description="Choose how Sada looks and feels across this browser."
            icon={MonitorCog}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9f4] text-[#5d4772]">
                    <Sun className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#362d3b]">Theme</p>
                    <p className="mt-1 text-xs leading-5 text-[#766b7b]">Use a light canvas, a dark workspace, or follow your device.</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Color theme">
                  {themeOptions.map(({ value, label, icon: Icon }) => {
                    const selected = preferences.theme === value
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updatePreferences({ theme: value })}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] focus-visible:ring-offset-2 ${selected ? 'border-[#4f378a] bg-[#f0e9f7] text-[#4f378a] shadow-sm' : 'border-[#e4dae8] bg-[#faf7fb] text-[#655b6a] hover:border-[#c8b8d1] hover:bg-white'}`}
                      >
                        <Icon className="size-[17px]" />
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: preferences.accentColor }}
                  >
                    <Palette className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#362d3b]">Accent color</p>
                    <p className="mt-1 text-xs leading-5 text-[#766b7b]">Tint backgrounds, surfaces, buttons, links, and focus states.</p>
                  </div>
                  <code className="hidden rounded-lg bg-[#f4eef6] px-2 py-1 text-[11px] font-semibold uppercase text-[#6e6374] sm:block">
                    {preferences.accentColor}
                  </code>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {accentPresets.map(({ color, label }) => {
                    const selected = preferences.accentColor === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updatePreferences({ accentColor: color })}
                        className="relative flex size-10 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_1px_#d9cfe1] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] focus-visible:ring-offset-2"
                        style={{ backgroundColor: color }}
                        aria-label={`Use ${label}`}
                        aria-pressed={selected}
                        title={label}
                      >
                        {selected ? <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} /> : null}
                      </button>
                    )
                  })}
                  <label className="group relative flex h-10 min-w-10 cursor-pointer items-center gap-2 rounded-full border border-[#d9cfe1] bg-[#faf7fb] pr-3 text-xs font-semibold text-[#5f5565] transition hover:border-[#bbaac7] hover:bg-white focus-within:ring-2 focus-within:ring-[#675094] focus-within:ring-offset-2">
                    <span
                      className="ml-1 flex size-8 items-center justify-center rounded-full border-2 border-white shadow-sm"
                      style={{ background: `conic-gradient(from 90deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)` }}
                    >
                      <Palette className="size-3.5 text-white drop-shadow" />
                    </span>
                    Custom
                    <input
                      type="color"
                      value={preferences.accentColor}
                      onChange={(event) => updatePreferences({ accentColor: event.target.value })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Choose a custom accent color"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-[#e3d9e7] bg-white p-4 sm:flex-row sm:items-center sm:p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9f4] text-[#5d4772]">
                  <WandSparkles className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#362d3b]">Reduce interface motion</p>
                  <p className="mt-1 text-xs leading-5 text-[#766b7b]">Minimizes page transitions and decorative animation throughout Sada.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.reduceMotion}
                  onClick={() => updatePreferences({ reduceMotion: !preferences.reduceMotion })}
                  className={`relative h-7 w-12 shrink-0 self-end rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] focus-visible:ring-offset-2 sm:self-auto ${preferences.reduceMotion ? 'bg-[#4f378a]' : 'bg-[#cfc4d3]'}`}
                >
                  <span className={`absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${preferences.reduceMotion ? 'translate-x-6' : 'translate-x-1'}`} />
                  <span className="sr-only">Reduce interface motion</span>
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="account"
            eyebrow="Account"
            title="Account details"
            description="Useful identity information and shortcuts for your workspace."
            icon={CircleUserRound}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#817487]">Member since</p>
                <p className="mt-2 text-base font-semibold text-[#332a38]">{joinedDate}</p>
              </div>
              <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#817487]">Account ID</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate text-xs text-[#4e4453]">{user?.id || 'Unavailable'}</code>
                  <button
                    type="button"
                    onClick={copyAccountId}
                    disabled={!user?.id}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f1eaf4] text-[#5e4775] transition hover:bg-[#e8ddef]"
                    aria-label="Copy account ID"
                  >
                    {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['/generate', Layers3, 'Generate', 'Create a campaign'],
                ['/connectors', PlugZap, 'Connectors', 'Manage integrations'],
                ['/knowledge', BookOpenText, 'Knowledge', 'Tune brand context'],
              ].map(([to, Icon, label, detail]) => (
                <Link key={to} to={to} className="group rounded-2xl border border-[#e3d9e7] bg-[#faf6fb] p-4 transition hover:-translate-y-0.5 hover:border-[#c8b6d3] hover:bg-white hover:shadow-md">
                  <Icon className="size-5 text-[#5a4270]" />
                  <p className="mt-3 text-sm font-bold text-[#392f3e]">{label}</p>
                  <p className="mt-1 text-xs text-[#7a6f7f]">{detail}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#f0cfd7] bg-[#fff5f7] p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#713246]">Sign out of this device</p>
                <p className="mt-1 text-xs leading-5 text-[#8b6070]">You will need your email and password to return.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#f8dfe6] px-4 text-sm font-bold text-[#972d4b] transition hover:bg-[#f3ccd7] disabled:cursor-wait disabled:opacity-60"
              >
                {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  )
}
