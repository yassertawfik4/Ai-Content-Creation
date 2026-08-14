import { motion } from 'framer-motion'
import { CheckCircle2, X, XCircle } from 'lucide-react'

const TONES = {
  success: {
    border: 'border-[#cfe2b2]',
    glow: 'bg-[#e6fbc7]/60',
    chip: 'bg-[#e6fbc7] text-[#2c4a0e]',
    Icon: CheckCircle2,
  },
  notice: {
    border: 'border-[#f0d9b7]',
    glow: 'bg-[#fcefd9]/60',
    chip: 'bg-[#fcefd9] text-[#9b5a12]',
    Icon: XCircle,
  },
}

/**
 * The toast shown after returning from Stripe or completing a billing action.
 * Previously duplicated as two near-identical components in both the billing
 * page and the landing pricing section.
 */
export function BillingPopup({ kind = 'notice', title, body, onClose }) {
  const tone = TONES[kind] ?? TONES.notice
  const { Icon } = tone

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="fixed inset-x-4 bottom-6 z-[80] mx-auto w-full max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div className={`relative overflow-hidden rounded-2xl border ${tone.border} bg-[#fffaff] p-4 shadow-[0_20px_60px_rgba(46,32,51,0.22)]`}>
        <span className={`absolute -right-6 -top-10 size-28 rounded-full ${tone.glow}`} aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
            <Icon className="size-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-[#201a25]">{title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#625b71]">{body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#776e7d] transition-colors hover:bg-[#f3edf5] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
