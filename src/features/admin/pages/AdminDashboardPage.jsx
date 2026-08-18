import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowUpDown,
  ArrowUpRight,
  BadgeDollarSign,
  BookOpenText,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Database,
  FileText,
  FolderKanban,
  Gauge,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { useAuth } from '@/hooks/useAuth'
import { getAdminUserAnalytics } from '@/lib/adminApi'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

const numberFormatter = new Intl.NumberFormat('en-US')
const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})
const costFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

function formatMoney(cents) {
  return moneyFormatter.format((Number(cents) || 0) / 100)
}

function formatCost(value) {
  return costFormatter.format(Number(value) || 0)
}

function humanize(value) {
  if (value === null || value === undefined || value === '') return 'Unassigned'
  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function initials(name) {
  return String(name || 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function dateLabel(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const projectSortOptions = [
  { value: 'campaigns', label: 'Highest campaigns' },
  { value: 'cost', label: 'Highest cost' },
  { value: 'recent', label: 'Most recent' },
]

function projectTimestamp(project) {
  const timestamp = Date.parse(project.lastExecutionAt || '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function sortProjects(projects, sortBy) {
  return [...projects].sort((left, right) => {
    let difference

    if (sortBy === 'cost') {
      const leftHasCost = Number(left.pricedExecutions) > 0
      const rightHasCost = Number(right.pricedExecutions) > 0

      if (leftHasCost !== rightHasCost) return leftHasCost ? -1 : 1
      difference = Number(right.estimatedCostUsd || 0) - Number(left.estimatedCostUsd || 0)
    } else if (sortBy === 'recent') {
      difference = projectTimestamp(right) - projectTimestamp(left)
    } else {
      difference = Number(right.campaignCount || 0) - Number(left.campaignCount || 0)
    }

    if (difference !== 0) return difference

    const recentDifference = projectTimestamp(right) - projectTimestamp(left)
    if (recentDifference !== 0) return recentDifference

    return String(left.name || '').localeCompare(String(right.name || ''))
  })
}

function StatusDot({ value }) {
  const normalized = String(value || '').toUpperCase()
  const color = normalized.includes('FAIL') || normalized.includes('CANCEL') || normalized.includes('PAST_DUE')
    ? 'bg-[#d94868]'
    : normalized.includes('READY') || normalized.includes('ACTIVE') || normalized.includes('APPROVED') || normalized.includes('PUBLISH')
      ? 'bg-[#6e9c35]'
      : normalized.includes('RUN') || normalized.includes('TRIAL')
        ? 'bg-[#4f76c7]'
        : 'bg-[#d29a30]'
  return <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
}

function MetricCard({ icon: Icon, eyebrow, value, note, tone = 'plum', delay = 0 }) {
  const tones = {
    plum: 'bg-[#4f378a] text-white shadow-[0_18px_40px_rgba(79,55,138,.2)]',
    lime: 'bg-[#dff6b5] text-[#253313] shadow-[0_18px_40px_rgba(63,85,24,.12)]',
    rose: 'bg-[#f5dce5] text-[#4b2532] shadow-[0_18px_40px_rgba(113,52,72,.1)]',
    paper: 'border border-[#e3dae6] bg-[#fffaff] text-[#271f2d] shadow-[0_16px_40px_rgba(54,38,62,.07)]',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay }}
      className={`relative min-h-40 overflow-hidden rounded-[26px] p-5 ${tones[tone]}`}
    >
      <span className="absolute -right-7 -top-8 size-28 rounded-full border border-current opacity-[.08]" />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[.17em] opacity-70">{eyebrow}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-current/10">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="relative mt-5 font-display text-[34px] font-semibold leading-none tracking-[-1.3px]">{value}</p>
      <p className="relative mt-3 text-xs font-medium leading-5 opacity-70">{note}</p>
    </motion.article>
  )
}

function DistributionCard({ title, icon: Icon, entries = [], labelKey, total, footer }) {
  const max = Math.max(...entries.map((entry) => Number(entry.count) || 0), 1)

  return (
    <article className="rounded-[24px] border border-[#e3dae6] bg-[#fffaff] p-5 shadow-[0_12px_34px_rgba(54,38,62,.055)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#eee7f5] text-[#4f378a]">
            <Icon className="size-[17px]" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold tracking-[-.2px] text-[#2d2532]">{title}</h3>
        </div>
        {total !== undefined ? <span className="text-xl font-semibold text-[#2d2532]">{formatNumber(total)}</span> : null}
      </div>

      <div className="mt-5 space-y-4">
        {entries.length ? entries.map((entry) => {
          const label = entry[labelKey]
          const width = Math.max(4, ((Number(entry.count) || 0) / max) * 100)
          return (
            <div key={`${label ?? 'none'}-${entry.count}`}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                <span className="flex min-w-0 items-center gap-2 font-semibold text-[#544b59]">
                  <StatusDot value={label} />
                  <span className="truncate">{humanize(label)}</span>
                </span>
                <span className="font-bold text-[#302735]">{formatNumber(entry.count)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#eee8ef]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#4f378a,#896caf)]"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        }) : (
          <div className="rounded-2xl border border-dashed border-[#ddd3e1] px-4 py-7 text-center text-xs text-[#84798a]">
            No records yet
          </div>
        )}
      </div>
      {footer ? <div className="mt-5 border-t border-[#eee7f0] pt-4 text-xs text-[#766b7c]">{footer}</div> : null}
    </article>
  )
}

function SplitStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-[#f4eef6] p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7e7087]">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-.6px] text-[#302735]">{formatNumber(value)}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#806d91]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-.7px] text-[#271f2d]">{title}</h2>
      </div>
      {description ? <p className="max-w-xl text-xs leading-5 text-[#766b7c] sm:text-right">{description}</p> : null}
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#4f378a] text-white shadow-[0_14px_34px_rgba(79,55,138,.22)]">
          <Loader2 className="size-6 animate-spin" />
        </span>
        <p className="mt-4 text-sm font-semibold text-[#4e4554]">Assembling platform intelligence…</p>
      </div>
    </div>
  )
}

function UserAnalyticsDrawer({ userId, onClose }) {
  const [state, setState] = useState({ data: null, error: '' })
  const [projectSort, setProjectSort] = useState('campaigns')

  useEffect(() => {
    const controller = new AbortController()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)

    getAdminUserAnalytics(userId, { signal: controller.signal })
      .then((data) => setState({ data, error: '' }))
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setState({ data: null, error: error?.message || 'Unable to load this user.' })
        }
      })

    return () => {
      controller.abort()
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, userId])

  const data = state.data
  const selectedUser = data?.user
  const subscription = selectedUser?.subscription
  const plan = subscription?.plan
  const sortedProjects = useMemo(
    () => sortProjects(data?.projects || [], projectSort),
    [data?.projects, projectSort],
  )

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
    >
      <button type="button" className="absolute inset-0 bg-[#160c20]/55 backdrop-blur-sm" onClick={onClose} aria-label="Close user details" />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="User usage details"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="absolute inset-y-0 right-0 flex w-full max-w-[720px] flex-col overflow-hidden bg-[#faf6fb] shadow-[-24px_0_70px_rgba(31,17,39,.24)]"
      >
        <header className="flex min-h-20 items-center gap-4 border-b border-[#e3dae6] bg-[#fffaff]/90 px-5 backdrop-blur-xl sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#806d91]">User intelligence</p>
            <h2 className="mt-1 truncate text-lg font-bold tracking-[-.4px] text-[#2b2230]">Account usage & cost</h2>
          </div>
          <button type="button" onClick={onClose} className="ml-auto flex size-10 items-center justify-center rounded-xl border border-[#ded3e2] bg-white text-[#62556b] transition hover:bg-[#f0e9f3] hover:text-[#4f378a]" aria-label="Close user details">
            <X className="size-[18px]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {!data && !state.error ? (
            <div className="flex min-h-[55vh] items-center justify-center gap-2 text-sm font-semibold text-[#756979]">
              <Loader2 className="size-4 animate-spin" /> Loading user analytics…
            </div>
          ) : state.error ? (
            <div role="alert" className="rounded-3xl border border-[#edcad3] bg-[#fff2f5] p-6 text-sm text-[#8d334c]">{state.error}</div>
          ) : (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-[26px] bg-[#2d1b43] p-5 text-white shadow-[0_18px_44px_rgba(45,27,67,.2)] sm:p-6">
                <span className="absolute -right-16 -top-16 size-52 rounded-full border-[28px] border-[#dff6b5]/8" />
                <div className="relative flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#dff6b5] text-sm font-bold text-[#2c3a18]">{initials(selectedUser?.name || selectedUser?.email)}</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold tracking-[-.5px]">{selectedUser?.name}</h3>
                    <p className="mt-1 truncate text-xs text-white/55">{selectedUser?.email}</p>
                  </div>
                  <span className="ml-auto hidden rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-white/70 sm:block">{humanize(selectedUser?.role)}</span>
                </div>
                <div className="relative mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div><p className="text-white/40">Joined</p><p className="mt-1 font-semibold">{dateLabel(selectedUser?.createdAt)}</p></div>
                  <div><p className="text-white/40">Email</p><p className="mt-1 font-semibold">{selectedUser?.emailVerified ? 'Verified' : 'Pending'}</p></div>
                  <div><p className="text-white/40">Credits used</p><p className="mt-1 font-semibold">{formatNumber(selectedUser?.generationCreditsUsed)}</p></div>
                  <div><p className="text-white/40">Credit limit</p><p className="mt-1 font-semibold">{formatNumber(selectedUser?.generationCreditLimit)}</p></div>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
                <div className="rounded-[24px] border border-[#e1d7e5] bg-[#fffaff] p-5 shadow-[0_12px_32px_rgba(54,38,62,.055)]">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-[#eee6f4] text-[#4f378a]"><WalletCards className="size-[18px]" /></span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#8b7d91]">Subscription plan</p>
                      <p className="mt-1 text-lg font-bold text-[#302735]">{plan?.name || 'No paid plan'}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-[#eff7df] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#54702f]">{humanize(subscription?.status || 'FREE')}</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#756979]">
                    <div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#9a8fa0]">Billing</p><p className="mt-1 font-semibold text-[#4b414f]">{humanize(subscription?.billingInterval || 'Not applicable')}</p></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#9a8fa0]">Period ends</p><p className="mt-1 font-semibold text-[#4b414f]">{dateLabel(subscription?.currentPeriodEnd)}</p></div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-[#dff6b5] p-5 text-[#2c3a18] shadow-[0_12px_32px_rgba(66,89,24,.1)]">
                  <FolderKanban className="size-5" />
                  <p className="mt-5 text-[9px] font-bold uppercase tracking-[.15em] opacity-60">Owned projects</p>
                  <p className="mt-1 text-4xl font-semibold tracking-[-1.2px]">{formatNumber(data.totals.projectCount)}</p>
                  <p className="mt-2 text-xs font-medium opacity-65">{formatNumber(data.totals.campaignCount)} campaigns</p>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Input tokens', data.totals.inputTokens, FileText],
                  ['Output tokens', data.totals.outputTokens, Sparkles],
                  ['Executions', data.totals.executionCount, Bot],
                  ['Recorded cost', data.totals.pricedExecutions ? formatCost(data.totals.estimatedCostUsd) : 'Unavailable', CircleDollarSign],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="rounded-[20px] border border-[#e3dae6] bg-[#fffaff] p-4">
                    <Icon className="size-4 text-[#6f5291]" />
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[.12em] text-[#918598]">{label}</p>
                    <p className="mt-1 text-base font-bold tracking-[-.3px] text-[#302735]">{typeof value === 'number' ? formatNumber(value) : value}</p>
                  </div>
                ))}
              </section>

              {data.totals.missingAccountingExecutions ? (
                <div role="status" className="flex items-start gap-3 rounded-[20px] border border-[#ead9bf] bg-[#fff8eb] px-4 py-3 text-[#815626]">
                  <Coins className="mt-0.5 size-4 shrink-0" />
                  <p className="text-[11px] leading-5">
                    <strong>{formatNumber(data.totals.missingAccountingExecutions)} historical execution(s)</strong> have no recoverable usage record. Their tokens and cost are shown as unavailable—not as zero.
                  </p>
                </div>
              ) : null}

              <section className="overflow-hidden rounded-[26px] border border-[#e1d7e5] bg-[#fffaff] shadow-[0_12px_34px_rgba(54,38,62,.055)]">
                <div className="flex flex-col gap-3 border-b border-[#ece5ee] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#302735]">Cost by project</h3>
                    <p className="mt-1 text-[10px] text-[#837788]">Sort projects by campaign count, recorded cost, or latest run. Missing historical accounting is never reported as $0.</p>
                  </div>
                  <label className="relative shrink-0">
                    <span className="sr-only">Sort projects by</span>
                    <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#6f5291]" aria-hidden="true" />
                    <select
                      value={projectSort}
                      onChange={(event) => setProjectSort(event.target.value)}
                      className="min-h-9 appearance-none rounded-xl border border-[#ddd3e1] bg-[#f7f1f8] py-2 pl-8 pr-8 text-[10px] font-bold text-[#4c3d55] outline-none transition hover:border-[#bba9c6] hover:bg-[#f1e9f4] focus:border-[#6f5291] focus:ring-2 focus:ring-[#6f5291]/15"
                    >
                      {projectSortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#85758d]" aria-hidden="true" />
                  </label>
                </div>
                <div className="divide-y divide-[#eee7f0]">
                  {sortedProjects.length ? sortedProjects.map((project) => {
                    const hasRecordedUsage = project.recordedUsageExecutions > 0 || project.totalTokens > 0
                    const costLabel = project.pricedExecutions
                      ? formatCost(project.estimatedCostUsd)
                      : project.executionCount
                        ? 'Unavailable'
                        : 'No usage'

                    return (
                    <motion.div layout="position" key={project.id} className={hasRecordedUsage ? 'bg-[#fffaff] p-5' : 'bg-[#fcf9fc] p-5'}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-[#302735]">{project.name}</p>
                            <span className="rounded-full bg-[#f0e9f3] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-[#6f5291]">{humanize(project.status)}</span>
                            {hasRecordedUsage ? <span className="rounded-full bg-[#eff7df] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.12em] text-[#54702f]">Usage recorded</span> : null}
                          </div>
                          <p className="mt-1 text-[10px] text-[#887d8d]">{formatNumber(project.campaignCount)} campaigns · {formatNumber(project.executionCount)} executions · last run {dateLabel(project.lastExecutionAt)}</p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-lg font-bold tracking-[-.4px] text-[#302735]">{costLabel}</p>
                          {project.pricedExecutions ? <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[.11em] text-[#928697]">Recorded USD cost</p> : null}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-[#f6f1f7] px-3 py-2"><p className="text-[8px] font-bold uppercase tracking-[.1em] text-[#998d9e]">Input</p><p className="mt-1 text-xs font-bold">{hasRecordedUsage ? formatNumber(project.inputTokens) : '—'}</p></div>
                        <div className="rounded-xl bg-[#f6f1f7] px-3 py-2"><p className="text-[8px] font-bold uppercase tracking-[.1em] text-[#998d9e]">Output</p><p className="mt-1 text-xs font-bold">{hasRecordedUsage ? formatNumber(project.outputTokens) : '—'}</p></div>
                        <div className="rounded-xl bg-[#f6f1f7] px-3 py-2"><p className="text-[8px] font-bold uppercase tracking-[.1em] text-[#998d9e]">Total</p><p className="mt-1 text-xs font-bold">{hasRecordedUsage ? formatNumber(project.totalTokens) : '—'}</p></div>
                      </div>
                      {project.missingAccountingExecutions ? <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#9a6332]"><Coins className="size-3" /> Usage unavailable for {formatNumber(project.missingAccountingExecutions)} historical execution(s)</p> : null}
                    </motion.div>
                    )
                  }) : (
                    <div className="px-5 py-12 text-center text-xs text-[#837788]">This user has no projects yet.</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-[#e8dfe9] bg-[#f4eef6] px-5 py-4 text-xs sm:grid-cols-4">
                  <div><p className="text-[8px] font-bold uppercase tracking-[.11em] text-[#938799]">Total projects</p><p className="mt-1 font-bold">{formatNumber(data.totals.projectCount)}</p></div>
                  <div><p className="text-[8px] font-bold uppercase tracking-[.11em] text-[#938799]">Total input</p><p className="mt-1 font-bold">{formatNumber(data.totals.inputTokens)}</p></div>
                  <div><p className="text-[8px] font-bold uppercase tracking-[.11em] text-[#938799]">Total output</p><p className="mt-1 font-bold">{formatNumber(data.totals.outputTokens)}</p></div>
                  <div><p className="text-[8px] font-bold uppercase tracking-[.11em] text-[#938799]">Recorded cost</p><p className="mt-1 font-bold">{data.totals.pricedExecutions ? formatCost(data.totals.estimatedCostUsd) : 'Unavailable'}</p></div>
                </div>
              </section>
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  )
}

const navigation = [
  { id: 'home', icon: Home, label: 'Home', to: '/' },
  { id: 'overview', icon: Gauge, label: 'Overview', to: '/admin' },
  { id: 'audience', icon: Users, label: 'Audience', to: '/admin/audience' },
  { id: 'operations', icon: Bot, label: 'Operations', to: '/admin/operations' },
  { id: 'revenue', icon: BadgeDollarSign, label: 'Revenue', to: '/admin/revenue' },
]

const sectionMeta = {
  overview: {
    icon: LayoutDashboard,
    eyebrow: 'Admin intelligence',
    title: 'Every signal, in one view.',
    description: 'Monitor adoption, delivery health, content operations, and the revenue engine across Sada.',
  },
  audience: {
    icon: Users,
    eyebrow: 'Audience intelligence',
    title: 'Know the people behind the growth.',
    description: 'Explore users, workspaces, subscriptions, and account-level platform activity.',
  },
  operations: {
    icon: Bot,
    eyebrow: 'Operations intelligence',
    title: 'Keep every workflow moving.',
    description: 'Track content generation, knowledge, strategy runs, social delivery, and workflow health.',
  },
  revenue: {
    icon: BadgeDollarSign,
    eyebrow: 'Commercial intelligence',
    title: 'See how the business is performing.',
    description: 'Review plan economics, recurring revenue, successful payments, and top customers.',
  },
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const dashboard = useAdminDashboard()
  const overview = dashboard.overview
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/'
  const activeSection = navigation.find((item) => item.to === normalizedPath)?.id || 'overview'
  const activeMeta = sectionMeta[activeSection] || sectionMeta.overview
  const ActiveSectionIcon = activeMeta.icon
  const invalidRange = !dashboard.draftRange.from || !dashboard.draftRange.to || dashboard.draftRange.from > dashboard.draftRange.to
  const closeUserDetails = useCallback(() => setSelectedUserId(null), [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#f7f1f8] text-[#241d29]">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-hidden bg-[#241638] text-white shadow-[18px_0_50px_rgba(39,22,51,.16)] transition-[width,transform] duration-300 lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[272px]'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#a98dc4_0.65px,transparent_0.65px)] [background-size:18px_18px]" />
        <div className="pointer-events-none absolute -left-24 top-24 size-64 rounded-full bg-[#77549b]/25 blur-3xl" />
        <div className={`relative flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6 ${sidebarCollapsed ? 'lg:justify-center lg:px-3' : ''}`}>
          <Link to="/" className={`flex min-w-0 items-center gap-3 ${sidebarCollapsed ? 'lg:hidden' : ''}`} aria-label="Sada home">
            <AppLogo size="lg" />
            <div>
              <p className="text-base font-semibold tracking-[-.3px]">Sada</p>
              <p className="text-[9px] font-bold uppercase tracking-[.19em] text-[#cdb8df]">Control room</p>
            </div>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 text-white/65 hover:bg-white/10 lg:hidden" aria-label="Close navigation">
            <PanelLeftClose className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className={`hidden size-10 items-center justify-center rounded-xl border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white lg:flex ${sidebarCollapsed ? '' : 'ml-auto'}`}
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        </div>

        <nav className={`relative flex-1 space-y-1 px-4 py-7 ${sidebarCollapsed ? 'lg:px-3' : ''}`} aria-label="Admin dashboard sections">
          <p className={`mb-3 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/35 ${sidebarCollapsed ? 'lg:sr-only' : ''}`}>Platform pulse</p>
          {navigation.map(({ id, icon: Icon, label, to }) => {
            const isActive = id === activeSection
            return (
            <Link
              key={id}
              to={to}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''} ${isActive ? 'bg-white text-[#302040] shadow-[0_8px_24px_rgba(0,0,0,.14)]' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{label}</span>
              <ChevronRight className={`ml-auto size-4 opacity-30 transition group-hover:translate-x-0.5 group-hover:opacity-80 ${sidebarCollapsed ? 'lg:hidden' : ''}`} />
            </Link>
            )
          })}
        </nav>

        <div className={`relative m-4 rounded-[22px] border border-white/10 bg-white/7 p-3.5 backdrop-blur ${sidebarCollapsed ? 'lg:m-3 lg:p-2' : ''}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#dff6b5] text-xs font-bold text-[#2e3d18]">{initials(user?.name)}</span>
            <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-xs font-bold">{user?.name || 'Sada Admin'}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/45">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label={loggingOut ? 'Signing out' : 'Sign out'}
            title={sidebarCollapsed ? 'Sign out' : undefined}
          >
            {loggingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{loggingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? <button type="button" className="fixed inset-0 z-40 bg-[#170c23]/55 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" /> : null}

      <div className={`min-w-0 transition-[padding] duration-300 ${sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'}`}>
        <header className="sticky top-0 z-30 border-b border-[#e0d7e4]/85 bg-[#fdf9fe]/88 backdrop-blur-2xl">
          <div className="flex min-h-20 items-center gap-3 px-4 sm:px-7 xl:px-10">
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex size-10 items-center justify-center rounded-xl border border-[#ded3e2] bg-white text-[#4f378a] lg:hidden" aria-label="Open navigation">
              <PanelLeftOpen className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-[-.2px] text-[#2c2431]">Platform command center</p>
              <p className="mt-0.5 hidden text-[10px] font-medium text-[#817587] sm:block">Live operational and commercial intelligence</p>
            </div>
            <span className="ml-auto hidden items-center gap-2 rounded-full border border-[#dce8ca] bg-[#f1f9e6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#4d692b] sm:flex">
              <span className="size-1.5 animate-pulse rounded-full bg-[#719a3d]" /> API connected
            </span>
            <button
              type="button"
              onClick={dashboard.refresh}
              disabled={dashboard.loading}
              className="flex size-10 items-center justify-center rounded-xl border border-[#ded3e2] bg-white text-[#4f378a] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={`size-[17px] ${dashboard.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <main className="relative min-w-0 overflow-x-clip px-4 py-7 sm:px-7 lg:py-9 xl:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden" aria-hidden="true">
            <div className="absolute -right-40 -top-32 size-[520px] rounded-full bg-[#e8d9f4]/55 blur-3xl" />
            <div className="absolute left-[18%] top-32 size-60 rounded-full bg-[#eff7d9]/55 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-[1480px]">
            <section aria-labelledby="admin-page-title">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#806d91]">
                    <ActiveSectionIcon className="size-3.5" /> {activeMeta.eyebrow}
                  </div>
                  <h1 id="admin-page-title" className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-1.8px] text-[#241d29] sm:text-5xl">
                    {activeMeta.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716677]">
                    {activeMeta.description}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#ded4e2] bg-[#fffaff]/90 p-3 shadow-[0_12px_32px_rgba(53,36,61,.07)] backdrop-blur-xl">
                  <div className="flex flex-wrap items-end gap-2">
                    {['from', 'to'].map((field) => (
                      <label key={field} className="min-w-[142px] flex-1">
                        <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.15em] text-[#827688]">{field}</span>
                        <span className="relative block">
                          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#7c6b88]" />
                          <input
                            type="date"
                            value={dashboard.draftRange[field]}
                            onChange={(event) => dashboard.updateDraftRange(field, event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#ddd2e2] bg-white pl-9 pr-2 text-xs font-semibold text-[#4b414f] outline-none focus:border-[#705394] focus:ring-2 focus:ring-[#705394]/10"
                          />
                        </span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={dashboard.applyRange}
                      disabled={invalidRange}
                      className="h-10 rounded-xl bg-[#4f378a] px-4 text-xs font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,.2)] transition hover:bg-[#60469a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[7, 30, 90].map((days) => (
                      <button key={days} type="button" onClick={() => dashboard.setPreset(days)} className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-[#766680] transition hover:bg-[#efe7f3] hover:text-[#4f378a]">
                        {days} days
                      </button>
                    ))}
                    {invalidRange ? <span className="ml-auto text-[10px] font-semibold text-[#a73552]">Choose a valid range</span> : null}
                  </div>
                </div>
              </div>

              {dashboard.loading && !overview ? <LoadingDashboard /> : dashboard.error ? (
                <div role="alert" className="mt-8 flex flex-col items-center rounded-[28px] border border-[#edcad3] bg-[#fff4f6] px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f4d8df] text-[#a73552]"><XCircle className="size-5" /></span>
                  <h2 className="mt-4 text-lg font-bold text-[#5a2937]">Dashboard data could not be loaded</h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#81505d]">{dashboard.error}</p>
                  <button type="button" onClick={dashboard.refresh} className="mt-5 rounded-xl bg-[#4f378a] px-5 py-2.5 text-xs font-bold text-white">Try again</button>
                </div>
              ) : overview && activeSection === 'overview' ? (
                <>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={CircleDollarSign} eyebrow="Recorded revenue" value={formatMoney(dashboard.revenue?.totalRevenue)} note={`${formatNumber(dashboard.revenue?.successfulPayments)} successful plan changes`} tone="plum" />
                    <MetricCard icon={Users} eyebrow="Registered users" value={formatNumber(overview.users.total)} note={`+${formatNumber(overview.users.new)} in selected window`} tone="lime" delay={0.05} />
                    <MetricCard icon={FolderKanban} eyebrow="Active projects" value={formatNumber(overview.projects.total)} note={`${formatNumber(overview.projects.recent)} created in selected window`} tone="paper" delay={0.1} />
                    <MetricCard icon={Rocket} eyebrow="Workflow delivery" value={formatNumber(overview.workflows.successful)} note={`${formatNumber(overview.workflows.failed)} failed · ${formatNumber(overview.workflows.pending)} in flight`} tone="rose" delay={0.15} />
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
                    <article className="overflow-hidden rounded-[26px] border border-[#e1d7e5] bg-[#fffaff] p-5 shadow-[0_14px_38px_rgba(54,38,62,.06)] sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#816e90]">Execution health</p>
                          <h3 className="mt-1 text-xl font-semibold tracking-[-.5px]">Automation throughput</h3>
                          <p className="mt-1 text-xs text-[#796e7f]">{formatNumber(overview.workflows.total)} workflows processed all time</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[#edf6df] px-3 py-1.5 text-[10px] font-bold text-[#4d692b]">
                          <CheckCircle2 className="size-3.5" />
                          {overview.workflows.total ? Math.round((overview.workflows.successful / overview.workflows.total) * 100) : 0}% success
                        </div>
                      </div>
                      <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <SplitStat icon={CheckCircle2} label="Successful" value={overview.workflows.successful} />
                        <SplitStat icon={Activity} label="In flight" value={overview.workflows.pending} />
                        <SplitStat icon={XCircle} label="Failed" value={overview.workflows.failed} />
                      </div>
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <DistributionCard title="By status" icon={Gauge} entries={overview.workflows.byStatus} labelKey="status" />
                        <DistributionCard title="By workflow" icon={Bot} entries={overview.workflows.byKind} labelKey="kind" />
                      </div>
                    </article>

                    <article className="relative overflow-hidden rounded-[26px] bg-[#2d1b43] p-6 text-white shadow-[0_20px_50px_rgba(45,27,67,.2)]">
                      <div className="absolute -right-20 -top-16 size-64 rounded-full border-[34px] border-[#dff6b5]/8" />
                      <p className="relative text-[10px] font-bold uppercase tracking-[.18em] text-[#dff6b5]">Commercial pulse</p>
                      <h3 className="relative mt-2 text-xl font-semibold">Revenue velocity</h3>
                      <div className="relative mt-7 space-y-5">
                        {[
                          ['This month', dashboard.revenue?.monthlyRevenue],
                          ['This year', dashboard.revenue?.yearlyRevenue],
                          ['Average payment', dashboard.revenue?.averagePayment],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                            <span className="text-xs text-white/55">{label}</span>
                            <span className="text-lg font-semibold tracking-[-.3px]">{formatMoney(value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="relative mt-6 flex items-center gap-2 text-[10px] leading-4 text-white/45">
                        <ShieldCheck className="size-4 shrink-0 text-[#dff6b5]" />
                        Revenue reflects consumed plan-change quotes recorded by the backend.
                      </div>
                    </article>
                  </div>
                </>
              ) : null}
            </section>

            {overview ? (
              <>
                {activeSection === 'audience' ? <section id="audience" className="scroll-mt-28 pt-8">
                  <SectionHeading eyebrow="Adoption" title="Audience & workspace growth" description={`Windowed activity from ${dateLabel(overview.range.from)} to ${dateLabel(overview.range.to)}; totals are all time.`} />
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <DistributionCard
                      title="User roles"
                      icon={Users}
                      entries={overview.users.byRole}
                      labelKey="role"
                      total={overview.users.total}
                      footer={<span>{formatNumber(overview.users.verified)} verified · {formatNumber(overview.users.unverified)} awaiting verification</span>}
                    />
                    <DistributionCard title="Projects" icon={FolderKanban} entries={overview.projects.byStatus} labelKey="status" total={overview.projects.total} footer={<span>{formatNumber(overview.projects.recent)} new in this range</span>} />
                    <DistributionCard title="Campaigns" icon={Megaphone} entries={overview.campaigns.byStatus} labelKey="status" total={overview.campaigns.total} />
                    <DistributionCard title="Subscriptions" icon={WalletCards} entries={overview.subscriptions.byStatus} labelKey="status" total={overview.subscriptions.total} footer={<span>{formatNumber(overview.subscriptions.active)} active · {formatNumber(overview.subscriptions.paused)} paused · {formatNumber(overview.subscriptions.canceled)} canceled</span>} />
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <DistributionCard title="Subscribers by plan" icon={Sparkles} entries={overview.subscriptions.byPlan} labelKey="planCode" footer={<span>{formatMoney(overview.subscriptions.planChangeRevenueCents)} from {formatNumber(overview.subscriptions.chargedPlanChanges)} charged changes</span>} />
                    <article className="grid gap-3 rounded-[24px] border border-[#e3dae6] bg-[#fffaff] p-5 shadow-[0_12px_34px_rgba(54,38,62,.055)] sm:grid-cols-3">
                      <SplitStat label="Verified" value={overview.users.verified} icon={ShieldCheck} />
                      <SplitStat label="Unverified" value={overview.users.unverified} icon={Users} />
                      <SplitStat label="New users" value={overview.users.new} icon={ArrowUpRight} />
                    </article>
                  </div>
                  <article className="mt-4 overflow-hidden rounded-[26px] border border-[#e1d7e5] bg-[#fffaff] shadow-[0_14px_40px_rgba(54,38,62,.06)]">
                    <div className="flex items-center justify-between gap-4 border-b border-[#ece5ee] px-5 py-5 sm:px-6">
                      <div>
                        <h3 className="text-base font-bold tracking-[-.3px]">User directory</h3>
                        <p className="mt-1 text-xs text-[#7a6f80]">Open any account to inspect its plan, projects, tokens, and cost.</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#827488]">{formatNumber(dashboard.users?.meta?.total)} users</span>
                    </div>
                    <div className="grid divide-y divide-[#eee7f0] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
                      {(dashboard.users?.data || []).map((directoryUser) => (
                        <button
                          key={directoryUser.id}
                          type="button"
                          onClick={() => setSelectedUserId(directoryUser.id)}
                          className="group flex min-w-0 items-center gap-3 px-5 py-4 text-left transition hover:bg-[#f8f2fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6f5291]"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eee6f4] text-[10px] font-bold text-[#4f378a]">{initials(directoryUser.name || directoryUser.email)}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-[#302735]">{directoryUser.name}</span>
                            <span className="mt-0.5 block truncate text-[10px] text-[#887d8d]">{directoryUser.email}</span>
                            <span className="mt-1.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.11em] text-[#806d91]">
                              {humanize(directoryUser.role)} · {directoryUser.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </span>
                          <ArrowUpRight className="ml-auto size-4 shrink-0 text-[#9a8ca1] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4f378a]" />
                        </button>
                      ))}
                    </div>
                  </article>
                </section> : null}

                {activeSection === 'operations' ? <section id="operations" className="scroll-mt-28 pt-8">
                  <SectionHeading eyebrow="Delivery system" title="Content & channel operations" description="Every resource family exposed by the overview endpoint, including generation, knowledge, strategy, and social health." />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <DistributionCard title="Generated content" icon={FileText} entries={overview.content.byStatus} labelKey="status" total={overview.content.total} />
                    <DistributionCard title="Knowledge sources" icon={BookOpenText} entries={overview.knowledge.byStatus} labelKey="status" total={overview.knowledge.total} footer={<span>{formatNumber(overview.knowledge.pages)} crawled pages</span>} />
                    <DistributionCard title="Knowledge types" icon={Database} entries={overview.knowledge.byType} labelKey="type" />
                    <DistributionCard title="Strategy runs" icon={Network} entries={overview.strategies.byStatus} labelKey="status" total={overview.strategies.total} />
                    <DistributionCard title="Strategy approvals" icon={ShieldCheck} entries={overview.strategies.byApprovalStatus} labelKey="approvalStatus" />
                    <DistributionCard title="Social publications" icon={Megaphone} entries={overview.social.publicationsByStatus} labelKey="status" total={overview.social.publications} />
                    <DistributionCard title="Connected platforms" icon={Network} entries={overview.social.accountsByPlatform} labelKey="platform" total={overview.social.accounts} footer={<span>{formatNumber(overview.social.connections)} provider connections</span>} />
                    <DistributionCard title="Workflow kinds" icon={Bot} entries={overview.workflows.byKind} labelKey="kind" total={overview.workflows.total} />
                    <article className="relative overflow-hidden rounded-[24px] bg-[#dff6b5] p-6 text-[#293817] shadow-[0_16px_38px_rgba(66,89,24,.1)]">
                      <span className="absolute -right-12 -top-12 size-36 rounded-full border-[22px] border-[#4d692b]/7" />
                      <Database className="size-6" />
                      <p className="mt-7 text-[10px] font-bold uppercase tracking-[.17em] opacity-65">Knowledge footprint</p>
                      <p className="mt-2 text-4xl font-semibold tracking-[-1.4px]">{formatNumber(overview.knowledge.pages)}</p>
                      <p className="mt-2 text-xs font-medium opacity-65">indexed pages across {formatNumber(overview.knowledge.total)} sources</p>
                    </article>
                  </div>
                </section> : null}

                {activeSection === 'revenue' ? <section id="revenue" className="scroll-mt-28 pb-16 pt-8">
                  <SectionHeading eyebrow="Commercial intelligence" title="Plan economics & customer revenue" description="MRR reflects current subscriptions. Collected revenue and customer rows include only charged plan changes, never zero-dollar quotes." />

                  <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {(dashboard.revenuePlans?.data || []).map((plan, index) => (
                      <motion.article
                        key={plan.planId || plan.planCode}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="group rounded-[24px] border border-[#e2d8e5] bg-[#fffaff] p-5 shadow-[0_12px_34px_rgba(54,38,62,.055)] transition hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(54,38,62,.1)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#eee6f4] text-[#4f378a]"><WalletCards className="size-[18px]" /></span>
                          <span className="rounded-full bg-[#eff7df] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#54702f]">{formatNumber(plan.subscriberCount)} subscribers</span>
                        </div>
                        <p className="mt-5 text-xs font-semibold text-[#796d7f]">{plan.planName || humanize(plan.planCode)}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#978b9b]">Collected revenue</p>
                        <p className="mt-1 text-3xl font-semibold tracking-[-1px] text-[#2a2230]">{formatMoney(plan.planChangeRevenueCents)}</p>
                        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl bg-[#f5f0f7]">
                          <div className="p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#918598]">Estimated MRR</p>
                            <p className="mt-1 text-sm font-bold text-[#3d3243]">{formatMoney(plan.monthlyRecurringRevenueCents)} / mo</p>
                          </div>
                          <div className="border-l border-[#e5dce8] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#918598]">Charged changes</p>
                            <p className="mt-1 text-sm font-bold text-[#3d3243]">{formatNumber(plan.chargedPlanChanges)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-[#eee7f0] pt-4 text-[10px] text-[#817587]">
                          <span>{formatNumber(plan.monthlySubscribers)} monthly · {formatNumber(plan.yearlySubscribers)} yearly</span>
                          <span className="flex items-center gap-1 font-bold text-[#4f378a]">{humanize(plan.planCode)} <ArrowUpRight className="size-3" /></span>
                        </div>
                      </motion.article>
                    ))}
                    {dashboard.revenuePlans?.data?.length ? null : (
                      <div className="col-span-full rounded-[24px] border border-dashed border-[#d9cfe0] bg-[#fffaff]/60 px-6 py-12 text-center text-sm text-[#807485]">No plan revenue has been recorded yet.</div>
                    )}
                  </div>

                  <article className="mt-4 overflow-hidden rounded-[26px] border border-[#e1d7e5] bg-[#fffaff] shadow-[0_14px_40px_rgba(54,38,62,.06)]">
                    <div className="flex flex-col gap-2 border-b border-[#ece5ee] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <h3 className="text-base font-bold tracking-[-.3px]">Customers &amp; plans</h3>
                        <p className="mt-1 text-xs text-[#7a6f80]">Every customer’s current plan, including Free accounts, with their recorded payment history</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#827488]">{formatNumber(dashboard.revenueUsers?.meta?.total)} customers</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[820px] border-collapse text-left">
                        <thead>
                          <tr className="bg-[#f7f1f8] text-[9px] font-bold uppercase tracking-[.14em] text-[#817487]">
                            <th className="px-6 py-3.5">Customer</th>
                            <th className="px-4 py-3.5">Current plan</th>
                            <th className="px-4 py-3.5">Payments</th>
                            <th className="px-4 py-3.5">Latest payment</th>
                            <th className="px-6 py-3.5 text-right">Total paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(dashboard.revenueUsers?.data || []).map((row) => (
                            <tr key={row.userId} className="border-t border-[#eee7f0] text-xs transition hover:bg-[#fcf8fd]">
                              <td className="px-6 py-4">
                                <button type="button" onClick={() => setSelectedUserId(row.userId)} className="group flex max-w-full items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f5291] focus-visible:ring-offset-2">
                                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#eee6f4] text-[10px] font-bold text-[#4f378a]">{initials(row.user?.name || row.user?.email)}</span>
                                  <div className="min-w-0">
                                    <p className="max-w-[260px] truncate font-bold text-[#302735] transition group-hover:text-[#4f378a]">{row.user?.name || 'Deleted user'}</p>
                                    <p className="mt-0.5 max-w-[260px] truncate text-[10px] text-[#887c8d]">{row.user?.email || row.userId}</p>
                                  </div>
                                  <ArrowUpRight className="size-3.5 shrink-0 text-[#9b8ea0] opacity-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.11em] ${row.planCode === 'free' ? 'bg-[#eee8f1] text-[#6e6175]' : 'bg-[#e9f5d7] text-[#4f6b2d]'}`}>
                                  {row.planName || humanize(row.planCode)}
                                </span>
                                <p className="mt-1.5 text-[9px] font-semibold text-[#918598]">{humanize(row.subscriptionStatus)}</p>
                              </td>
                              <td className="px-4 py-4 font-semibold text-[#5d5262]">{formatNumber(row.paymentCount)}</td>
                              <td className="px-4 py-4 text-[#766b7b]">{dateLabel(row.latestPayment)}</td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-[#302735]">{formatMoney(row.totalPaid)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {dashboard.revenueUsers?.data?.length ? null : (
                        <div className="px-6 py-14 text-center text-xs text-[#817587]">No customer accounts found.</div>
                      )}
                    </div>
                  </article>
                </section> : null}
              </>
            ) : null}
          </div>
        </main>
      </div>
      <AnimatePresence>
        {selectedUserId ? <UserAnalyticsDrawer key={selectedUserId} userId={selectedUserId} onClose={closeUserDetails} /> : null}
      </AnimatePresence>
    </div>
  )
}
