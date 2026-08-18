import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, ListChecks, Map as MapIcon, Megaphone, MessageCircleMore, MessageSquare, PackageSearch, Pencil, RefreshCw, ShieldCheck, Sparkles, Target, Users, Wand2 } from 'lucide-react'
import { listStrategyReviews } from '@/lib/campaignApi'
import { REGENERATABLE_STRATEGY_TABS } from '../../model/generateConfig'
import { LoadingRing } from '../AppHeader'
import { StrategyTabContent } from './StrategyTabContent'

const TAB_SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }

const STRATEGY_AGENT_TABS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Start here', description: 'Strategy at a glance', icon: Sparkles },
  { id: 'product', label: 'Product analysis', shortLabel: 'Product', description: 'Offer and value', icon: PackageSearch },
  { id: 'stp', label: 'STP strategy', shortLabel: 'Positioning', description: 'Audience and market fit', icon: Target },
  { id: 'personas', label: 'Buyer personas', shortLabel: 'Personas', description: 'People and motivations', icon: Users },
  { id: 'journey', label: 'Buyer journey', shortLabel: 'Journey', description: 'Needs by funnel stage', icon: MapIcon },
  { id: 'objectives', label: 'SMART objectives', shortLabel: 'Objectives', description: 'Targets and measures', icon: ListChecks },
  { id: 'campaign', label: 'Campaign planner', shortLabel: 'Campaign', description: 'Creative direction', icon: Megaphone },
  { id: 'quality', label: 'Quality gate', shortLabel: 'Quality', description: 'Evidence and risks', icon: ShieldCheck },
]

export function StrategyReview({ strategy, strategyId, review, onConfirm, onRequestChanges, onRegenerateSection, onEdit, onStrategyChange, isSubmitting, creditUsage, contentRunCost }) {
  // One credit per post, so the button has to name the real number rather than
  // the flat "1 credit" it used to promise.
  const costLabel = contentRunCost
    ? `${contentRunCost} ${contentRunCost === 1 ? 'credit' : 'credits'}`
    : 'credits'
  const overBudget = Boolean(
    contentRunCost && creditUsage && contentRunCost > creditUsage.remaining,
  )
  const [activeTab, setActiveTab] = useState('overview')
  const [tabDirection, setTabDirection] = useState(1)
  const [reviewNote, setReviewNote] = useState(review?.reviewNote ?? '')
  const [reviewHistory, setReviewHistory] = useState([])

  useEffect(() => {
    if (!strategyId) return undefined
    const controller = new AbortController()
    void listStrategyReviews(strategyId, { signal: controller.signal })
      .then(setReviewHistory)
      .catch(() => undefined)
    return () => controller.abort()
  }, [strategyId, review?.updatedAt])
  if (!strategy) return null

  const regeneratableSection = REGENERATABLE_STRATEGY_TABS[activeTab]
  const activeTabConfig = STRATEGY_AGENT_TABS.find((tab) => tab.id === activeTab) ?? STRATEGY_AGENT_TABS[0]
  const activeTabIndex = STRATEGY_AGENT_TABS.findIndex((tab) => tab.id === activeTab)

  const updatePath = (path, value) => {
    onStrategyChange((current) => {
      if (!current) return current
      const next = { ...current }
      let cursor = next
      path.slice(0, -1).forEach((key) => {
        const source = cursor[key]
        const copy = Array.isArray(source) ? [...source] : { ...(source ?? {}) }
        cursor[key] = copy
        cursor = copy
      })
      cursor[path[path.length - 1]] = value
      return next
    })
  }

  // The rail only mounts three tabs at a time, so arrow keys walk the full tab
  // list by index rather than by the buttons currently in the DOM. The travel
  // direction drives which side entering and leaving tabs animate from.
  const selectTab = (id, direction) => {
    if (id === activeTab) return
    setTabDirection(direction)
    setActiveTab(id)
  }

  const goToTabIndex = (index, { focus = false } = {}) => {
    const total = STRATEGY_AGENT_TABS.length
    const nextTab = STRATEGY_AGENT_TABS[((index % total) + total) % total]
    selectTab(nextTab.id, index > activeTabIndex ? 1 : -1)
    if (focus) {
      requestAnimationFrame(() => {
        document.getElementById(`strategy-tab-${nextTab.id}`)?.focus()
      })
    }
  }

  const handleTabKeyDown = (event) => {
    let nextIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = activeTabIndex + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = activeTabIndex - 1
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = STRATEGY_AGENT_TABS.length - 1
    else return

    event.preventDefault()
    goToTabIndex(nextIndex, { focus: true })
  }



  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="strategy-review strategy-review-shell overflow-hidden rounded-[24px] border border-border shadow-[0_18px_45px_rgba(46,32,51,0.09)] lg:overflow-visible">
      <div className="strategy-tab-rail flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Strategy workspace</p>
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{activeTabIndex + 1}/{STRATEGY_AGENT_TABS.length}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Review the plan in order, then approve.</p>
          <div className="mt-2 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-muted" aria-hidden="true"><span className="strategy-nav-progress block h-full rounded-full" style={{ width: `${((activeTabIndex + 1) / STRATEGY_AGENT_TABS.length) * 100}%` }} /></div>
        </div>

        <div className="strategy-tab-slider flex min-w-0 items-center justify-between gap-1 rounded-full p-1 sm:justify-end sm:gap-1.5">
          <button
            type="button"
            onClick={() => goToTabIndex(activeTabIndex - 1)}
            aria-label={`Previous section: ${STRATEGY_AGENT_TABS[(activeTabIndex - 1 + STRATEGY_AGENT_TABS.length) % STRATEGY_AGENT_TABS.length].label}`}
            className="strategy-tab-arrow flex size-8 shrink-0 items-center justify-center rounded-full transition"
          >
            <ChevronRight className="size-4 rotate-180" aria-hidden="true" />
          </button>

          <div className="relative flex min-w-0 items-center gap-1 sm:gap-1.5" role="tablist" aria-label="Strategy sections">
            <AnimatePresence initial={false} mode="popLayout">
              {[-1, 0, 1].map((offset) => {
                const index = (activeTabIndex + offset + STRATEGY_AGENT_TABS.length) % STRATEGY_AGENT_TABS.length
                const { id, label, shortLabel, description, icon: Icon } = STRATEGY_AGENT_TABS[index]
                const selected = offset === 0
                return (
                  <motion.button
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: tabDirection * 28 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: tabDirection * -28 }}
                    transition={TAB_SPRING}
                    id={`strategy-tab-${id}`}
                    data-tab-id={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`strategy-panel-${id}`}
                    aria-label={label}
                    title={label}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectTab(id, offset || 1)}
                    onKeyDown={handleTabKeyDown}
                    className={`strategy-tab relative flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-left sm:px-3 sm:py-2 ${selected ? 'is-active' : 'strategy-tab-peek'}`}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="strategy-tab-active-fill"
                        className="strategy-tab-fill absolute inset-0 rounded-full"
                        transition={TAB_SPRING}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="strategy-tab-icon relative flex size-7 shrink-0 items-center justify-center rounded-full sm:size-8">
                      <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
                    </span>
                    <span className={`relative min-w-0 ${selected ? '' : 'hidden sm:block'}`}>
                      <span className="block truncate text-xs font-semibold sm:text-[13px]">{shortLabel}</span>
                      <AnimatePresence initial={false}>
                        {selected ? (
                          <motion.span
                            key="description"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 0.8, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="mt-0.5 block truncate text-[10px]"
                          >
                            {description}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => goToTabIndex(activeTabIndex + 1)}
            aria-label={`Next section: ${STRATEGY_AGENT_TABS[(activeTabIndex + 1) % STRATEGY_AGENT_TABS.length].label}`}
            className="strategy-tab-arrow flex size-8 shrink-0 items-center justify-center rounded-full transition"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-w-0 p-3 sm:p-5 lg:p-6">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab}
            id={`strategy-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`strategy-tab-${activeTab}`}
            aria-label={activeTabConfig.label}
            initial={{ opacity: 0, x: tabDirection * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tabDirection * -18 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <StrategyTabContent activeTab={activeTab} strategy={strategy} updatePath={updatePath} />
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="strategy-review-footer border-t border-border px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="strategy-ready-icon flex size-10 shrink-0 items-center justify-center rounded-xl"><Check className="size-[18px]" aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to create the campaign?</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Approve this draft now, or add feedback for another pass.
                {contentRunCost ? ` Writing the posts costs ${costLabel}${creditUsage ? `, and you have ${creditUsage.remaining} left` : ''}.` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onEdit} disabled={isSubmitting} className="strategy-secondary-action flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:opacity-50"><Pencil className="size-4" aria-hidden="true" />Edit brief</button>
            <button type="button" onClick={() => onConfirm(reviewNote)} disabled={isSubmitting || creditUsage?.canGenerate === false || overBudget} className="strategy-primary-action flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? <LoadingRing className="size-4" /> : <Wand2 className="size-4" aria-hidden="true" />}
              {isSubmitting ? 'Starting workflow…' : creditUsage?.canGenerate === false ? 'Credits required' : `Approve & create posts · ${costLabel}`}
            </button>
          </div>
        </div>

        <details className="strategy-feedback group mt-3 rounded-2xl border">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3.5 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
            <MessageCircleMore className="size-4" aria-hidden="true" />
            Add feedback or request changes
            {reviewNote.trim() ? <span className="strategy-soft-badge ml-1 rounded-full px-2 py-0.5 text-[10px]">Note added</span> : null}
            <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label className="text-xs font-semibold text-foreground">Review note <span className="font-normal text-muted-foreground">(required for changes)</span><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={4000} rows={3} placeholder="Describe what should change and why…" className="strategy-field-control mt-2 block w-full resize-y px-3.5 py-3 text-sm outline-none" /></label>
              {review?.approvalStatus ? <p className="mt-2 text-xs text-muted-foreground">Last decision: <span className="font-semibold text-foreground">{String(review.approvalStatus).toLowerCase().replaceAll('_', ' ')}</span>{review.reviewerName ? ` by ${review.reviewerName}` : ''}</p> : null}
              {reviewHistory.length > 0 ? <details className="mt-2 text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold text-foreground">View review history ({reviewHistory.length})</summary><div className="mt-2 space-y-1.5">{reviewHistory.slice(0, 3).map((entry) => <p key={entry.id}>{String(entry.action).toLowerCase().replaceAll('_', ' ')} · {entry.reviewerName} · {new Date(entry.createdAt).toLocaleString()}{entry.note ? ` — ${entry.note}` : ''}</p>)}</div></details> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              {regeneratableSection ? (
                <button
                  type="button"
                  onClick={() => onRegenerateSection(regeneratableSection.section, reviewNote)}
                  disabled={isSubmitting || reviewNote.trim().length < 3}
                  className="strategy-secondary-action flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />Regenerate {regeneratableSection.label}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onRequestChanges(reviewNote)}
                disabled={isSubmitting || reviewNote.trim().length < 3}
                className="strategy-secondary-action flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageSquare className="size-4" aria-hidden="true" />Request changes
              </button>
            </div>
          </div>
        </details>
      </footer>
    </motion.section>
  )
}
