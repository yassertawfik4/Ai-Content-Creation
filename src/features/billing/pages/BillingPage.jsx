import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useBillingPage } from '../hooks/useBillingPage'
import { BillingPopup } from '@/features/billing/components/BillingPopup'
import { CancelSubscriptionDialog } from '@/features/billing/components/CancelSubscriptionDialog'
import { IntervalToggle } from '@/features/billing/components/IntervalToggle'
import { PendingChangeBanner } from '@/features/billing/components/PendingChangeBanner'
import { PlanStatusBadge } from '@/features/billing/components/PlanStatusBadge'
import { formatMoney } from '@/features/billing/format'
import { bestYearlySavingPercent, getPlanPrice } from '@/features/billing/plans'

export function BillingPage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const {
    busyAction,
    choosePlan,
    creditUsage,
    currentPlanCode,
    error,
    handleCancel,
    handleUndoPendingChange,
    interval,
    isActiveStatus,
    loading,
    pendingChange,
    popup,
    setInterval,
    setPopup,
    sortedPlans,
    subscribedInterval,
    subscription,
    switchPlan,
  } = useBillingPage()

  const currentSortOrder = sortedPlans.find((plan) => plan.code === currentPlanCode)?.sortOrder
  const savingPercent = bestYearlySavingPercent(sortedPlans)

  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4f378a]">
              <CreditCard className="size-3.5" /> Billing
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.9px] text-[#201a25] sm:text-[44px]">
              Your subscription
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6a6170]">
              Manage your plan, switch intervals, or update how you pay. Changes to
              price are prorated automatically.
            </p>
          </div>

          {subscription ? (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <PlanStatusBadge status={subscription.status} />
              {isActiveStatus ? (
                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={busyAction === 'cancel'}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-[#eccfd5] bg-white px-3.5 text-sm font-semibold text-[#9f2949] transition-colors hover:bg-[#fbe9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] disabled:cursor-wait disabled:opacity-60"
                >
                  {busyAction === 'cancel' ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                  Cancel subscription
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <PendingChangeBanner
          change={pendingChange}
          currentPlanName={subscription?.plan?.name}
          onUndo={handleUndoPendingChange}
          busy={busyAction === 'undo-pending'}
        />

        {creditUsage ? (
          <section className="grid gap-5 rounded-3xl border border-[#ded3e4] bg-[#fffaff] p-5 shadow-[0_12px_32px_rgba(46,32,51,0.06)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6" aria-labelledby="credit-balance-title">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4f378a]">
                <Coins className="size-4" /> <span id="credit-balance-title">Generation credits</span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.4px] text-[#201a25]">
                {creditUsage.remaining.toLocaleString()} of {creditUsage.limit.toLocaleString()} left
              </p>
              <p className="mt-1 text-xs leading-5 text-[#746b79]">
                One credit starts one strategy, content workflow, or regeneration. Resets {new Date(creditUsage.periodEnd).toLocaleDateString()}.
              </p>
              <div className="billing-credit-track mt-4 h-2 max-w-xl overflow-hidden rounded-full" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-[width] ${creditUsage.blockedReason ? 'bg-[#ad3150]' : 'billing-credit-fill'}`}
                  style={{ width: `${creditUsage.limit ? Math.max(2, (creditUsage.remaining / creditUsage.limit) * 100) : 0}%` }}
                />
              </div>
              {creditUsage.blockedReason === 'payment_required' ? (
                <p role="alert" className="mt-3 text-sm font-semibold text-[#9f2949]">Update your subscription payment before generating again.</p>
              ) : creditUsage.remaining === 0 ? (
                <p role="status" className="mt-3 text-sm font-semibold text-[#9f2949]">No credits remain. Choose a larger plan to keep generating.</p>
              ) : null}
            </div>
            <div className="billing-allowance-card rounded-2xl px-5 py-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#746286]">Current allowance</p>
              <p className="mt-1 font-display text-2xl text-[#381e72]">{creditUsage.plan.name}</p>
            </div>
          </section>
        ) : null}

        <IntervalToggle interval={interval} onChange={setInterval} savingPercent={savingPercent} />

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-sm text-[#8a2440]">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6a6170]">
            <Loader2 className="size-4 animate-spin" /> Loading your plans…
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cfc2d5] bg-[#fffaff] px-6 py-20 text-center">
            <Sparkles className="mx-auto size-7 text-[#4f378a]" />
            <p className="mt-3 text-sm font-semibold text-[#381e72]">No plans available</p>
            <p className="mt-1 text-xs text-[#807586]">The plan catalog is empty right now. Please try again later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {sortedPlans.map((plan, index) => {
              const detail = plan
              const isSamePlanSubscription = subscription && currentPlanCode === plan.code
              const isCurrent = (isSamePlanSubscription && isActiveStatus) ||
                (!isActiveStatus && creditUsage?.plan?.code === plan.code)
              const priceInterval = isCurrent ? subscribedInterval : interval
              const priceCents = getPlanPrice(plan, priceInterval)
              const hasPrice = priceCents != null
              const isSamePlan = currentPlanCode === plan.code
              const highlight = plan.highlight
              const isPendingTarget = pendingChange?.planCode === plan.code
              // A lower tier is scheduled for the period end rather than applied
              // now, so the button must not imply an immediate switch.
              const isDowngrade =
                currentSortOrder != null && (plan.sortOrder ?? 0) < currentSortOrder
              const isSchedulingDowngrade = busyAction === `schedule-${plan.code}`

              return (
                <motion.article
                  key={plan.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                  className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                    highlight
                      ? 'border-2 border-[#4f378a] bg-white shadow-[0_24px_60px_rgba(56,30,114,0.18)]'
                      : 'border border-[#e2d9e6] bg-[#fffaff] shadow-[0_14px_38px_rgba(46,32,51,0.07)]'
                  }`}
                >
                  {highlight ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#381e72] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                      Most popular
                    </span>
                  ) : null}

                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold text-[#201a25]">{plan.name}</h3>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d8195]">{detail.eyebrow}</span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-[#6a6170]">{plan.description}</p>

                  <div className="mt-6 flex items-end gap-1.5">
                    {hasPrice ? (
                      <>
                        <span className="font-display text-4xl font-bold tracking-[-1px] text-[#201a25]">
                          {formatMoney(priceCents)}
                        </span>
                        <span className="mb-1 text-sm text-[#8a8190]">{priceCents === 0 ? 'forever' : ` / ${priceInterval}`}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[#8a8190]">Contact us</span>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#e4d9e8] bg-[#f8f2f9] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#2b2030]">
                      <Coins className="size-4 text-[#4f378a]" />
                      {Number(plan.generationCredits ?? 0).toLocaleString()} credits / month
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[#776e7d]">Shared across strategy, post creation, and regenerations.</p>
                  </div>

                  <div className="mt-6 flex min-h-12">
                    {isPendingTarget ? (
                      <span className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dfd3e7] bg-[#f2eafa] px-3 text-center text-sm font-semibold text-[#4f378a]">
                        <Check className="size-4 shrink-0" /> Starts at the end of this period
                      </span>
                    ) : isCurrent ? (
                      <span className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#cfe2b2] bg-[#eff9df] text-sm font-semibold text-[#315016]">
                        <Check className="size-4" /> Current plan{plan.code === 'free' ? ' · Included' : ` · ${subscribedInterval === 'year' ? 'Yearly' : 'Monthly'}`}
                      </span>
                    ) : isSamePlan && subscription?.status === 'CANCELLED' ? (
                      <button
                        type="button"
                        onClick={() => choosePlan(plan.code)}
                        disabled={busyAction === 'cancel'}
                        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#381e72] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Sparkles className="size-4 text-[#b7f36b]" />
                        Resume subscription
                      </button>
                    ) : isActiveStatus ? (
                      <button
                        type="button"
                        onClick={() => switchPlan(plan.code, isDowngrade)}
                        disabled={Boolean(busyAction)}
                        className={`group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#381e72] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isDowngrade
                            ? 'border border-[#d8cfdc] bg-white text-[#4f378a] hover:bg-[#f3edf5]'
                            : 'bg-[#381e72] text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] hover:bg-[#4f378a]'
                        }`}
                      >
                        {isDowngrade ? (
                          <>
                            {isSchedulingDowngrade ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <ArrowDownRight className="size-4" />
                            )}
                            {isSchedulingDowngrade ? 'Scheduling…' : 'Switch at period end'}
                          </>
                        ) : (
                          <>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => choosePlan(plan.code)}
                        disabled={busyAction === 'cancel'}
                        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#381e72] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Sparkles className="size-4 text-[#b7f36b]" />
                        {plan.code === 'free' ? 'Start generating' : 'Choose plan'}
                      </button>
                    )}
                  </div>

                  <ul className="mt-7 space-y-3 text-[#514a56]">
                    {detail.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6fbc7] text-[#315016]">
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
        )}

        <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-[#e2d9e6] bg-[#fffaff] px-4 py-4 text-sm text-[#625b71]">
          <ShieldCheck className="size-4 shrink-0 text-[#4f378a]" />
          Payments are processed securely by Stripe. We never see or store your card details.
        </div>
      </div>

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancel}
        busy={busyAction === 'cancel'}
        error={error}
      />

      <AnimatePresence>
        {popup ? (
          <BillingPopup
            kind={popup.kind}
            title={popup.title}
            body={popup.body}
            onClose={() => setPopup(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
