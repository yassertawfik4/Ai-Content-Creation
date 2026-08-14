import { useEffect, useState } from 'react'
import { getPlans } from '@/lib/billingApi'
import { decoratePlans } from '@/features/billing/plans'

/**
 * The plan catalog as the backend prices it. Public endpoint, so this works on
 * the landing page before sign-in as well as inside the app.
 */
export function usePlanCatalog() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getPlans({ signal: controller.signal })
      .then((rows) => setPlans(decoratePlans(rows ?? [])))
      .catch((requestError) => {
        if (requestError?.name === 'AbortError') return
        setError('Could not load plans. Please refresh and try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { plans, loading, error }
}
