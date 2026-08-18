import { useCallback, useEffect, useState } from 'react'
import {
  getAdminUsers,
  getDashboardOverview,
  getRevenueByPlan,
  getRevenueByUser,
  getRevenueOverview,
} from '@/lib/adminApi'

function toDateInput(date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function initialRange() {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 30)
  return { from: toDateInput(from), to: toDateInput(to) }
}

function apiRange(range) {
  return {
    from: range.from ? `${range.from}T00:00:00.000` : undefined,
    to: range.to ? `${range.to}T23:59:59.999` : undefined,
  }
}

export function useAdminDashboard() {
  const [range, setRange] = useState(initialRange)
  const [draftRange, setDraftRange] = useState(initialRange)
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState({
    overview: null,
    revenue: null,
    revenueUsers: null,
    revenuePlans: null,
    users: null,
    loading: true,
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    const resolvedRange = apiRange(range)

    Promise.all([
      getDashboardOverview({ ...resolvedRange, signal: controller.signal }),
      getRevenueOverview({ signal: controller.signal }),
      getRevenueByUser({ signal: controller.signal }),
      getRevenueByPlan({ signal: controller.signal }),
      getAdminUsers({ signal: controller.signal }),
    ])
      .then(([overview, revenue, revenueUsers, revenuePlans, users]) => {
        setState({
          overview,
          revenue,
          revenueUsers,
          revenuePlans,
          users,
          loading: false,
          error: '',
        })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setState((current) => ({
          ...current,
          loading: false,
          error: error?.message || 'Unable to load the dashboard.',
        }))
      })

    return () => controller.abort()
  }, [range, refreshKey])

  const updateDraftRange = useCallback((field, value) => {
    setDraftRange((current) => ({ ...current, [field]: value }))
  }, [])

  const applyRange = useCallback(() => {
    if (!draftRange.from || !draftRange.to || draftRange.from > draftRange.to) return false
    setState((current) => ({ ...current, loading: true, error: '' }))
    setRange({ ...draftRange })
    return true
  }, [draftRange])

  const setPreset = useCallback((days) => {
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - days)
    const next = { from: toDateInput(from), to: toDateInput(to) }
    setState((current) => ({ ...current, loading: true, error: '' }))
    setDraftRange(next)
    setRange(next)
  }, [])

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    setRefreshKey((key) => key + 1)
  }, [])

  return {
    ...state,
    range,
    draftRange,
    updateDraftRange,
    applyRange,
    setPreset,
    refresh,
  }
}
