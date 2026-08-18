import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronRight, Lightbulb, ShieldCheck, Sparkles, Wand2 } from 'lucide-react'
import { PLATFORM_OPTIONS } from '../../schema/campaignSchema'
import { PostCard } from './CampaignPosts'
import { StrategySummary } from './StrategySummary'
import { StrategyReview } from './StrategyReview'
import { ResultsHeader } from './ResultsHeader'
import { ErrorBanner, QANotes, WorkflowProgress } from './WorkflowStatus'

export function ResultsPanel({
  campaign,
  setCampaign,
  strategy,
  values,
  phase,
  runState,
  projectName,
  error,
  onDismissError,
  onRetryError,
  onConfirmStrategy,
  onRequestStrategyChanges,
  onRegenerateStrategySection,
  strategyReview,
  onEditStrategy,
  onStrategyChange,
  onStartCampaign,
  canStartCampaign,
  creditUsage,
  contentRunCost,
}) {
  const selectedPlatformIds = values?.platforms ?? []
  const selectedPlatforms = PLATFORM_OPTIONS.filter((platform) => selectedPlatformIds.includes(platform.id))

  const updateCaption = (index, value) => {
    setCampaign((current) => {
      if (!current) return current
      const calendar = current.calendar.map((entry, idx) => (idx === index ? { ...entry, caption: value } : entry))
      return { ...current, calendar }
    })
  }

  const hasResults = Boolean(campaign)
  const isGenerating = phase === 'strategy' || phase === 'content'
  const workflowKind = phase === 'strategy' ? 'strategy' : 'content'
  const hasStrategyReview = Boolean(strategy) && !campaign && phase === 'review'
  const totalPosts = campaign?.calendar?.length ?? 0
  const openQaNotes = campaign?.notes?.filter((note) => !note.resolved).length ?? 0

  return (
    <main
      className="scrollbar-hidden min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f8f3f8]"
      id="generated-results"
    >
      <div
        className="mx-auto max-w-[1480px] px-4 py-6 transition-[max-width] duration-300 sm:px-7 lg:px-8 lg:py-8 xl:px-10"
      >
        <ResultsHeader
          hasResults={hasResults}
          hasStrategyReview={hasStrategyReview}
          openQaNotes={openQaNotes}
          onEditStrategy={onEditStrategy}
          projectName={projectName}
          selectedPlatforms={selectedPlatforms}
          totalPosts={totalPosts}
          values={values}
        />

        {error ? (
          <ErrorBanner
            message={error}
            onDismiss={onDismissError}
            onRetry={onRetryError}
            title={
              phase === "strategy" || (!campaign && !strategy)
                ? "Strategy generation failed"
                : "Content generation failed"
            }
          />
        ) : null}

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              aria-live="polite"
              aria-label="Generating campaign posts"
            >
              <WorkflowProgress
                runState={runState}
                generateImages={values.generateImages}
                workflowKind={workflowKind}
              />
              <div className="rounded-[20px] border border-[#dfd6e1] bg-[#fffaff] p-6">
                <div className="h-3 w-32 rounded bg-[#e7dfe9]" />
                <div className="mt-4 h-3 w-3/4 rounded bg-[#eee7ef]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-[#eee7ef]" />
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <div className="h-12 rounded-xl bg-[#f3edf5]" />
                  <div className="h-12 rounded-xl bg-[#f3edf5]" />
                </div>
              </div>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse overflow-hidden rounded-[20px] border border-[#dfd6e1] bg-[#fffaff] p-6"
                >
                  <div className="h-3 w-24 rounded bg-[#e7dfe9]" />
                  <div className="mt-12 h-7 w-3/5 rounded bg-[#e7dfe9]" />
                  <div className="mt-5 h-3 w-full rounded bg-[#eee7ef]" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-[#eee7ef]" />
                </div>
              ))}
            </motion.div>
          ) : hasStrategyReview ? (
            <StrategyReview
              strategy={strategy}
              strategyId={strategyReview?.id ?? null}
              review={strategyReview}
              onConfirm={onConfirmStrategy}
              onRequestChanges={onRequestStrategyChanges}
              onRegenerateSection={onRegenerateStrategySection}
              onEdit={onEditStrategy}
              onStrategyChange={onStrategyChange}
              isSubmitting={false}
              creditUsage={creditUsage}
              contentRunCost={contentRunCost}
            />
          ) : hasResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              aria-live="polite"
            >
              <nav
                aria-label="Campaign sections"
                className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ded4e2] bg-[#fffaff] p-2 shadow-[0_6px_18px_rgba(46,32,51,0.04)]"
              >
                <a
                  href="#campaign-strategy"
                  className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#f2eafa] px-3.5 text-sm font-semibold text-[#381e72] transition-colors hover:bg-[#e9def3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                >
                  <Lightbulb className="size-4" aria-hidden="true" /> Strategy
                </a>
                <a
                  href="#campaign-qa"
                  className="flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-[#625b71] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" /> QA
                  review
                </a>
                <a
                  href="#campaign-posts"
                  className="flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-[#625b71] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                >
                  <CalendarDays className="size-4" aria-hidden="true" /> Content
                  calendar
                </a>
              </nav>

              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.75fr)]">
                <StrategySummary strategy={campaign?.strategy} />
                <QANotes notes={campaign?.notes ?? []} />
              </div>

              <section
                id="campaign-posts"
                aria-labelledby="campaign-posts-heading"
                className="scroll-mt-6"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#716777]">
                      Content calendar
                    </p>
                    <h3
                      id="campaign-posts-heading"
                      className="mt-1 font-display text-[30px] leading-tight tracking-[-0.55px] text-[#201a25]"
                    >
                      Review every post
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#716777]">
                      Captions are editable. Changes save to this campaign
                      automatically when you leave the field.
                    </p>
                  </div>
                  <span className="inline-flex h-9 shrink-0 items-center self-start rounded-full border border-[#d8cedc] bg-[#fffaff] px-3 text-xs font-semibold text-[#5d5462] sm:self-auto">
                    {totalPosts} posts · {selectedPlatforms.length} channels
                  </span>
                </div>
                <div className="space-y-4">
                  {(campaign?.calendar ?? []).map((entry, index) => (
                    <PostCard
                      key={`${entry.platform}-${entry.date ?? 'unscheduled'}-${index}`}
                      post={entry}
                      index={index}
                      showImage={values.generateImages}
                      brandName={values.brandName}
                      onCaptionChange={updateCaption}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#c8bcd0] bg-[#fffaff]/70 px-6 py-20 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f3edf5] text-[#4f378a]">
                <Sparkles className="size-6" />
              </span>
              <button
                type="button"
                onClick={onStartCampaign}
                disabled={!canStartCampaign}
                className="group mt-5 inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#381e72] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(56,30,114,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4f378a] hover:shadow-[0_15px_32px_rgba(56,30,114,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Wand2 className="size-[17px] text-[#d8ff9d]" />
                Make your content
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#746b79]">
                {canStartCampaign
                  ? "Open the guided brief, complete each step, and review your strategy before content is created."
                  : "Create or select a campaign chat to begin."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
