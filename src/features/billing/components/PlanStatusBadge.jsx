const STATUS_STYLES = {
  ACTIVE: 'bg-[#e6fbc7] text-[#315016]',
  TRIALING: 'bg-[#f2eafa] text-[#4f378a]',
  PAST_DUE: 'bg-[#fcefd9] text-[#9b5a12]',
  UNPAID: 'bg-[#fcefd9] text-[#9b5a12]',
  CANCELLED: 'bg-[#f3edf5] text-[#625b71]',
  INCOMPLETE: 'bg-[#f3edf5] text-[#625b71]',
  PAUSED: 'bg-[#f2eafa] text-[#4f378a]',
}

const STATUS_LABELS = {
  ACTIVE: 'Active',
  TRIALING: 'Trial',
  PAST_DUE: 'Past due',
  UNPAID: 'Unpaid',
  CANCELLED: 'Cancelled',
  INCOMPLETE: 'Incomplete',
  PAUSED: 'Paused',
}

export function PlanStatusBadge({ status }) {
  if (!status) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] ${
        STATUS_STYLES[status] ?? 'bg-[#f3edf5] text-[#625b71]'
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
