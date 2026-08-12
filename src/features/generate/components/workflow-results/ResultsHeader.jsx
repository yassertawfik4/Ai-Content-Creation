import { CalendarDays, Camera, Check, ChevronRight, Layers3, Pencil, ShieldCheck } from 'lucide-react'
import { PLATFORM_ICONS } from '../../model/generateConfig'

export function ResultsHeader({ hasResults, hasStrategyReview, openQaNotes, onEditStrategy, projectName, selectedPlatforms, totalPosts, values }) {
  return (
    <>
      {hasResults ? (
          <header className="campaign-ready-header mb-6 overflow-hidden rounded-[28px] text-white">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
              <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-[#d8ff9d]/20 bg-[#d8ff9d]/10" />
              <div className="pointer-events-none absolute -bottom-32 right-1/3 size-56 rounded-full border border-white/10" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                    <span>{projectName}</span>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                    <span className="font-semibold text-[#d8ff9d]">
                      Campaign ready
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#d8ff9d] text-[#2b174f]">
                      <Check
                        className="size-4"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8ff9d]">
                      Generation complete
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-[38px] leading-[0.98] tracking-[-0.9px] sm:text-[48px]">
                    Your campaign is ready to shape.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                    Review the strategy, clear any QA notes, then edit or copy
                    each post when you are ready to publish.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={onEditStrategy}
                    className="flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8ff9d]"
                  >
                    <Pencil className="size-4" aria-hidden="true" /> Edit brief
                  </button>
                </div>
              </div>
            </div>
            <dl className="grid border-t border-white/10 bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-r lg:border-b-0 lg:px-6">
                <Layers3 className="size-5 text-[#d8ff9d]" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">
                    Posts
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {totalPosts} ready
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6">
                <Camera className="size-5 text-[#d8ff9d]" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">
                    Channels
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {selectedPlatforms.length} selected
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r lg:px-6">
                <CalendarDays
                  className="size-5 text-[#d8ff9d]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">
                    Duration
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {values.duration}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 lg:px-6">
                <ShieldCheck
                  className="size-5 text-[#d8ff9d]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">
                    QA status
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {openQaNotes > 0 ? `${openQaNotes} to review` : "All clear"}
                  </dd>
                </div>
              </div>
            </dl>
          </header>
        ) : (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#776e7d]">
                <span>{projectName}</span>
                <span aria-hidden="true">/</span>
                <span className="font-medium text-[#4f378a]">
                  {hasStrategyReview
                    ? "Strategy review"
                    : hasResults
                      ? "Campaign generation"
                      : "Strategy workspace"}
                </span>
              </div>
              <h2 className="font-display text-[34px] leading-none tracking-[-0.75px] text-[#201a25] sm:text-[40px]">
                {hasResults
                  ? "Your campaign, ready to shape."
                  : hasStrategyReview
                    ? "Review the thinking before the making."
                    : "Build a campaign with intention."}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716777]">
                {hasResults
                  ? "Edit captions in place, copy what works, and keep every iteration in this project."
                  : hasStrategyReview
                    ? "The plan below is the handoff between your brief and the content team. Approve it when the direction feels right."
                    : "Fill the brief and let the strategy team create a considered plan before any content is generated."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div
                className="flex -space-x-1.5"
                aria-label={`Selected platforms: ${selectedPlatforms.map((platform) => platform.label).join(", ")}`}
              >
                {selectedPlatforms.map(({ id, label }) => {
                  const Icon = PLATFORM_ICONS[id];
                  return (
                    <span
                      key={id}
                      title={label}
                      className="flex size-8 items-center justify-center rounded-full border-2 border-[#f8f3f8] bg-white text-[#4f378a] shadow-sm"
                    >
                      {Icon ? <Icon className="size-3.5" /> : null}
                    </span>
                  );
                })}
              </div>
              <span className="rounded-full border border-[#d9d0dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5462]">
                {hasStrategyReview ? "Plan ready" : `${totalPosts} posts`}
              </span>
            </div>
          </div>
        )}
    </>
  )
}
