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
  const [checkoutSession, setCheckoutSession] = useState({ key: null, clientSecret: null })
  /** Set when a quote was replaced under the customer and needs re-confirming. */
  const [repriced, setRepriced] = useState(false)
  const latestQuoteRequest = useRef(0)
  const checkoutRequest = useRef({ key: null, promise: null })

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
  // The included Free entitlement can be ACTIVE without having a Stripe
  // subscription. Its first paid purchase must still use the custom checkout.
  const hasStripeSubscription = active && Boolean(subscription?.stripeSubscriptionId)
  const paymentBlocked = isPaymentBlocked(status)
  const currentInterval = normalizeInterval(subscription?.billingInterval)
  const isSamePlan = hasStripeSubscription && subscription?.plan?.code === plan?.code
  const isExactCurrentPlan = isSamePlan && currentInterval === interval
  const isPlanChange = Boolean(hasStripeSubscription && plan && !isExactCurrentPlan)
  // Mirror the backend's direction rules so an upgrade can enter the payment
  // design immediately, without flashing the plan-change summary while its
  // trusted Stripe quote is still loading.
  const currentSortOrder = Number(subscription?.plan?.sortOrder ?? 0)
  const targetSortOrder = Number(plan?.sortOrder ?? 0)
  const isUpgradeIntent = Boolean(
    isPlanChange && (
      targetSortOrder > currentSortOrder ||
      (targetSortOrder === currentSortOrder &&
        currentInterval === 'month' && interval === 'year')
    ),
  )
  const quoteKey = isPlanChange && !paymentBlocked ? `${plan.code}:${interval}` : null
  const quote = quoteState.key === quoteKey ? quoteState.quote : null
  const quoteLoading = Boolean(quoteKey) && !quote && !error
  const isPaidUpgrade = Boolean(
    isPlanChange && quote?.kind === 'UPGRADE' && quote.amountDueCents > 0,
  )
  // Do not guess that the customer is a first-time buyer while their current
  // subscription is still loading. That race called `/checkout` for existing
  // subscribers and correctly came back as a 409 conflict.
  const customCheckoutKey = !plan || subscriptionLoading || error
    ? null
    : !hasStripeSubscription
      ? `initial:${plan.code}:${interval}`
      : isUpgradeIntent && quote?.kind === 'UPGRADE'
        ? `upgrade:${quote.quoteId}`
        : null
  const checkoutClientSecret = checkoutSession.key === customCheckoutKey
    ? checkoutSession.clientSecret
    : null
  const checkoutLoading = Boolean(customCheckoutKey) && !checkoutClientSecret && !error

  // First purchases and paid upgrades both render Stripe's Payment Element in
  // this page. Keep the in-flight mutation in a ref so React StrictMode can
  // subscribe to the same request instead of opening a duplicate Session.
  useEffect(() => {
    if (!customCheckoutKey || !plan) return

    let activeRequest = true
    const promise = checkoutRequest.current.key === customCheckoutKey
      ? checkoutRequest.current.promise
      : isUpgradeIntent
        ? changePlan({
            planCode: plan.code,
            interval,
            quoteId: quote.quoteId,
            uiMode: 'custom',
          })
        : createCheckout({ planCode: plan.code, interval, uiMode: 'custom' })

    checkoutRequest.current = { key: customCheckoutKey, promise }

    promise
      .then((result) => {
        if (!activeRequest) return
        // A zero-cost upgrade is applied directly and has no Payment Element
        // to render. Finish the flow without showing the removed summary page.
        if (isUpgradeIntent && !result?.clientSecret && result?.kind === 'UPGRADE') {
          navigate('/billing?success=1', { replace: true })
          return
        }
        if (!result?.clientSecret) {
          throw new Error('Stripe did not return a secure checkout session.')
        }
        setCheckoutSession({ key: customCheckoutKey, clientSecret: result.clientSecret })
      })
      .catch(async (requestError) => {
        if (!activeRequest) return

        const isQuoteConflict =
          requestError?.data?.code === 'PLAN_CHANGE_QUOTE_STALE' ||
          (requestError?.status === 409 && !requestError?.data)

        if (isUpgradeIntent && isQuoteConflict && quoteKey) {
          try {
            const fresh = requestError?.data?.quote ?? await previewPlanChange({
              planCode: plan.code,
              interval,
            })
            if (!activeRequest) return
            setQuoteState({ key: quoteKey, quote: fresh })
            setRepriced(true)
            setError('')
          } catch (quoteError) {
            if (activeRequest) setError(getErrorMessage(quoteError))
          }
          return
        }

        setError(getErrorMessage(requestError))
      })

    return () => {
      activeRequest = false
    }
  }, [customCheckoutKey, plan, interval, isUpgradeIntent, quote, quoteKey, navigate])

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
      const isQuoteConflict =
        paymentError?.data?.code === 'PLAN_CHANGE_QUOTE_STALE' ||
        (paymentError?.status === 409 && !paymentError?.data)

      if (isQuoteConflict && quoteKey) {
        try {
          // Some proxies can strip the structured 409 body. In that case,
          // request a fresh trusted quote explicitly instead of exposing the
          // unhelpful raw HTTP status or leaving the user stuck.
          const fresh = paymentError?.data?.quote ?? await previewPlanChange({
            planCode: plan.code,
            interval,
          })
          setQuoteState({ key: quoteKey, quote: fresh })
          setRepriced(true)
          setError('')
        } catch (quoteError) {
          setError(getErrorMessage(
            quoteError,
            'The plan price changed. Please refresh the page and review it again.',
          ))
        }
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
    isUpgradeIntent,
    isPaidUpgrade,
    isExactCurrentPlan,
    isScheduledDowngrade: quote?.kind === 'DOWNGRADE',
    loading: plansLoading || subscriptionLoading,
    quoteLoading,
    checkoutClientSecret,
    checkoutLoading,
    submitting,
    confirm,
    openPortal,
    planMissing: !plansLoading && !plan,
  }
}
