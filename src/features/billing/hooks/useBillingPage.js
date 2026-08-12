import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cancelSubscription, getErrorMessage, getCreditUsage, getSubscription } from '@/lib/billingApi'
import { PRICING_PLANS } from '@/features/billing/plans'
export function useBillingPage() {
  const plans = PRICING_PLANS
  const [subscription, setSubscription] = useState(null)
  const [creditUsage, setCreditUsage] = useState(null)
  const [interval, setInterval] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('interval')
    return requested === 'year' ? 'year' : 'month'
  })
  const [loading, setLoading] = useState(true)
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
  const requestedPlanRef = useRef(new URLSearchParams(window.location.search).get('plan'))
  const continuedCheckoutRef = useRef(false)

  useEffect(() => {
    if (popup) {
      navigate('/billing', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      const [subscriptionData, usageData] = await Promise.all([
        getSubscription(),
        getCreditUsage(),
      ])
      setError('')
      setSubscription(subscriptionData ?? null)
      setCreditUsage(usageData ?? null)
      if (subscriptionData?.billingInterval) {
        const normalized = String(subscriptionData.billingInterval).toUpperCase()
        setInterval(normalized === 'MONTHLY' ? 'month' : 'year')
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([getSubscription(), getCreditUsage()])
      .then(([subscriptionData, usageData]) => {
        if (!active) return
        setError('')
        setSubscription(subscriptionData ?? null)
        setCreditUsage(usageData ?? null)
        if (subscriptionData?.billingInterval) {
          const normalized = String(subscriptionData.billingInterval).toUpperCase()
          setInterval(normalized === 'MONTHLY' ? 'month' : 'year')
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
  const subscribedInterval =
    String(subscription?.billingInterval ?? '').toUpperCase() === 'MONTHLY'
      ? 'month'
      : 'year'

  const choosePlan = async (planCode) => {
    if (planCode === 'free') {
      navigate('/generate')
      return
    }
    navigate(`/checkout?plan=${encodeURIComponent(planCode)}&interval=${interval}`)
  }

  const switchPlan = async (planCode) => {
    if (planCode === 'free') {
      await handleCancel()
      return
    }
    navigate(`/checkout?plan=${encodeURIComponent(planCode)}&interval=${interval}`)
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
        body: 'Your paid subscription ended and your account is now on the Free allowance.',
      })
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
    } finally {
      setBusyAction('')
    }
  }

  useEffect(() => {
    const requestedPlan = requestedPlanRef.current
    if (loading || continuedCheckoutRef.current || !requestedPlan) return
    if (!plans.some((plan) => plan.code === requestedPlan)) return

    continuedCheckoutRef.current = true
    navigate('/billing', { replace: true })
    void choosePlan(requestedPlan)
    // The request is captured once from the login redirect and must run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, plans])

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [plans],
  )

  return {
    busyAction,
    choosePlan,
    creditUsage,
    currentPlanCode,
    error,
    handleCancel,
    interval,
    isActiveStatus,
    loading,
    popup,
    setInterval,
    setPopup,
    sortedPlans,
    subscribedInterval,
    subscription,
    switchPlan,
  }
}
