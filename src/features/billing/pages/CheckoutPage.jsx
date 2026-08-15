import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Coins,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import brandMark from '@/assets/auth/brand-mark.svg'
import { CustomStripeCheckout } from '@/features/billing/components/CustomStripeCheckout'
import { useCheckoutPage } from '@/features/billing/hooks/useCheckoutPage'
import { formatBillingDate, formatMoney } from '@/features/billing/format'
import { getPlanPrice, yearlySavingCents } from '@/features/billing/plans'

export function CheckoutPage() {
  const {
    plan,
    interval,
    subscription,
    quote,
    error,
    repriced,
    acknowledgeReprice,
    paymentBlocked,
    isPlanChange,
    isUpgradeIntent,
    isPaidUpgrade,
    isExactCurrentPlan,
    isScheduledDowngrade,
    loading,
    quoteLoading,
    checkoutClientSecret,
    checkoutLoading,
    submitting,
    confirm,
    openPortal,
    planMissing,
  } = useCheckoutPage()

  if (planMissing || plan?.code === 'free') {
    return <UnavailableCheckout />
  }

  if (!plan) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#fef7ff]">
        <Loader2 className="size-6 animate-spin text-[#4f378a]" />
      </main>
    )
  }

  const priceCents = getPlanPrice(plan, interval)
  const currency = quote?.currency ?? 'USD'
  const saving = yearlySavingCents(plan)

  if (isUpgradeIntent || (!isPlanChange && !isExactCurrentPlan)) {
    return (
      <CustomStripeCheckout
        plan={plan}
        interval={interval}
        priceCents={isPaidUpgrade ? quote.amountDueCents : 0}
        planPriceCents={priceCents}
        currency={currency}
        clientSecret={checkoutClientSecret}
        loading={quoteLoading || checkoutLoading || (isUpgradeIntent && !quote)}
        error={error}
        isUpgrade={isUpgradeIntent}
        previousPlanName={subscription?.plan?.name}
        repriced={repriced}
      />
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f6f0f7] text-[#201a25]">
      <div className="checkout-background-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-[1120px] items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#4f378a]"><img src={brandMark} alt="" className="size-[17px]" /></span>
          Sada
        </Link>
        <Link to="/billing" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#625b71] hover:bg-white/70 hover:text-[#381e72]">
          <ArrowLeft className="size-4" /> Change plan
        </Link>
      </header>

      <div className="relative mx-auto grid max-w-[1040px] gap-8 px-5 pb-14 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)] lg:items-start lg:pt-12">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(46,32,51,0.12)] backdrop-blur sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f2eafa] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#4f378a]">
            {isScheduledDowngrade ? <CalendarClock className="size-3.5" /> : <CreditCard className="size-3.5" />}
            {isScheduledDowngrade ? 'Scheduled change' : 'Secure checkout'}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-[-.8px] sm:text-5xl">
            {isScheduledDowngrade ? <>Confirm your<br />plan change.</> : <>Finish setting up<br />your plan.</>}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#6a6170]">
            {isScheduledDowngrade
              ? `You keep ${subscription?.plan?.name ?? 'your current plan'} — and every credit that comes with it — until the period you have already paid for ends. Nothing is charged today.`
              : isPlanChange
                ? 'You are credited for the unused time on your current plan and pay only the difference for the rest of this billing period.'
                : 'Review your order here, then continue to Stripe’s encrypted payment page to enter your card and billing details.'}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {(isScheduledDowngrade
              ? ['Nothing to pay now', 'Current credits stay usable', 'Undo any time before it starts']
              : [isPlanChange ? 'Pay only the prorated difference' : '256-bit encrypted payment', 'Instant credit activation', 'Cancel whenever you need']
            ).map((item) => (
              <div key={item} className="rounded-2xl border border-[#e6dee8] bg-[#fcf9fc] p-3 text-xs font-medium leading-5 text-[#514a56]">
                <Check className="mb-2 size-4 text-[#5c8e20]" />{item}
              </div>
            ))}
          </div>

          {isPlanChange && quote?.credits ? <CreditProjection quote={quote} planName={plan.name} /> : null}

          {!isScheduledDowngrade ? (
            <div className="mt-8 rounded-2xl border border-[#dfd3e7] bg-[#f8f2f9] p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#4f378a]" />
                <div>
                  <p className="text-sm font-bold">Your card data never touches our servers</p>
                  <p className="mt-1 text-xs leading-5 text-[#746b79]">Stripe securely collects and processes the payment. Sada only receives the subscription result.</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="checkout-order-summary overflow-hidden rounded-[28px] text-white">
          <div className="border-b border-white/12 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#d9ffa8]">Order summary</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{interval === 'year' ? 'Yearly' : 'Monthly'}</span>
            </div>
            <h2 className="mt-5 font-display text-3xl">{plan.name}</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">{plan.description}</p>

            {isPlanChange ? (
              <MoneyBreakdown
                quote={quote}
                loading={quoteLoading}
                currency={currency}
                currentPlanName={subscription?.plan?.name}
              />
            ) : null}

            <div className={`${isPlanChange ? 'mt-4' : 'mt-6'} flex items-end gap-2`}>
              <span className={`${isPlanChange ? 'text-2xl' : 'text-5xl'} font-display font-bold tracking-[-1px]`}>{formatMoney(priceCents, currency)}</span>
              <span className="mb-1 text-sm text-white/55">/ {interval}{isPlanChange ? ' after this period' : ''}</span>
            </div>
            {interval === 'year' && saving > 0 ? (
              <p className="mt-2 text-xs font-semibold text-[#d9ffa8]">You save {formatMoney(saving, currency)} each year</p>
            ) : null}
          </div>

          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <Coins className="size-5 text-[#d9ffa8]" />
                <div>
                  <p className="font-bold">{plan.generationCredits} credits</p>
                  <p className="text-xs text-white/55">Refreshed every month</p>
                </div>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/82">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#d9ffa8]/16 text-[#d9ffa8]"><Check className="size-3" /></span>
                  {feature}
                </li>
              ))}
            </ul>

            {repriced ? (
              <div role="status" className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#ffe08a]/30 bg-[#8a6d1f]/30 p-3 text-sm text-[#fff3cf]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>The amount changed while you were reviewing. The new total is shown above — confirm it to continue.</span>
              </div>
            ) : null}

            {error ? <div role="alert" className="mt-5 rounded-xl border border-[#ffc6d1]/25 bg-[#ad3150]/30 p-3 text-sm text-[#ffe3e9]">{error}</div> : null}

            {paymentBlocked ? (
              <PortalPrompt onOpen={openPortal} submitting={submitting} />
            ) : (
              <ConfirmButton
                onClick={repriced ? () => { acknowledgeReprice(); confirm() } : confirm}
                disabled={loading || quoteLoading || submitting || isExactCurrentPlan}
                loading={loading || quoteLoading}
                submitting={submitting}
                isExactCurrentPlan={isExactCurrentPlan}
                isScheduledDowngrade={isScheduledDowngrade}
                isPlanChange={isPlanChange}
                repriced={repriced}
                amountLabel={quote ? formatMoney(quote.amountDueCents, currency) : null}
                effectiveAt={formatBillingDate(quote?.effectiveAt)}
              />
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/48">
              <ShieldCheck className="size-3.5" />
              {isScheduledDowngrade ? 'You can undo this from the billing page any time before it starts' : 'Payment details are handled securely by Stripe'}
            </p>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}

/**
 * The three lines that answer "why am I paying this?" — credit for time already
 * bought, cost of the new plan for what is left, and the net.
 */
function MoneyBreakdown({ quote, loading, currency, currentPlanName }) {
  if (loading || !quote) {
    return (
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/60">
        <Loader2 className="mr-2 inline size-4 animate-spin" />Calculating your difference…
      </div>
    )
  }

  if (quote.kind === 'DOWNGRADE') {
    return (
      <div className="mt-6 rounded-2xl border border-[#d9ffa8]/25 bg-[#d9ffa8]/10 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d9ffa8]">Due today</p>
        <p className="mt-1 font-display text-4xl font-bold">{formatMoney(0, currency)}</p>
        <p className="mt-2 text-xs leading-5 text-white/60">
          {formatBillingDate(quote.effectiveAt)
            ? `Your new plan starts on ${formatBillingDate(quote.effectiveAt)}, when the period you have already paid for ends.`
            : 'Your new plan starts when the period you have already paid for ends.'}
        </p>
      </div>
    )
  }

  const { unusedCreditCents, newPlanChargeCents } = quote.breakdown ?? {}

  return (
    <div className="mt-6 rounded-2xl border border-[#d9ffa8]/25 bg-[#d9ffa8]/10 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d9ffa8]">Due now</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-3 text-white/70">
          <dt>Unused {currentPlanName ?? 'current plan'} time</dt>
          <dd className="tabular-nums">−{formatMoney(unusedCreditCents ?? 0, currency)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-white/70">
          <dt>Rest of this period on the new plan</dt>
          <dd className="tabular-nums">{formatMoney(newPlanChargeCents ?? 0, currency)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-white/15 pt-2 font-bold">
          <dt>Total</dt>
          <dd className="font-display text-3xl tabular-nums">{formatMoney(quote.amountDueCents, currency)}</dd>
        </div>
      </dl>
    </div>
  )
}

/**
 * What the switch does to the credit balance. Credits already spent stay spent,
 * so an upgrade grants the difference rather than a second full allowance —
 * saying so here is what stops that reading as a bug.
 */
function CreditProjection({ quote, planName }) {
  const { limit, used, newLimit, newRemaining, periodEnd } = quote.credits
  const resetOn = formatBillingDate(periodEnd)
  const isDowngrade = quote.kind === 'DOWNGRADE'
  const shortfall = isDowngrade && used > newLimit

  return (
    <div className="mt-8 rounded-2xl border border-[#dfd3e7] bg-[#f8f2f9] p-4">
      <div className="flex items-start gap-3">
        <Coins className="mt-0.5 size-5 shrink-0 text-[#4f378a]" />
        <div>
          <p className="text-sm font-bold">What happens to your credits</p>
          <p className="mt-1 text-xs leading-5 text-[#746b79]">
            You have used <strong>{used}</strong> of your <strong>{limit}</strong> credits this period.{' '}
            {isDowngrade ? (
              shortfall ? (
                <>When {planName} starts you will be over its {newLimit}-credit allowance, so nothing new can run until your credits reset{resetOn ? ` on ${resetOn}` : ''}.</>
              ) : (
                <>When {planName} starts, your allowance becomes <strong>{newLimit}</strong> credits.</>
              )
            ) : (
              <>Upgrading raises your allowance to <strong>{newLimit}</strong>, leaving you <strong>{newRemaining}</strong> to use{resetOn ? ` before it resets on ${resetOn}` : ''}. Credits you have already used stay used — you are paying for the difference, not a second allowance.</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function ConfirmButton({
  onClick,
  disabled,
  loading,
  submitting,
  isExactCurrentPlan,
  isScheduledDowngrade,
  isPlanChange,
  repriced,
  amountLabel,
  effectiveAt,
}) {
  const label = () => {
    if (loading) return 'Calculating your difference…'
    if (submitting) return isScheduledDowngrade ? 'Scheduling…' : 'Opening secure payment…'
    if (isExactCurrentPlan) return 'This is your current plan'
    if (repriced) return `Confirm ${amountLabel ?? 'the new total'}`
    if (isScheduledDowngrade) return effectiveAt ? `Schedule for ${effectiveAt}` : 'Schedule this change'
    if (isPlanChange) return `Pay ${amountLabel ?? 'prorated'} difference`
    return 'Continue to secure payment'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="checkout-payment-button group mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ffa8] px-5 text-sm font-bold text-[#203707] shadow-[0_12px_30px_rgba(183,243,107,.18)] transition hover:bg-[#c9f887] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading || submitting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isScheduledDowngrade ? (
        <CalendarClock className="size-4" />
      ) : (
        <CreditCard className="size-4" />
      )}
      {label()}
      {!loading && !submitting && !isExactCurrentPlan ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /> : null}
    </button>
  )
}

/** Stripe refuses plan changes while an invoice is unpaid. */
function PortalPrompt({ onOpen, submitting }) {
  return (
    <div className="mt-7">
      <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#ffc6d1]/25 bg-[#ad3150]/30 p-3 text-sm text-[#ffe3e9]">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>Your last payment did not go through. Update your payment details before changing plan.</span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={submitting}
        className="group mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ffa8] px-5 text-sm font-bold text-[#203707] transition hover:bg-[#c9f887] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        {submitting ? 'Opening payment settings…' : 'Update payment details'}
      </button>
    </div>
  )
}

function UnavailableCheckout() {
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
