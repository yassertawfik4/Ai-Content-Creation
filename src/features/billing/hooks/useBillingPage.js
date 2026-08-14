import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  cancelPendingPlanChange,
  cancelSubscription,
  changePlan,
  confirmCheckout,
  getCreditUsage,
  getErrorMessage,
  getSubscription,
} from '@/lib/billingApi'
import { usePlanCatalog } from '@/features/billing/hooks/usePlanCatalog'
import { isActiveStatus, normalizeInterval } from '@/features/billing/format'

/** Stripe redirects back before its webhook lands; wait for the exact purchase. */
const SETTLE_ATTEMPTS = 20
const SETTLE_DELAY_MS = 1500

function initialPopup(params) {
  if (params.get('success') === '1') {
    return {
      kind: 'notice',
      title: 'Payment successful — activating your plan',
      body: 'We are syncing your new subscription with Stripe. This usually takes a few seconds.',
    }
  }
  if (params.get('scheduled') === '1') {
    return {
      kind: 'notice',
      title: 'Plan change scheduled',
      body: 'Your current plan and its credits stay available until the period you have paid for ends. You can undo this any time before then.',
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
}

export function useBillingPage() {
  const { plans, loading: plansLoading, error: plansError } = usePlanCatalog()
  const [subscription, setSubscription] = useState(null)
  const [creditUsage, setCreditUsage] = useState(null)
  const [interval, setInterval] = useState(() =>
    normalizeInterval(new URLSearchParams(window.location.search).get('interval')),
  )
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [popup, setPopup] = useState(() =>
    initialPopup(new URLSearchParams(window.location.search)),
  )
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  // The query string is only meaningful on the first render; it is stripped
  // straight afterwards, so both flags are captured once.
  const initialSearch = new URLSearchParams(window.location.search)
  const requestedPlanRef = useRef(initialSearch.get('plan'))
  const awaitingWebhookRef = useRef(initialSearch.get('success') === '1')
  const completedPlanRef = useRef(initialSearch.get('completedPlan'))
  const checkoutSessionRef = useRef(initialSearch.get('session_id'))
  const completedIntervalRef = useRef(
    initialSearch.has('completedPlan') ? normalizeInterval(initialSearch.get('interval')) : null,
  )
  const continuedCheckoutRef = useRef(false)

  const load = useCallback(async ({ signal } = {}) => {
    // Read the entitlement after the subscription. When the Stripe webhook is
    // committing an upgrade, parallel reads can otherwise pair the new plan
    // with the previous plan's credit allowance for one render.
    const subscriptionData = await getSubscription({ signal })
    const usageData = await getCreditUsage({ signal })
    setError('')
    setSubscription(subscriptionData ?? null)
    setCreditUsage(usageData ?? null)
    if (subscriptionData?.billingInterval) {
      setInterval(normalizeInterval(subscriptionData.billingInterval))
    }
    return subscriptionData ?? null
  }, [])

  useEffect(() => {
    if (popup) navigate('/billing', { replace: true })
    // The query string is read once on mount and then cleaned up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    // Returning from Stripe, the subscription may not be updated yet. Poll
    // briefly rather than showing the customer their old plan right after they
    // paid for a new one.
    const awaitingWebhook = awaitingWebhookRef.current
    const completedPlan = completedPlanRef.current
    const completedInterval = completedIntervalRef.current
    const checkoutSession = checkoutSessionRef.current

    const run = async () => {
      // Reconcile directly from Stripe before polling. Calling this without a
      // session id also repairs a recent paid upgrade made with an older
      // Checkout success URL whose webhook never reached local development.
      try {
        await confirmCheckout(
          {
            sessionId: checkoutSession,
            planCode: completedPlan,
            interval: completedInterval,
          },
          { signal: controller.signal },
        )
      } catch (confirmationError) {
        if (controller.signal.aborted) return false
        // An ordinary visit to Billing should still load if Stripe is briefly
        // unavailable. A checkout return surfaces the verification failure.
        if (awaitingWebhook) throw confirmationError
      }

      let startingEntitlement = null
      let startedWithActiveSubscription = false

      for (let attempt = 0; attempt < (awaitingWebhook ? SETTLE_ATTEMPTS : 1); attempt += 1) {
        const data = await load({ signal: controller.signal })
        const currentEntitlement = data
          ? `${data?.plan?.code ?? ''}:${normalizeInterval(data?.billingInterval)}`
          : null
        if (attempt === 0) {
          startingEntitlement = currentEntitlement
          startedWithActiveSubscription = isActiveStatus(data?.status)
        }
        const matchesCompletedPurchase = completedPlan
          ? data?.plan?.code === completedPlan &&
            (!completedInterval || normalizeInterval(data?.billingInterval) === completedInterval)
          : !startedWithActiveSubscription || currentEntitlement !== startingEntitlement
        const exactPlanIsActive =
          isActiveStatus(data?.status) &&
          matchesCompletedPurchase

        if (!awaitingWebhook || exactPlanIsActive) {
          if (awaitingWebhook) {
            setPopup({
              kind: 'success',
              title: `${data?.plan?.name ?? 'Your new plan'} is now active`,
              body: 'Your subscription and generation credits have been updated.',
            })
            void refreshSession().catch(() => undefined)
          }
          return true
        }
        if (controller.signal.aborted) return
        await new Promise((resolve) => setTimeout(resolve, SETTLE_DELAY_MS))
      }
      return false
    }

    run()
      .then((settled) => {
        if (controller.signal.aborted || !awaitingWebhook || settled) return
        setPopup({
          kind: 'notice',
          title: 'Payment received — activation is taking longer than usual',
          body: 'Stripe is still syncing your plan. Refresh this page in a moment; you will not be charged again.',
        })
      })
      .catch((loadError) => {
        if (loadError?.name === 'AbortError' || controller.signal.aborted) return
        setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [load, refreshSession])

  const activeStatus = isActiveStatus(subscription?.status)
  const currentPlanCode = subscription?.plan?.code
  const subscribedInterval = normalizeInterval(subscription?.billingInterval)
  const pendingChange = subscription?.pendingPlanId
    ? {
        planName: subscription.pendingPlan?.name ?? 'your new plan',
        planCode: subscription.pendingPlan?.code ?? null,
        effectiveAt: subscription.pendingEffectiveAt,
      }
    : null

  const goToCheckout = useCallback(
    (planCode) => {
      navigate(`/checkout?plan=${encodeURIComponent(planCode)}&interval=${interval}`)
    },
    [interval, navigate],
  )

  const choosePlan = useCallback(
    (planCode) => {
      // A signed-in user with no paid subscription is already on Free.
      if (planCode === 'free' && !activeStatus) {
        navigate('/generate')
        return
      }
      goToCheckout(planCode)
    },
    [activeStatus, goToCheckout, navigate],
  )

  const runAction = useCallback(
    async (name, action, successPopup) => {
      setError('')
      setBusyAction(name)
      try {
        await action()
        await refreshSession()
        await load()
        setPopup(successPopup)
      } catch (actionError) {
        setError(getErrorMessage(actionError))
      } finally {
        setBusyAction('')
      }
    },
    [load, refreshSession],
  )

  const handleCancel = useCallback(
    () =>
      runAction('cancel', cancelSubscription, {
        kind: 'notice',
        title: 'Subscription cancelled',
        body: 'Your paid subscription ended and your account is now on the Free allowance.',
      }),
    [runAction],
  )

  const handleUndoPendingChange = useCallback(
    () =>
      runAction('undo-pending', cancelPendingPlanChange, {
        kind: 'notice',
        title: 'Scheduled change cancelled',
        body: 'You are staying on your current plan. Nothing will change at the end of this period.',
      }),
    [runAction],
  )

  /**
   * Returning to Free ends the paid plan when the period already paid for runs
   * out — there is no Price to switch to, so it never goes through checkout.
   */
  const handleReturnToFree = useCallback(
    () =>
      runAction(
        'return-free',
        () => changePlan({ planCode: 'free', interval: 'month' }),
        {
          kind: 'notice',
          title: 'Return to Free scheduled',
          body: 'Your current plan and its credits stay available until the end of the period you have paid for.',
        },
      ),
    [runAction],
  )

  const switchPlan = useCallback(
    (planCode) => (planCode === 'free' ? handleReturnToFree() : goToCheckout(planCode)),
    [goToCheckout, handleReturnToFree],
  )

  useEffect(() => {
    const requestedPlan = requestedPlanRef.current
    if (loading || continuedCheckoutRef.current || !requestedPlan) return
    if (!plans.some((plan) => plan.code === requestedPlan)) return

    continuedCheckoutRef.current = true
    navigate('/billing', { replace: true })
    choosePlan(requestedPlan)
    // The request is captured once from the login redirect and must run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, plans])

  return {
    busyAction,
    choosePlan,
    creditUsage,
    currentPlanCode,
    error: error || plansError,
    handleCancel,
    handleUndoPendingChange,
    interval,
    isActiveStatus: activeStatus,
    loading: loading || plansLoading,
    pendingChange,
    popup,
    setInterval,
    setPopup,
    sortedPlans: plans,
    subscribedInterval,
    subscription,
    switchPlan,
  }
}
