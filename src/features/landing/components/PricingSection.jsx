import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, Coins, Loader2, LockKeyhole, Sparkles, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getSubscription, cancelSubscription, getErrorMessage } from '@/lib/billingApi'
import { formatPlanPrice, getPlanPrice, PRICING_PLANS } from '@/features/billing/plans'

export function PricingSection() {
  const [subscription, setSubscription] = useState(null)
  const [interval, setInterval] = useState('month')
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState('')
  const [popup, setPopup] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      return {
        kind: 'success',
        title: 'You are subscribed — your plan is active!',
        body: 'The plan below is confirmed on your account.',
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
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (popup) {
      navigate('/#pricing', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    let active = true
    let pollCount = 0
    const fetchSubscription = () => {
      getSubscription()
        .then((data) => {
          if (!active) return
          if (data) {
            setSubscription(data)
            return
          }
          if (popup?.kind === 'success' && pollCount < 6) {
            pollCount += 1
            setTimeout(fetchSubscription, 1500)
          }
        })
        .catch(() => {
          if (active) setSubscription(null)
        })
    }
    fetchSubscription()
    return () => {
      active = false
    }
  }, [isAuthenticated, popup?.kind])

  const refreshSubscription = async () => {
    try {
      const data = await getSubscription()
      setSubscription(data ?? null)
    } catch {
      setSubscription(null)
    }
  }

  const startCheckout = (planCode) => {
    const destination = planCode === 'free'
      ? '/generate'
      : `/checkout?plan=${encodeURIComponent(planCode)}&interval=${interval}`
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: destination },
      })
      return
    }
    navigate(destination)
  }

  const handleCancel = async () => {
    setError('')
    setCheckingOut('cancel')
    try {
      await cancelSubscription()
      await refreshSubscription()
      setCheckingOut('')
      setPopup({
        kind: 'notice',
        title: 'Subscription cancelled',
        body: 'Your paid subscription ended and your account is now on the Free allowance.',
      })
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
      setCheckingOut('')
    }
  }

  return (
    <section id="pricing" className="bg-[#fef7ff] px-6 py-24 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-[1120px]"
      >
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d4ef] bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f378a] shadow-sm">
            <Sparkles className="size-3.5" /> Pricing
          </span>
          <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.9px] text-[#201a25] sm:text-5xl">
            Simple, honest plans.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#6a6170]">
            Start free and scale when you need more power. No contracts, cancel anytime.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
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
              {value === 'year' ? <span className={interval === 'year' ? 'text-[#b7f36b]' : 'text-[#6a9f27]'}>Save 17%</span> : null}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-[#dfd3e7] bg-white/70 px-4 py-3 text-center text-sm text-[#625b71]">
          <Coins className="size-4 shrink-0 text-[#4f378a]" />
          One generation credit starts one strategy or one content workflow.
        </div>

        {error ? (
          <div role="alert" aria-live="polite" className="mt-8 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-center text-sm text-[#8a2440]">
            {error}
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => {
            const isActiveSubscription =
              subscription &&
              ['ACTIVE', 'TRIALING', 'PAST_DUE', 'UNPAID'].includes(subscription?.status)
            const isSubscribedPlan =
              isActiveSubscription && subscription?.plan?.code === plan.code
            const subscribedInterval =
              String(subscription?.billingInterval ?? '').toUpperCase() === 'MONTHLY'
                ? 'month'
                : 'year'
            const cardInterval = isSubscribedPlan ? subscribedInterval : interval
            const priceCents = getPlanPrice(plan, cardInterval)
            const priceLabel = formatPlanPrice(priceCents)
            const isFree = priceCents === 0
            const busy = checkingOut === plan.code

            return (
              <motion.article
                key={plan.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                  plan.highlight
                    ? 'bg-[#381e72] text-white shadow-[0_24px_60px_rgba(56,30,114,0.3)]'
                    : 'border border-[#e2d9e6] bg-[#fffaff] shadow-[0_14px_38px_rgba(46,32,51,0.07)]'
                }`}
              >
                {isSubscribedPlan ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#6a9f27] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                    <span className="inline-flex items-center gap-1"><Check className="size-3" strokeWidth={3} /> Confirmed</span>
                  </span>
                ) : plan.highlight ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#b7f36b] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d3b05] shadow-md">
                    Most popular
                  </span>
                ) : null}

                <div className="flex items-baseline justify-between">
                  <h3 className={`text-lg font-semibold ${plan.highlight ? 'text-white' : 'text-[#201a25]'}`}>
                    {plan.name}
                  </h3>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${plan.highlight ? 'text-[#b7f36b]' : 'text-[#8d8195]'}`}>
                    {plan.eyebrow}
                  </span>
                </div>
                <p className={`mt-2 min-h-10 text-sm leading-5 ${plan.highlight ? 'text-white/75' : 'text-[#6a6170]'}`}>
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end gap-1.5">
                  <span className={`font-display text-4xl font-bold tracking-[-1px] ${plan.highlight ? 'text-white' : 'text-[#201a25]'}`}>
                    {isFree ? '$0' : priceLabel}
                  </span>
                  <span className={`mb-1 text-sm ${plan.highlight ? 'text-white/60' : 'text-[#8a8190]'}`}>
                    {isFree ? 'forever' : ` / ${cardInterval}`}
                  </span>
                </div>

                <div className={`mt-5 rounded-2xl border px-4 py-3 ${plan.highlight ? 'border-white/15 bg-white/10' : 'border-[#e4d9e8] bg-[#f8f2f9]'}`}>
                  <div className="flex items-center gap-2">
                    <Coins className={`size-4 ${plan.highlight ? 'text-[#d9ffa8]' : 'text-[#4f378a]'}`} />
                    <span className={`text-sm font-bold ${plan.highlight ? 'text-white' : 'text-[#2b2030]'}`}>
                      {Number(plan.generationCredits ?? 0).toLocaleString()} credits / month
                    </span>
                  </div>
                  <p className={`mt-1 text-[11px] leading-4 ${plan.highlight ? 'text-white/65' : 'text-[#776e7d]'}`}>
                    Shared by strategy, post creation, and regenerations.
                  </p>
                </div>

                {isSubscribedPlan ? (
                  <div className="mt-6 flex flex-col gap-2.5">
                    <span
                      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold ${
                        plan.highlight
                          ? 'bg-[#d9ffa8]/25 text-[#d9ffa8]'
                          : 'border border-[#cfe2b2] bg-[#eff9df] text-[#315016]'
                      }`}
                    >
                      <Check className="size-4" strokeWidth={2.6} />
                      Your plan ·{cardInterval === 'year' ? ' Yearly' : ' Monthly'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={Boolean(checkingOut)}
                      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        plan.highlight
                          ? 'border border-[#c8a6b4] bg-white/5 text-[#ffc6d1] hover:bg-white/10 focus-visible:ring-white'
                          : 'border border-[#eccfd5] bg-white text-[#9f2949] hover:bg-[#fbe9ee] focus-visible:ring-[#ad3150]'
                      }`}
                    >
                      {checkingOut === 'cancel' ? <Loader2 className="size-4 animate-spin" /> : null}
                      Cancel subscription
                    </button>
                  </div>
                ) : isAuthenticated && isActiveSubscription && isFree ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={busy || Boolean(checkingOut)}
                    className={`group mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.highlight
                        ? 'bg-white text-[#381e72] shadow-[0_10px_26px_rgba(0,0,0,0.22)] hover:bg-[#f3edf5] focus-visible:ring-white'
                        : 'bg-[#381e72] text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] hover:bg-[#4f378a] focus-visible:ring-[#381e72]'
                    }`}
                  >
                    {busy ? <Loader2 className={`size-4 animate-spin ${plan.highlight ? 'text-[#4f378a]' : 'text-[#b7f36b]'}`} /> : null}
                    Switch to Free
                    {!busy ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
                  </button>
                ) : (
                <button
                  type="button"
                  onClick={() => startCheckout(plan.code)}
                  disabled={busy || Boolean(checkingOut)}
                  className={`group mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.highlight
                      ? 'bg-white text-[#381e72] shadow-[0_10px_26px_rgba(0,0,0,0.22)] hover:bg-[#f3edf5] focus-visible:ring-white'
                      : 'bg-[#381e72] text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] hover:bg-[#4f378a] focus-visible:ring-[#381e72]'
                  }`}
                >
                  {busy ? <Loader2 className={`size-4 animate-spin ${plan.highlight ? 'text-[#4f378a]' : 'text-[#b7f36b]'}`} /> : null}
                  {isFree ? 'Start free' : `Choose ${plan.name}`}
                  {!busy ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
                </button>
                )}

                <ul className={`mt-7 space-y-3 ${plan.highlight ? 'text-white/90' : 'text-[#514a56]'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${plan.highlight ? 'bg-[#b7f36b]/20 text-[#d9ffa8]' : 'bg-[#e6fbc7] text-[#315016]'}`}>
                        <Check className="size-3" strokeWidth={2.6} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className={`mt-auto flex items-center gap-1.5 border-t pt-5 text-[11px] ${plan.highlight ? 'border-white/15 text-white/60' : 'border-[#ece4ee] text-[#817687]'}`}>
                  <LockKeyhole className="size-3.5" /> Secure checkout. Cancel anytime.
                </p>
              </motion.article>
            )
          })}
        </div>

        <p className="mt-10 text-center text-sm text-[#8a8190]">
          Need a custom plan?{' '}
          <Link to="/register" className="font-semibold text-[#4f378a] hover:underline">
            Talk to our team
          </Link>
        </p>
      </motion.div>

      {popup ? (
        <div className="fixed inset-x-4 bottom-6 z-[80] mx-auto w-full max-w-md" role="alert" aria-live="polite">
          <div
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_20px_60px_rgba(46,32,51,0.22)] ${
              popup.kind === 'success'
                ? 'border-[#cfe2b2] bg-[#fffaff]'
                : 'border-[#f0d9b7] bg-[#fffaff]'
            }`}
          >
            <span
              className={`absolute -right-6 -top-10 size-28 rounded-full ${
                popup.kind === 'success' ? 'bg-[#e6fbc7]/60' : 'bg-[#fcefd9]/60'
              }`}
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  popup.kind === 'success'
                    ? 'bg-[#e6fbc7] text-[#2c4a0e]'
                    : 'bg-[#fcefd9] text-[#9b5a12]'
                }`}
              >
                {popup.kind === 'success' ? (
                  <CheckCircle2 className="size-5" strokeWidth={2.4} />
                ) : (
                  <X className="size-5" strokeWidth={2.3} />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-bold text-[#201a25]">{popup.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-[#625b71]">{popup.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopup(null)}
                aria-label="Dismiss notification"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#776e7d] transition-colors hover:bg-[#f3edf5] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
