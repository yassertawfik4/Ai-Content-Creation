import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  changePlan,
  createBillingPortal,
  createCheckout,
  getErrorMessage,
  getSubscription,
  previewPlanChange,
} from '@/lib/billingApi'
import { usePlanCatalog } from '@/features/billing/hooks/usePlanCatalog'
import {
  isActiveStatus,
  isPaymentBlocked,
  normalizeInterval,
} from '@/features/billing/format'

/**
 * Drives the confirmation screen for both a first subscription and a switch.
 *
 * A switch is quoted before it is applied, and the quote id is carried into the
 * confirmation so the customer is charged the figure they were shown. If the
 * backend says that figure has moved, the new quote replaces it and the button
 * asks for a second, explicit confirmation rather than charging silently.
 */
export function useCheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { plans, loading: plansLoading, error: plansError } = usePlanCatalog()

  const requestedCode = searchParams.get('plan')
  const interval = normalizeInterval(searchParams.get('interval'))
  const plan = plans.find((entry) => entry.code === requestedCode)

  const [subscription, setSubscription] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  /**
   * The quote is stored against the plan+interval it was fetched for, so a
   * stale response for a plan the customer has navigated away from can never be
   * shown as the price of the plan they are looking at now.
   */
  const [quoteState, setQuoteState] = useState({ key: null, quote: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  /** Set when a quote was replaced under the customer and needs re-confirming. */
  const [repriced, setRepriced] = useState(false)
  const latestQuoteRequest = useRef(0)

  useEffect(() => {
    const controller = new AbortController()

    getSubscription({ signal: controller.signal })
      .then((data) => setSubscription(data ?? null))
      .catch((requestError) => {
        if (requestError?.name === 'AbortError') return
        setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setSubscriptionLoading(false)
      })

    return () => controller.abort()
  }, [])

  const status = subscription?.status
  const active = isActiveStatus(status)
  const paymentBlocked = isPaymentBlocked(status)
  const currentInterval = normalizeInterval(subscription?.billingInterval)
  const isSamePlan = active && subscription?.plan?.code === plan?.code
  const isExactCurrentPlan = isSamePlan && currentInterval === interval
  const isPlanChange = Boolean(active && plan && !isExactCurrentPlan)
  const quoteKey = isPlanChange && !paymentBlocked ? `${plan.code}:${interval}` : null
  const quote = quoteState.key === quoteKey ? quoteState.quote : null
  const quoteLoading = Boolean(quoteKey) && !quote && !error

  // Quote the switch as soon as we know it is one. A first subscription has
  // nothing to prorate, so it skips straight to Stripe Checkout.
  useEffect(() => {
    if (!quoteKey || !plan) return

    const requestId = latestQuoteRequest.current + 1
    latestQuoteRequest.current = requestId
    const controller = new AbortController()

    previewPlanChange({ planCode: plan.code, interval }, { signal: controller.signal })
      .then((result) => {
        if (latestQuoteRequest.current !== requestId) return
        setQuoteState({ key: quoteKey, quote: result })
      })
      .catch((requestError) => {
        if (requestError?.name === 'AbortError') return
        setError(getErrorMessage(requestError))
      })

    return () => controller.abort()
  }, [quoteKey, plan, interval])

  const openPortal = useCallback(async () => {
    setError('')
    setSubmitting(true)
    try {
      const { url } = await createBillingPortal()
      window.location.assign(url)
    } catch (portalError) {
      setError(getErrorMessage(portalError))
      setSubmitting(false)
    }
  }, [])

  const confirm = useCallback(async () => {
    if (!plan) return
    setError('')
    setSubmitting(true)

    try {
      const result = isPlanChange
        ? await changePlan({
            planCode: plan.code,
            interval,
            quoteId: quote?.quoteId,
          })
        : await createCheckout({ planCode: plan.code, interval })

      if (result?.url) {
        window.location.assign(result.url)
        return
      }

      // A downgrade is scheduled, not charged, so there is no Stripe page to
      // visit — go straight back to billing with the outcome.
      navigate(
        result?.scheduled ? '/billing?scheduled=1' : '/billing?success=1',
        { replace: true },
      )
    } catch (paymentError) {
      const fresh = paymentError?.data?.quote
      if (paymentError?.data?.code === 'PLAN_CHANGE_QUOTE_STALE' && fresh) {
        // The price moved between quoting and confirming. Show the new figure
        // and make the customer agree to it rather than billing the difference.
        setQuoteState({ key: quoteKey, quote: fresh })
        setRepriced(true)
        setError('')
      } else {
        setError(getErrorMessage(paymentError))
      }
      setSubmitting(false)
    }
  }, [plan, interval, isPlanChange, quote, quoteKey, navigate])

  const acknowledgeReprice = useCallback(() => setRepriced(false), [])

  return {
    plan,
    interval,
    subscription,
    quote,
    error: error || plansError,
    repriced,
    acknowledgeReprice,
    paymentBlocked,
    isPlanChange,
    isExactCurrentPlan,
    isScheduledDowngrade: quote?.kind === 'DOWNGRADE',
    loading: plansLoading || subscriptionLoading,
    quoteLoading,
    submitting,
    confirm,
    openPortal,
    planMissing: !plansLoading && !plan,
  }
}
