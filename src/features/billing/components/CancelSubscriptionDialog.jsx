import { Loader2, TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
  error,
}) {
  const handleConfirm = async () => {
    const cancelled = await onConfirm()
    if (cancelled) onOpenChange(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogContent>
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#fbe9ee] text-[#ad3150]">
          <TriangleAlert className="size-6" strokeWidth={2.2} />
        </div>

        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            This takes effect immediately. Your account will move to the Free
            plan and your paid-plan generation credits will no longer be
            available.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-[#eccfd5] bg-[#fbe9ee] px-3 py-2.5 text-sm text-[#8a2440]"
          >
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep subscription</AlertDialogCancel>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ad3150] px-4 text-sm font-semibold text-white transition hover:bg-[#8f2742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy ? 'Cancelling…' : 'Yes, cancel subscription'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
