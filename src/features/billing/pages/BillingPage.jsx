import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  cancelSubscription,
  changePlan,
  createCheckout,
  getErrorMessage,
  getSubscription,
  listPlans,
} from '@/lib/billingApi'

const PLAN_DETAILS = {
  free: { eyebrow: 'Starter', features: ['3 campaigns / month', 'Live captions & hashtags', 'Community support'] },
  pro: { eyebrow: 'Popular', features: ['Unlimited campaigns', 'AI image generation', 'Advanced analytics', 'Priority support'] },
  business: { eyebrow: 'Team', features: ['Everything in Pro', 'Team workspaces', 'API access', 'Dedicated success manager'] },
}

const STATUS_STYLES = {
  ACTIVE: 'bg-[#e6fbc7] text-[#315016]',
  TRIALING: 'bg-[#f2eafa] text-[#4f378a]',
  PAST_DUE: 'bg-[#fcefd9] text-[#9b5a12]',
  UNPAID: 'bg-[#fcefd9] text-[#9b5a12]',
  CANCELLED: 'bg-[#f3edf5] text-[#625b71]',
  INCOMPLETE: 'bg-[#f3edf5] text-[#625b71]',
  PAUSED: 'bg-[#f2eafa] text-[#4f378a]',
}

const STATUS_LABELS = {
  ACTIVE: 'Active',
  TRIALING: 'Trial',
  PAST_DUE: 'Past due',
  UNPAID: 'Unpaid',
  CANCELLED: 'Cancelled',
  INCOMPLETE: 'Incomplete',
  PAUSED: 'Paused',
}

function formatCents(cents) {
  if (cents == null) return null
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })
}

function SuccessPopup({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="fixed inset-x-4 bottom-6 z-[80] mx-auto w-full max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#cfe2b2] bg-[#fffaff] p-4 shadow-[0_20px_60px_rgba(46,32,51,0.22)]">
        <span className="absolute -right-6 -top-10 size-28 rounded-full bg-[#e6fbc7]/60" aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e6fbc7] text-[#2c4a0e]">
            <CheckCircle2 className="size-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-[#201a25]">{message.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#625b71]">{message.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#776e7d] transition-colors hover:bg-[#f3edf5] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function NoticePopup({ title, body, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="fixed inset-x-4 bottom-6 z-[80] mx-auto w-full max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#f0d9b7] bg-[#fffaff] p-4 shadow-[0_20px_60px_rgba(46,32,51,0.22)]">
        <span className="absolute -right-6 -top-10 size-28 rounded-full bg-[#fcefd9]/60" aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fcefd9] text-[#9b5a12]">
            <XCircle className="size-5" strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-[#201a25]">{title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#625b71]">{body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#776e7d] transition-colors hover:bg-[#f3edf5] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function BillingPage() {
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [interval, setInterval] = useState('month')
  const [loading, setLoading] = useState(true)
  const [busyPlan, setBusyPlan] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [popup, setPopup] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      return {
        kind: 'success',
        title: 'Payment successful — you are subscribed!',
        body: 'Your new plan is active. You can manage or cancel it here anytime.',
      }
    }
    if (params.get('canceled') === '1') {
      return {
        kind: 'notice',
        title: 'Checkout cancelled',
        body: 'No charges were made. You can try again whenever you are ready.',
      }
    }
    return null
  })
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  useEffect(() => {
    if (popup) {
      navigate('/billing', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      const [planData, subscriptionData] = await Promise.all([
        listPlans(),
        getSubscription(),
      ])
      setError('')
      setPlans(Array.isArray(planData) ? planData : [])
      setSubscription(subscriptionData ?? null)
      if (subscriptionData?.billingInterval) {
        setInterval(subscriptionData.billingInterval === 'monthly' ? 'month' : 'year')
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([listPlans(), getSubscription()])
      .then(([planData, subscriptionData]) => {
        if (!active) return
        setError('')
        setPlans(Array.isArray(planData) ? planData : [])
        setSubscription(subscriptionData ?? null)
        if (subscriptionData?.billingInterval) {
          setInterval(subscriptionData.billingInterval === 'monthly' ? 'month' : 'year')
        }
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const isActiveStatus = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'UNPAID'].includes(subscription?.status)
  const currentPlanCode = subscription?.plan?.code

  const choosePlan = async (planCode) => {
    setError('')
    setBusyPlan(planCode)
    setBusyAction('checkout')
    try {
      const { url } = await createCheckout({ planCode, interval })
      window.location.assign(url)
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError))
      setBusyPlan('')
      setBusyAction('')
    }
  }

  const switchPlan = async (planCode) => {
    setError('')
    setBusyPlan(planCode)
    setBusyAction('change')
    try {
      await changePlan({ planCode, interval })
      await load()
      setPopup({
        kind: 'success',
        title: 'Plan updated',
        body: `You are now on the ${plans.find((plan) => plan.code === planCode)?.name ?? planCode} plan.`,
      })
    } catch (changeError) {
      setError(getErrorMessage(changeError))
    } finally {
      setBusyPlan('')
      setBusyAction('')
    }
  }

  const handleCancel = async () => {
    setError('')
    setBusyAction('cancel')
    try {
      await cancelSubscription()
      await refreshSession()
      await load()
      setPopup({
        kind: 'notice',
        title: 'Subscription cancelled',
        body: 'Your subscription has been cancelled and access will end at the period close.',
      })
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
    } finally {
      setBusyAction('')
    }
  }

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [plans],
  )

  const statusStyle = STATUS_STYLES[subscription?.status] ?? 'bg-[#f3edf5] text-[#625b71]'

  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4f378a]">
              <CreditCard className="size-3.5" /> Billing
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.9px] text-[#201a25] sm:text-[44px]">
              Your subscription
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6a6170]">
              Manage your plan, switch intervals, or update how you pay. Changes to
              price are prorated automatically.
            </p>
          </div>

          {subscription ? (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] ${statusStyle}`}>
                <span className="size-1.5 rounded-full bg-current" />
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
              {isActiveStatus ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busyAction === 'cancel'}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-[#eccfd5] bg-white px-3.5 text-sm font-semibold text-[#9f2949] transition-colors hover:bg-[#fbe9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] disabled:cursor-wait disabled:opacity-60"
                >
                  {busyAction === 'cancel' ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                  Cancel subscription
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Interval toggle */}
        <div className="flex items-center gap-3">
          {['month', 'year'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              aria-pressed={interval === value}
              className={`flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                interval === value
                  ? 'bg-[#381e72] text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)]'
                  : 'border border-[#d8cfdc] bg-white text-[#625b71] hover:border-[#a99eb4] hover:text-[#201a25]'
              }`}
            >
              {value === 'month' ? 'Monthly' : 'Yearly'}
              {value === 'year' ? <span className={interval === 'year' ? 'text-[#b7f36b]' : 'text-[#6a9f27]'}>−20%</span> : null}
            </button>
          ))}
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-sm text-[#8a2440]">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6a6170]">
            <Loader2 className="size-4 animate-spin" /> Loading your plans…
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cfc2d5] bg-[#fffaff] px-6 py-20 text-center">
            <Sparkles className="mx-auto size-7 text-[#4f378a]" />
            <p className="mt-3 text-sm font-semibold text-[#381e72]">No plans available</p>
            <p className="mt-1 text-xs text-[#807586]">The plan catalog is empty right now. Please try again later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {sortedPlans.map((plan, index) => {
              const detail = PLAN_DETAILS[plan.code] ?? { eyebrow: 'Plan', features: [] }
              const priceCents = interval === 'year' ? plan.priceYearlyCents : plan.priceMonthlyCents
              const hasPrice = priceCents != null
              const isCurrent = currentPlanCode === plan.code && isActiveStatus
              const isSamePlan = currentPlanCode === plan.code
              const busy = busyPlan === plan.code
              const highlight = plan.code === 'pro'

              return (
                <motion.article
                  key={plan.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                  className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                    highlight
                      ? 'border-2 border-[#4f378a] bg-white shadow-[0_24px_60px_rgba(56,30,114,0.18)]'
                      : 'border border-[#e2d9e6] bg-[#fffaff] shadow-[0_14px_38px_rgba(46,32,51,0.07)]'
                  }`}
                >
                  {highlight ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#381e72] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                      Most popular
                    </span>
                  ) : null}

                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold text-[#201a25]">{plan.name}</h3>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d8195]">{detail.eyebrow}</span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-[#6a6170]">{plan.description}</p>

                  <div className="mt-6 flex items-end gap-1.5">
                    {hasPrice ? (
                      <>
                        <span className="font-display text-4xl font-bold tracking-[-1px] text-[#201a25]">
                          {priceCents === 0 ? '$0' : formatCents(priceCents)}
                        </span>
                        <span className="mb-1 text-sm text-[#8a8190]">{priceCents === 0 ? 'forever' : ` / ${interval}`}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[#8a8190]">Contact us</span>
                    )}
                  </div>

                  <div className="mt-6 flex min-h-12">
                    {isCurrent ? (
                      <span className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#cfe2b2] bg-[#eff9df] text-sm font-semibold text-[#315016]">
                        <Check className="size-4" /> Current plan
                      </span>
                    ) : isSamePlan ? (
                      <span className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#e2d9e6] bg-[#f3edf5] text-sm font-semibold text-[#625b71]">
                        {subscription ? (subscription.status === 'CANCELLED' ? 'Resume' : 'Re-subscribe') : 'Choose'}
                      </span>
                    ) : subscription ? (
                      <button
                        type="button"
                        onClick={() => switchPlan(plan.code)}
                        disabled={busy || Boolean(busyPlan)}
                        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#381e72] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="size-4 animate-spin text-[#b7f36b]" /> : <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                        {busy ? (busyAction === 'change' ? 'Switching…' : 'Redirecting…') : `Switch to ${plan.name}`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => choosePlan(plan.code)}
                        disabled={busy || Boolean(busyPlan)}
                        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#381e72] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="size-4 animate-spin text-[#b7f36b]" /> : <Sparkles className="size-4 text-[#b7f36b]" />}
                        {busy ? 'Opening checkout…' : subscription ? 'Choose' : plan.code === 'free' ? 'Start free' : 'Choose plan'}
                      </button>
                    )}
                  </div>

                  <ul className="mt-7 space-y-3 text-[#514a56]">
                    {detail.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6fbc7] text-[#315016]">
                          <Check className="size-3" strokeWidth={2.6} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-[#e2d9e6] bg-[#fffaff] px-4 py-4 text-sm text-[#625b71]">
          <ShieldCheck className="size-4 shrink-0 text-[#4f378a]" />
          Payments are processed securely by Stripe. We never see or store your card details.
        </div>
      </div>

      <AnimatePresence>
        {popup ? (
          popup.kind === 'success' ? (
            <SuccessPopup message={popup} onClose={() => setPopup(null)} />
          ) : (
            <NoticePopup title={popup.title} body={popup.body} onClose={() => setPopup(null)} />
          )
        ) : null}
      </AnimatePresence>
    </div>
  )
}