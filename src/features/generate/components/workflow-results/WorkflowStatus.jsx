import { AlertTriangle, Check, CircleAlert, RefreshCw, ShieldCheck } from 'lucide-react'
import { STRATEGY_STEPS, WORKFLOW_STEPS } from '../../model/generateConfig'
import { LoadingRing } from '../AppHeader'

export function QANotes({ notes }) {
  const safeNotes = Array.isArray(notes) ? notes : []
  const openNotes = safeNotes.filter((note) => !note.resolved)
  const icons = { info: CircleAlert, warning: AlertTriangle, error: AlertTriangle }
  const colors = {
    info: 'text-[#4f378a] bg-[#f2eafa]',
    warning: 'text-[#b25c00] bg-[#fcefd9]',
    error: 'text-[#ad3150] bg-[#fbe2e8]',
  }
  return (
    <aside id="campaign-qa" className="self-start overflow-hidden rounded-[24px] border border-[#d8cedc] bg-[#fffaff] shadow-[0_14px_35px_rgba(46,32,51,0.06)]">
      <div className="border-b border-[#e6dee8] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#e6fbc7] text-[#315016]">
            <ShieldCheck className="size-[18px]" />
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${openNotes.length > 0 ? 'bg-[#fcefd9] text-[#8a4700]' : 'bg-[#e6fbc7] text-[#315016]'}`}>
            {openNotes.length > 0 ? `${openNotes.length} open` : 'All clear'}
          </span>
        </div>
        <div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#716777]">Quality check</p>
          <h3 className="font-display text-[22px] leading-tight tracking-[-0.35px] text-[#201a25]">Before you publish</h3>
          <p className="mt-2 text-xs leading-5 text-[#716777]">Review these final checks before scheduling the campaign.</p>
        </div>
      </div>
      {safeNotes.length > 0 ? (
      <ul className="space-y-2 p-4">
        {safeNotes.map((note, index) => {
          const Icon = icons[note.severity] ?? CircleAlert
          return (
            <li key={index} className="rounded-2xl border border-[#ebe3ed] bg-[#f8f3f8] p-3.5">
              <div className="flex items-start gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${colors[note.severity] ?? colors.info}`}>
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-[#514a56]">
                  {String(note.message)}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#84798a]">
                  {note.postId ? `${note.postId} · ` : ''}{note.severity} · {note.resolved ? 'Resolved' : 'Needs review'}
                </p>
              </div>
              </div>
            </li>
          )
        })}
      </ul>
      ) : (
        <div className="p-4">
          <div className="rounded-2xl bg-[#f3f9e9] p-4 text-sm leading-6 text-[#405625]">No quality issues were found. Your campaign is ready for a final human review.</div>
        </div>
      )}
    </aside>
  )
}

export function WorkflowProgress({ runState, generateImages, workflowKind = 'content' }) {
  const completed = new Set(runState?.completedSteps ?? [])
  const active = new Set(runState?.activeSteps ?? [])
  const visibleSteps = workflowKind === 'strategy'
    ? STRATEGY_STEPS
    : WORKFLOW_STEPS.filter((step) => step.optional !== 'images' || generateImages)
  const eventIdsFor = (step) => step.eventIds ?? [step.id]
  const isStepActive = (step) => eventIdsFor(step).some((id) => active.has(id))
  const isStepComplete = (step) => eventIdsFor(step).every((id) => completed.has(id))
  const activeLabels = visibleSteps
    .filter(isStepActive)
    .map((step) => step.label)
  const completedCount = visibleSteps.filter(isStepComplete).length
  // Steps can finish out of display order (QA often completes while visuals are
  // still rendering), so the connecting line follows the leading run of finished
  // steps. Keying it to each node instead leaves purple islands between grey gaps.
  const reachedIndex = visibleSteps.reduce(
    (furthest, step, index) => furthest === index - 1 && isStepComplete(step) ? index : furthest,
    -1,
  )
  const progressPercent = visibleSteps.length ? Math.round((completedCount / visibleSteps.length) * 100) : 0

  return (
    <section className="campaign-pulse overflow-hidden rounded-[22px] border border-[#d9cfe0] bg-[#fffaff] shadow-[0_10px_28px_rgba(46,32,51,0.06)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#381e72] text-[#d8ff9d] shadow-[0_6px_16px_rgba(56,30,114,0.22)]">
              <LoadingRing />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#201a25]">{workflowKind === 'strategy' ? 'Building your strategy' : 'Creating your campaign'}</p>
              <p className="mt-1 text-xs leading-5 text-[#746b79]">
                {activeLabels.length > 0 ? `Working now: ${activeLabels.join(', ')}` : 'Preparing the workflow…'}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-sm font-bold text-[#381e72]">{progressPercent}%</p>
            <p className="mt-0.5 text-[11px] text-[#817687]">{completedCount} of {visibleSteps.length} complete</p>
          </div>
        </div>

      </div>

      {/* The steps run in sequence, so they read as one left-to-right track
          rather than a wrapping grid where step 4 sits above step 5. */}
      <ol className="flex items-start overflow-x-auto border-t border-[#efe9f0] px-5 pb-5 pt-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleSteps.map((step, index) => {
          const isComplete = isStepComplete(step)
          const isActive = isStepActive(step)
          const status = isComplete ? 'Complete' : isActive ? 'Working now' : 'Waiting'
          const isLast = index === visibleSteps.length - 1
          const isTrackFilled = index <= reachedIndex
          return (
            <li
              key={step.id}
              tabIndex={0}
              aria-label={`${step.label}: ${status}. ${step.description}`}
              title={step.description}
              className="group flex min-w-[86px] flex-1 flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            >
              <div className="flex w-full items-center" aria-hidden="true">
                <span className={`h-0.5 flex-1 rounded-full transition-colors ${index === 0 ? 'bg-transparent' : isTrackFilled ? 'bg-[#4f378a]' : 'bg-[#eae4ec]'}`} />
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors ${
                    isComplete
                      ? 'bg-[#dcefc0] text-[#315016]'
                      : isActive
                        ? 'bg-[#381e72] text-[#d8ff9d] ring-4 ring-[#4f378a]/15'
                        : 'border border-[#e4dde7] bg-white text-[#a79fac]'
                  }`}
                >
                  {isComplete ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : isActive ? (
                    <LoadingRing className="size-3.5" />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span className={`h-0.5 flex-1 rounded-full transition-colors ${isLast ? 'bg-transparent' : isTrackFilled ? 'bg-[#4f378a]' : 'bg-[#eae4ec]'}`} />
              </div>
              <span className={`mt-2.5 px-1 text-center text-[11px] leading-4 transition-colors ${
                isActive
                  ? 'font-semibold text-[#381e72]'
                  : isComplete
                    ? 'font-medium text-[#4a4453]'
                    : 'font-medium text-[#a79fac]'
              }`}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function ErrorBanner({ message, onDismiss, onRetry, title = 'Workflow failed' }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-sm text-[#8a2440]">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 break-words text-[#a1385a]">{String(message)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg bg-[#8a2440] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#741d35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2440] focus-visible:ring-offset-2"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 py-1.5 text-xs font-semibold text-[#8a2440] hover:bg-[#f4d2da]"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

const tokenNumber = new Intl.NumberFormat()

function formatWorkflowCost(value) {
  const cost = Number(value)
  if (!Number.isFinite(cost)) return 'Cost unavailable'
  return `$${cost.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })}`
}

export function WorkflowBilling({ billing, executions = [], compact = false }) {
  if (!billing) return null
  const statusText = {
    pending: 'Calculating cost…',
    unpriced: 'Cost unavailable for this model',
    unavailable: 'Usage unavailable',
  }[billing.status]
  return (
    <section className={`${compact ? 'mt-3 rounded-xl px-3 py-2.5' : 'mb-5 rounded-2xl px-4 py-3.5'} border border-[#ddd2e3] bg-[#faf6fb]`} aria-label="Workflow token usage and cost">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#62556b]">
        <span><strong className="text-[#302537]">{tokenNumber.format(billing.inputTokens ?? 0)}</strong> input</span>
        <span><strong className="text-[#302537]">{tokenNumber.format(billing.outputTokens ?? 0)}</strong> output</span>
        <span><strong className="text-[#302537]">{tokenNumber.format(billing.totalTokens ?? 0)}</strong> total tokens</span>
        <span className="ml-auto font-bold text-[#4f378a]">{billing.status === 'ready' ? formatWorkflowCost(billing.estimatedCostUsd) : statusText}</span>
      </div>
      {executions.length > 1 ? (
        <div className="mt-2 space-y-1 border-t border-[#e5dce8] pt-2">
          {executions.map((execution, index) => (
            <div key={execution.id} className="flex items-center justify-between gap-3 text-[11px] text-[#776b7d]">
              <span>{execution.kind === 'strategy_section_revision' ? `Section revision ${index}` : 'Initial strategy'}</span>
              <span>{tokenNumber.format(execution.billing?.totalTokens ?? 0)} tokens · {execution.billing?.status === 'ready' ? formatWorkflowCost(execution.billing.estimatedCostUsd) : (statusText ?? 'Cost unavailable')}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

