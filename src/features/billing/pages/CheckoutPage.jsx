import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Coins, CreditCard, Loader2, LockKeyhole, ShieldCheck, XCircle } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import brandMark from '@/assets/auth/brand-mark.svg'
import { changePlan, createCheckout, getErrorMessage, getSubscription, previewPlanChange } from '@/lib/billingApi'
import { formatPlanPrice, getPlan, getPlanPrice } from '@/features/billing/plans'

const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING', 'PAST_DUE', 'UNPAID'])

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const plan = getPlan(searchParams.get('plan'))
  const interval = searchParams.get('interval') === 'year' ? 'year' : 'month'
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    let active = true
    getSubscription()
      .then(async (data) => {
        if (!active) return
        setSubscription(data ?? null)
        const subscribedInterval = String(data?.billingInterval ?? '').toUpperCase() === 'YEARLY' ? 'year' : 'month'
        if (plan && ACTIVE_STATUSES.has(data?.status) && (data?.plan?.code !== plan.code || subscribedInterval !== interval)) {
          const amount = await previewPlanChange({ planCode: plan.code, interval })
          if (active) setPreview(amount)
        }
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [interval, plan])

  if (!plan || plan.code === 'free') {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#fef7ff] px-5">
        <div className="max-w-md rounded-3xl border border-[#e1d8e5] bg-white p-8 text-center shadow-[0_24px_70px_rgba(46,32,51,0.12)]">
          <XCircle className="mx-auto size-8 text-[#9f2949]" />
          <h1 className="mt-4 font-display text-3xl text-[#201a25]">That checkout is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#6a6170]">Choose a paid plan to continue, or start generating with the included Free allowance.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/#pricing" className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#d8cfdc] font-semibold text-[#4f378a]">View plans</Link>
            <Link to="/generate" className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#381e72] font-semibold text-white">Start free</Link>
          </div>
        </div>
      </main>
    )
  }

  const priceCents = getPlanPrice(plan, interval)
  const isActive = ACTIVE_STATUSES.has(subscription?.status)
  const isCurrentPlan = isActive && subscription?.plan?.code === plan.code
  const currentInterval = String(subscription?.billingInterval ?? '').toUpperCase() === 'YEARLY' ? 'year' : 'month'
  const isExactCurrentPlan = isCurrentPlan && currentInterval === interval
  const isPlanChange = isActive && !isExactCurrentPlan
  const dueNowLabel = preview
    ? formatPlanPrice(preview.amountDueCents)
    : null

  const handlePayment = async () => {
    setError('')
    setSubmitting(true)
    try {
      const result = isActive
        ? await changePlan({ planCode: plan.code, interval })
        : await createCheckout({ planCode: plan.code, interval })

      if (result?.url) {
        window.location.assign(result.url)
        return
      }
      navigate('/billing?success=1', { replace: true })
    } catch (paymentError) {
      setError(getErrorMessage(paymentError))
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f6f0f7] text-[#201a25]">
      <div className="checkout-background-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-[1120px] items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#4f378a]"><img src={brandMark} alt="" className="size-[17px]" /></span>
          Sada
        </Link>
        <Link to="/#pricing" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#625b71] hover:bg-white/70 hover:text-[#381e72]">
          <ArrowLeft className="size-4" /> Change plan
        </Link>
      </header>

      <div className="relative mx-auto grid max-w-[1040px] gap-8 px-5 pb-14 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)] lg:items-start lg:pt-12">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(46,32,51,0.12)] backdrop-blur sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f2eafa] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#4f378a]"><CreditCard className="size-3.5" /> Secure checkout</span>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-[-.8px] sm:text-5xl">Finish setting up<br />your plan.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#6a6170]">{isPlanChange ? 'Stripe credits the unused portion of your current plan and charges only the difference for the rest of this billing period.' : 'Review your order here, then continue to Stripe’s encrypted payment page to enter your card and billing details.'}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[(isPlanChange ? 'Pay only the prorated difference' : '256-bit encrypted payment'), 'Instant credit activation', 'Cancel whenever you need'].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e6dee8] bg-[#fcf9fc] p-3 text-xs font-medium leading-5 text-[#514a56]"><Check className="mb-2 size-4 text-[#5c8e20]" />{item}</div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#dfd3e7] bg-[#f8f2f9] p-4">
            <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#4f378a]" /><div><p className="text-sm font-bold">Your card data never touches our servers</p><p className="mt-1 text-xs leading-5 text-[#746b79]">Stripe securely collects and processes the payment. Sada only receives the subscription result.</p></div></div>
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="checkout-order-summary overflow-hidden rounded-[28px] text-white">
          <div className="border-b border-white/12 p-6 sm:p-7">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#d9ffa8]">Order summary</p><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{interval === 'year' ? 'Yearly' : 'Monthly'}</span></div>
            <h2 className="mt-5 font-display text-3xl">{plan.name}</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">{plan.description}</p>
            {isPlanChange ? (
              <div className="mt-6 rounded-2xl border border-[#d9ffa8]/25 bg-[#d9ffa8]/10 p-4">
                <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d9ffa8]">Prorated difference due now</p><p className="mt-1 text-xs text-white/55">After credit for unused {subscription?.plan?.name} time</p></div><span className="font-display text-4xl font-bold">{dueNowLabel ?? 'Calculating…'}</span></div>
              </div>
            ) : null}
            <div className={`${isPlanChange ? 'mt-4' : 'mt-6'} flex items-end gap-2`}><span className={`${isPlanChange ? 'text-2xl' : 'text-5xl'} font-display font-bold tracking-[-1px]`}>{formatPlanPrice(priceCents)}</span><span className="mb-1 text-sm text-white/55">/ {interval}{isPlanChange ? ' after this period' : ''}</span></div>
            {interval === 'year' ? <p className="mt-2 text-xs font-semibold text-[#d9ffa8]">You save {formatPlanPrice(plan.priceMonthlyCents * 12 - plan.priceYearlyCents)} each year</p> : null}
          </div>
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4"><div className="flex items-center gap-3"><Coins className="size-5 text-[#d9ffa8]" /><div><p className="font-bold">{plan.generationCredits} credits</p><p className="text-xs text-white/55">Refreshed every month</p></div></div></div>
            <ul className="mt-6 space-y-3 text-sm text-white/82">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#d9ffa8]/16 text-[#d9ffa8]"><Check className="size-3" /></span>{feature}</li>)}</ul>

            {error ? <div role="alert" className="mt-5 rounded-xl border border-[#ffc6d1]/25 bg-[#ad3150]/30 p-3 text-sm text-[#ffe3e9]">{error}</div> : null}

            <button type="button" onClick={handlePayment} disabled={loading || submitting || isExactCurrentPlan} className="checkout-payment-button group mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ffa8] px-5 text-sm font-bold text-[#203707] shadow-[0_12px_30px_rgba(183,243,107,.18)] transition hover:bg-[#c9f887] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {loading || submitting ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
              {loading ? 'Calculating your difference…' : submitting ? 'Opening secure payment…' : isExactCurrentPlan ? 'This is your current plan' : isPlanChange ? `Pay ${dueNowLabel ?? 'prorated'} difference` : 'Continue to secure payment'}
              {!loading && !submitting && !isExactCurrentPlan ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /> : null}
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/48"><ShieldCheck className="size-3.5" /> Payment details are handled securely by Stripe</p>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}
