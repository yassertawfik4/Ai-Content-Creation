import { useMemo, useRef, useState } from 'react'
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from '@stripe/react-stripe-js/checkout'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { formatMoney } from '@/features/billing/format'
import { useAuth } from '@/hooks/useAuth'

const publishableKey = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '').trim()
const hasPublishableKey = /^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(publishableKey)
const stripePromise = hasPublishableKey ? loadStripe(publishableKey) : null
const CONFIRMATION_TIMEOUT_MS = 45_000

const appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#4f378a',
    colorBackground: '#fcf9fc',
    colorText: '#201a25',
    colorDanger: '#9f2949',
    colorTextSecondary: '#746b79',
    fontFamily: '"Inter Variable", sans-serif',
    spacingUnit: '4px',
    borderRadius: '12px',
  },
  rules: {
    '.AccordionItem': {
      border: '1px solid #dfd3e7',
      boxShadow: 'none',
    },
    '.AccordionItem--selected': {
      borderColor: '#4f378a',
      boxShadow: '0 0 0 1px #4f378a',
    },
    '.Input': {
      border: '1px solid #dfd3e7',
      boxShadow: 'none',
      padding: '13px 14px',
    },
    '.Input:focus': {
      borderColor: '#4f378a',
      boxShadow: '0 0 0 3px rgba(79, 55, 138, 0.12)',
    },
    '.Label': {
      color: '#514a56',
      fontSize: '13px',
      fontWeight: '600',
    },
  },
}

function browserCountry() {
  try {
    return new Intl.Locale(navigator.language).region || 'US'
  } catch {
    return 'US'
  }
}

function confirmCheckout(checkout, options) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('Stripe took too long to respond. Check your connection and try again.'))
    }, CONFIRMATION_TIMEOUT_MS)
  })

  return Promise.race([checkout.confirm(options), timeout])
    .finally(() => window.clearTimeout(timeoutId))
}

export function CustomStripeCheckout({
  plan,
  interval,
  priceCents,
  planPriceCents = priceCents,
  currency,
  clientSecret,
  loading,
  error,
  isUpgrade = false,
  previousPlanName,
  repriced = false,
}) {
  const { user } = useAuth()
  const customerName = user?.name?.trim() || 'CARDHOLDER NAME'
  const [preview, setPreview] = useState({
    name: customerName,
    brand: 'unknown',
    touched: false,
    complete: false,
  })
  const checkoutOptions = useMemo(() => ({
    clientSecret,
    elementsOptions: { appearance },
    defaultValues: {
      billingAddress: {
        name: user?.name || undefined,
        address: { country: browserCountry() },
      },
    },
  }), [clientSecret, user?.name])

  return (
    <main className="checkout-custom-shell relative min-h-dvh overflow-hidden text-[#201a25]">
      <div className="checkout-custom-orb checkout-custom-orb-one" aria-hidden="true" />
      <div className="checkout-custom-orb checkout-custom-orb-two" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex max-w-[1220px] items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-[-.02em]">
          <AppLogo />
          Sada
        </Link>
        <Link
          to="/billing"
          className="flex min-h-10 items-center gap-2 rounded-full border border-[#e1d8e5] bg-white/60 px-4 text-sm font-semibold text-[#625b71] backdrop-blur transition hover:border-[#c7b9cf] hover:bg-white hover:text-[#4f378a]"
        >
          <ArrowLeft className="size-4" /> Change plan
        </Link>
      </header>

      <div className="relative z-[1] mx-auto max-w-[1220px] px-5 pb-14 pt-5 sm:px-8 lg:pt-9">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-7 max-w-2xl lg:mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#4f378a]">
              <span className="size-1.5 rounded-full bg-[#9dd75d]" /> Secure checkout
            </span>
            <h1 className="mt-3 font-display text-[clamp(2.3rem,5vw,4.35rem)] font-semibold leading-[.98] tracking-[-.055em]">
              Your plan, ready<br className="hidden sm:block" /> when you are.
            </h1>
          </div>

          <section className="checkout-custom-panel grid items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(430px,.88fr)] lg:gap-10">
            <div className="checkout-preview-panel flex justify-center py-2 sm:py-4 lg:min-h-[650px] lg:items-center">
              <LiveCreditCard
                {...preview}
                planName={plan?.name || plan?.code || 'Selected plan'}
                planPrice={formatMoney(planPriceCents, currency)}
                interval={interval}
              />
            </div>

            <div className="relative rounded-[28px] border border-white/80 bg-[#fcf9fc] p-6 shadow-[0_26px_80px_rgba(46,32,51,.12)] sm:p-10 lg:p-12">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#746b79]">Payment details</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.04em] text-[#201a25]">
                    {isUpgrade ? 'Complete your upgrade' : 'Complete your order'}
                  </h2>
                  {isUpgrade ? (
                    <p className="mt-2 text-xs leading-5 text-[#746b79]">
                      {previousPlanName ? `${previousPlanName} → ${plan.name}. ` : ''}
                      Pay only the prorated difference today.
                    </p>
                  ) : null}
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f2eafa] px-3 py-1.5 text-[11px] font-bold text-[#4f378a] sm:inline-flex">
                  <LockKeyhole className="size-3" /> Stripe secured
                </span>
              </div>

              {repriced ? (
                <div role="status" className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#ead69b] bg-[#fff8df] px-3.5 py-3 text-xs leading-5 text-[#65561f]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  Stripe refreshed the prorated total. The updated amount is shown below.
                </div>
              ) : null}

              {!hasPublishableKey ? (
                <ConfigurationNotice />
              ) : loading || !clientSecret ? (
                <PaymentSkeleton error={error} />
              ) : (
                <CheckoutElementsProvider
                  stripe={stripePromise}
                  options={checkoutOptions}
                >
                  <SecurePaymentForm
                    initialName={customerName}
                    plan={plan}
                    interval={interval}
                    priceCents={priceCents}
                    currency={currency}
                    isUpgrade={isUpgrade}
                    apiError={error}
                    onPreviewChange={setPreview}
                  />
                </CheckoutElementsProvider>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  )
}

function SecurePaymentForm({
  initialName,
  plan,
  interval,
  priceCents,
  currency,
  isUpgrade,
  apiError,
  onPreviewChange,
}) {
  const result = useCheckoutElements()
  const [name, setName] = useState(initialName === 'CARDHOLDER NAME' ? '' : initialName)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  if (result.type === 'loading') return <PaymentSkeleton />
  if (result.type === 'error') return <PaymentSkeleton error={result.error.message} />

  const { checkout } = result

  const handleNameChange = (event) => {
    const value = event.target.value.slice(0, 32)
    setName(value)
    onPreviewChange((current) => ({ ...current, name: value || 'CARDHOLDER NAME' }))
  }

  const handlePaymentReady = (element) => {
    element.on('carddetailschange', (event) => {
      const brand = event.details?.brands?.[0] || 'unknown'
      onPreviewChange((current) => ({ ...current, brand }))
    })
  }

  const handlePaymentChange = (event) => {
    setPaymentComplete(event.complete)
    onPreviewChange((current) => ({
      ...current,
      touched: !event.empty,
      complete: event.complete,
      name: event.value?.payment_method?.billing_details?.name || name || 'CARDHOLDER NAME',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    if (!name.trim()) {
      setFormError('Enter the name shown on the card.')
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      const address = checkout.billingAddress?.address ?? { country: browserCountry() }
      const confirmation = await confirmCheckout(checkout, {
        billingAddress: { name: name.trim(), address },
      })

      if (confirmation.type === 'error') {
        setFormError(confirmation.error.message || 'Stripe could not confirm this payment.')
        return
      }

      if (!confirmation.session?.id) {
        throw new Error('Stripe confirmed the payment without returning a Checkout Session.')
      }

      const params = new URLSearchParams({
        success: '1',
        completedPlan: plan.code,
        interval,
        session_id: confirmation.session.id,
      })
      window.location.assign(`/billing?${params.toString()}`)
    } catch (confirmationError) {
      setFormError(
        confirmationError instanceof Error
          ? confirmationError.message
          : 'Stripe could not confirm this payment. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="mt-8" onSubmit={handleSubmit} noValidate>
      <label className="block text-[13px] font-semibold text-[#514a56]" htmlFor="cardholder-name">
        Cardholder name
      </label>
      <input
        id="cardholder-name"
        name="cardholderName"
        value={name}
        onChange={handleNameChange}
        autoComplete="cc-name"
        placeholder="Name on card"
        className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd3e7] bg-white px-3.5 text-[15px] outline-none transition placeholder:text-[#9a909f] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
      />

      <div className="mt-5">
        <PaymentElement
          options={{
            layout: 'accordion',
            paymentMethodOrder: ['card'],
            wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
            // The Checkout Session already has an existing Stripe Customer
            // with an email. Collecting or defaulting email here makes Stripe
            // attempt to update that locked Session email during confirmation.
            fields: {
              billingDetails: {
                name: 'never',
                email: 'never',
                address: { country: 'never' },
              },
            },
          }}
          onReady={handlePaymentReady}
          onChange={handlePaymentChange}
          onLoadError={(event) => setFormError(event.error.message)}
        />
      </div>

      {formError || apiError ? (
        <p role="alert" className="mt-4 rounded-xl border border-[#ecc9cf] bg-[#fff2f4] px-3.5 py-3 text-sm text-[#8b2942]">
          {formError || apiError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !checkout.canConfirm || !paymentComplete}
        className="group mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(79,55,138,.22)] transition hover:-translate-y-0.5 hover:bg-[#381e72] hover:shadow-[0_18px_38px_rgba(79,55,138,.28)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#4f378a]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        {submitting
          ? 'Processing securely…'
          : `Pay ${formatMoney(priceCents, currency)}${isUpgrade ? ' difference' : ''}`}
        {!submitting ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /> : null}
      </button>

      <div className="mt-5 flex items-center justify-center gap-5 text-[11px] font-medium text-[#746b79]">
        <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#4f378a]" /> PCI compliant</span>
        <span className="flex items-center gap-1.5"><CreditCard className="size-3.5 text-[#4f378a]" /> Powered by Stripe</span>
      </div>
    </form>
  )
}

function LiveCreditCard({ name, brand, touched, complete, planName, planPrice, interval }) {
  const cardRef = useRef(null)
  const frameRef = useRef(0)
  const detailStateClass = complete ? 'is-complete' : touched ? 'is-active' : ''

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch') return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      if (!card) return
      const bounds = card.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height
      card.style.setProperty('--card-rx', `${(0.5 - y) * 13}deg`)
      card.style.setProperty('--card-ry', `${(x - 0.5) * 16}deg`)
      card.style.setProperty('--card-glow-x', `${x * 100}%`)
      card.style.setProperty('--card-glow-y', `${y * 100}%`)
    })
  }

  const resetTilt = () => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--card-rx', '0deg')
    card.style.setProperty('--card-ry', '0deg')
    card.style.setProperty('--card-glow-x', '50%')
    card.style.setProperty('--card-glow-y', '50%')
  }

  return (
    <div className="credit-card-scene relative z-[1]">
      <div
        ref={cardRef}
        className={`credit-card-3d ${complete ? 'is-complete' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        aria-label={`${planName} plan at ${planPrice} per ${interval}, secure card preview for ${name}`}
      >
        <div className="credit-card-noise" aria-hidden="true" />
        <div className="credit-card-glow" aria-hidden="true" />
        <div className="relative z-[2] flex items-start justify-between">
          <div className="credit-card-chip" aria-hidden="true"><span /><span /><span /></div>
          <div className="text-right">
            <p className="font-display text-xl font-black italic tracking-[-.06em] text-white sm:text-2xl">{brandLabel(brand)}</p>
            <p className="mt-1 max-w-52 truncate text-[8px] font-bold uppercase tracking-[.14em] text-white/55 sm:text-[9px]">
              {planName} · {planPrice}/{interval}
            </p>
          </div>
        </div>

        <div className="relative z-[2] mt-8 sm:mt-14 lg:mt-16">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/38 sm:text-[9px]">Card number</p>
            <p className={`credit-card-number mt-1.5 ${detailStateClass}`}>••••&nbsp; ••••&nbsp; ••••&nbsp; ••••</p>
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-4 sm:mt-5 sm:gap-7">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/38 sm:text-[9px]">Cardholder</p>
              <p className="mt-1 truncate text-[13px] font-semibold uppercase tracking-[.12em] text-white sm:text-[15px]">{name}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/38 sm:text-[9px]">Expires</p>
              <p className={`credit-card-sensitive-value mt-1 ${detailStateClass}`}>••/••</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/38 sm:text-[9px]">Security</p>
              <p className={`credit-card-sensitive-value mt-1 ${detailStateClass}`}>•••</p>
            </div>
          </div>
        </div>

        <div className="credit-card-status relative z-[2] mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/45 sm:mt-5">
          <span className={`size-1.5 rounded-full ${complete ? 'bg-[#c8f39c]' : touched ? 'bg-[#ffd978]' : 'bg-white/30'}`} />
          {complete ? 'Ready to process' : touched ? 'Checking details' : 'Waiting for card details'}
        </div>
      </div>
    </div>
  )
}

function brandLabel(brand) {
  const labels = {
    visa: 'VISA',
    mastercard: 'mastercard',
    amex: 'AMEX',
    discover: 'DISCOVER',
    diners: 'DINERS',
    jcb: 'JCB',
    unionpay: 'UNIONPAY',
  }
  return labels[brand] || 'SADA'
}

function PaymentSkeleton({ error }) {
  return (
    <div className="mt-8">
      {error ? (
        <p role="alert" className="rounded-xl border border-[#ecc9cf] bg-[#fff2f4] px-3.5 py-3 text-sm text-[#8b2942]">{error}</p>
      ) : (
        <div className="space-y-4" aria-label="Loading secure payment form">
          <div className="h-12 animate-pulse rounded-xl bg-[#eee8f2]" />
          <div className="h-32 animate-pulse rounded-xl bg-[#eee8f2]" />
          <div className="flex items-center gap-2 text-sm text-[#746b79]"><Loader2 className="size-4 animate-spin" /> Preparing encrypted fields…</div>
        </div>
      )}
    </div>
  )
}

function ConfigurationNotice() {
  return (
    <div role="alert" className="mt-8 rounded-2xl border border-[#e6d8a9] bg-[#fff9df] p-5 text-sm text-[#65561f]">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-bold">Stripe needs a publishable key</p>
          <p className="mt-1 leading-6">Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to a key beginning with <code>pk_</code>. Never put a Stripe secret key in the frontend environment.</p>
        </div>
      </div>
    </div>
  )
}
