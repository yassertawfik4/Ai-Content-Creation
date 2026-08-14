import { CalendarClock, Loader2, Undo2 } from 'lucide-react'
import { formatBillingDate } from '@/features/billing/format'

/**
 * A downgrade the customer has confirmed but which has not started yet. Making
 * this visible — with a way out — is what keeps "scheduled at period end" from
 * feeling like the change silently failed.
 */
export function PendingChangeBanner({ change, currentPlanName, onUndo, busy }) {
  if (!change) return null

  const on = formatBillingDate(change.effectiveAt)

  return (
    <section
      className="flex flex-col gap-4 rounded-3xl border border-[#dfd3e7] bg-[#f8f2f9] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      aria-labelledby="pending-change-title"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2eafa] text-[#4f378a]">
          <CalendarClock className="size-5" />
        </span>
        <div>
          <p id="pending-change-title" className="text-sm font-bold text-[#201a25]">
            {currentPlanName ? `${currentPlanName} until ${on ?? 'the end of this period'}, then ${change.planName}` : `Switching to ${change.planName}`}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#746b79]">
            Nothing has been charged. You keep your current plan and every credit
            that comes with it until then.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUndo}
        disabled={busy}
        className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8cfdc] bg-white px-4 text-sm font-semibold text-[#4f378a] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
        Keep my current plan
      </button>
    </section>
  )
}
