import { motion } from 'framer-motion'
import { BarChart3, Users, Building, Sparkles, Folder, Watch, Shield, Coins } from 'lucide-react'

import { useState, useEffect } from 'react'
import { getDashboardOverview } from '@/features/admin/adminApi'
import { Navbar } from '@/features/landing/components/Navbar'

function formatNumber(num) {
  if (num == null) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatCurrency(cents) {
  if (cents == null) return '$0'
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

export function DashboardPage() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getDashboardOverview()
        setOverview(data)
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load dashboard overview')
        setOverview(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fef7ff] flex items-center justify-center">
        <BarChart3 className="size-8 animate-spin text-[#4f378a]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fef7ff]">
        <div className="mx-auto max-w-2xl px-5 py-10 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] text-center text-sm text-[#8a2440]">
          <BarChart3 className="mx-auto mb-3 size-6 text-[#b91c1c)" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!overview) {
    return <div>No data available</div>
  }

  const users = overview.users ?? {}
  const projects = overview.projects ?? {}
  const campaigns = overview.campaigns ?? {}
  const workflows = overview.workflows ?? {}
  const content = overview.content ?? {}
  const knowledge = overview.knowledge ?? {}
  const billing = overview.billing ?? {}
  const strategies = overview.strategies ?? {}

  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <nav className="w-full lg:w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Shield className="size-6 text-[#4f378a]" />
              <h2 className="font-display text-xl font-bold tracking-[-0.9px] text-[#201a25]">Admin Dashboard</h2>
            </div>

            <ul className="flex-1 space-y-2">
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <BarChart3 className="size-5" />
                  <span>Overview</span>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <Users className="size-5" />
                  <span>Users ({formatNumber(users.total)})</span>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <Building className="size-5" />
                  <span>Projects ({formatNumber(projects.total)})</span>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <Sparkles className="size-5" />
                  <span>Campaigns ({formatNumber(campaigns.total)})</span>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <Folder className="size-5" />
                  <span>Knowledge Sources ({formatNumber(knowledge.total)})</span>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#6b7280] transition-colors"
                >
                  <Watch className="size-5" />
                  <span>Strategies ({formatNumber(strategies.total)})</span>
                </motion.div>
              </li>
            </ul>
          </nav>

          {/* Main Content */}
          <div className="flex-1 bg-[#fef7ff] rounded-2xl p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl border p-5 ${
                  users.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Total Users</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(users.total)}</p>
                  </div>
                </div>
                {users.newThisPeriod > 0 && (
                  <p className="mt-2 text-sm ${
                    users.newThisPeriod > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {users.newThisPeriod} new {users.newThisPeriod > 1 ? 'users' : 'user'} this period
                  </p>
                )}
              </motion.div>

              {/* Projects Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`rounded-2xl border p-5 ${
                  projects.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Total Projects</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(projects.total)}</p>
                  </div>
                </div>
                {projects.active > 0 && (
                  <p className="mt-2 text-sm ${
                    projects.active > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {projects.active} active
                  </p>
                )}
              </motion.div>

              {/* Campaigns Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={`rounded-2xl border p-5 ${
                  campaigns.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Total Campaigns</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(campaigns.total)}</p>
                  </div>
                </div>
                {campaigns.published > 0 && (
                  <p className="mt-2 text-sm ${
                    campaigns.published > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {campaigns.published} published
                  </p>
                )}
              </motion.div>

              {/* Workflows Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className={`rounded-2xl border p-5 ${
                  workflows.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Watch className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Workflow Executions</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(workflows.total)}</p>
                  </div>
                </div>
                {workflows.running > 0 && (
                  <p className="mt-2 text-sm ${
                    workflows.running > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {workflows.running} running
                  </p>
                )}
              </motion.div>

              {/* Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className={`rounded-2xl border p-5 ${
                  content.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Generated Content</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(content.total)}</p>
                  </div>
                </div>
                {content.ready > 0 && (
                  <p className="mt-2 text-sm ${
                    content.ready > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {content.ready} ready
                  </p>
                )}
              </motion.div>

              {/* Knowledge Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className={`rounded-2xl border p-5 ${
                  knowledge.total > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Knowledge Sources</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatNumber(knowledge.total)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Revenue Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className={`rounded-2xl border p-5 ${
                  billing.totalRevenue > 0 ? 'bg-white shadow-sm' : 'bg-[#f2eafa] text-[#4f378a]'}
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="size-6 text-[#4f378a]" />
                  <div>
                    <p className="text-sm font-medium text-[#6a6170]">Total Revenue</p>
                    <p className="text-3xl font-bold text-[#201a25]">{formatCurrency(billing.totalRevenue)}</p>
                  </div>
                </div>
                {billing.newThisPeriod > 0 && (
                  <p className="mt-2 text-sm ${
                    billing.newThisPeriod > 0 ? 'text-[#16a34a]' : 'text-[#b91c1c]'
                  }">
                    {billing.newThisPeriod} new {billing.newThisPeriod > 1 ? 'subscriptions' : 'subscription'} this period
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}