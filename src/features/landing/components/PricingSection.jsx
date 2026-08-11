import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { listPlans, createCheckout, getErrorMessage } from '@/lib/billingApi'

const PLAN_DETAILS = {
  free: {
    eyebrow: 'Starter',
    features: ['3 campaigns / month', 'Live captions & hashtags', 'Community support'],
    highlight: false,
  },
  pro: {
    eyebrow: 'Popular',
    features: [
      'Unlimited campaigns',
      'AI image generation',
      'Advanced analytics',
      'Priority support',
    ],
    highlight: true,
  },
  business: {
    eyebrow: 'Team',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'API access',
      'Dedicated success manager',
    ],
    highlight: false,
  },
}

function formatCents(cents) {
  if (cents == null) return null
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })
}

export function PricingSection() {
  const [plans, setPlans] = useState([])
  const [interval, setInterval] = useState('month')
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    listPlans()
      .then((data) => {
        if (active) setPlans(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setError('Could not load plans right now. Please try again later.')
      })
    return () => {
      active = false
    }
  }, [])

  const startCheckout = async (planCode) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/billing' } })
      return
    }
    setError('')
    setCheckingOut(planCode)
    try {
      const { url } = await createCheckout({ planCode, interval })
      window.location.assign(url)
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError))
      setCheckingOut('')
    }
  }

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [plans],
  )

  return (
    <section id="pricing" className="bg-[#fef7ff] px-6 py-24 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-[1120px]"
      >
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d4ef] bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f378a] shadow-sm">
            <Sparkles className="size-3.5" /> Pricing
          </span>
          <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.9px] text-[#201a25] sm:text-5xl">
            Simple, honest plans.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#6a6170]">
            Start free and scale when you need more power. No contracts, cancel anytime.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {['month', 'year'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              aria-pressed={interval === value}
              className={`flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                interval === value
                  ? 'bg-[#381e72] text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)]'
                  : 'border border-[#d8cfdc] bg-white text-[#625b71] hover:border-[#a99eb4] hover:text-[#201a25]'
              }`}
            >
              {value === 'month' ? 'Monthly' : 'Yearly'}
              {value === 'year' ? <span className={interval === 'year' ? 'text-[#b7f36b]' : 'text-[#6a9f27]'}>−20%</span> : null}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-center text-sm text-[#8a2440]">
            {error}
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {sortedPlans.map((plan, index) => {
            const detail = PLAN_DETAILS[plan.code] ?? {
              eyebrow: 'Plan',
              features: [],
              highlight: false,
            }
            const priceCents =
              interval === 'year' ? plan.priceYearlyCents : plan.priceMonthlyCents
            const hasPrice = priceCents != null
            const priceLabel = formatCents(priceCents)
            const isFree = priceCents === 0
            const busy = checkingOut === plan.code

            return (
              <motion.article
                key={plan.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                  detail.highlight
                    ? 'bg-[#381e72] text-white shadow-[0_24px_60px_rgba(56,30,114,0.3)]'
                    : 'border border-[#e2d9e6] bg-[#fffaff] shadow-[0_14px_38px_rgba(46,32,51,0.07)]'
                }`}
              >
                {detail.highlight ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#b7f36b] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d3b05] shadow-md">
                    Most popular
                  </span>
                ) : null}

                <div className="flex items-baseline justify-between">
                  <h3 className={`text-lg font-semibold ${detail.highlight ? 'text-white' : 'text-[#201a25]'}`}>
                    {plan.name}
                  </h3>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${detail.highlight ? 'text-[#b7f36b]' : 'text-[#8d8195]'}`}>
                    {detail.eyebrow}
                  </span>
                </div>
                <p className={`mt-2 min-h-10 text-sm leading-5 ${detail.highlight ? 'text-white/75' : 'text-[#6a6170]'}`}>
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end gap-1.5">
                  {hasPrice ? (
                    <>
                      <span className={`font-display text-4xl font-bold tracking-[-1px] ${detail.highlight ? 'text-white' : 'text-[#201a25]'}`}>
                        {isFree ? '$0' : priceLabel}
                      </span>
                      <span className={`mb-1 text-sm ${detail.highlight ? 'text-white/60' : 'text-[#8a8190]'}`}>
                        {isFree ? 'forever' : ` / ${interval}`}
                      </span>
                    </>
                  ) : (
                    <span className={`text-sm ${detail.highlight ? 'text-white/60' : 'text-[#8a8190]'}`}>
                      Contact us
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => startCheckout(plan.code)}
                  disabled={busy || Boolean(checkingOut)}
                  className={`group mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    detail.highlight
                      ? 'bg-white text-[#381e72] shadow-[0_10px_26px_rgba(0,0,0,0.22)] hover:bg-[#f3edf5] focus-visible:ring-white'
                      : 'bg-[#381e72] text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] hover:bg-[#4f378a] focus-visible:ring-[#381e72]'
                  }`}
                >
                  {busy ? <Loader2 className={`size-4 animate-spin ${detail.highlight ? 'text-[#4f378a]' : 'text-[#b7f36b]'}`} /> : null}
                  {isFree ? 'Start free' : `Choose ${plan.name}`}
                  {!busy ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
                </button>

                <ul className={`mt-7 space-y-3 ${detail.highlight ? 'text-white/90' : 'text-[#514a56]'}`}>
                  {detail.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${detail.highlight ? 'bg-[#b7f36b]/20 text-[#d9ffa8]' : 'bg-[#e6fbc7] text-[#315016]'}`}>
                        <Check className="size-3" strokeWidth={2.6} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>

        <p className="mt-10 text-center text-sm text-[#8a8190]">
          Need a custom plan?{' '}
          <Link to="/register" className="font-semibold text-[#4f378a] hover:underline">
            Talk to our team
          </Link>
        </p>
      </motion.div>
    </section>
  )
}