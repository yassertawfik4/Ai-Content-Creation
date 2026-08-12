import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Check, ChevronDown, ChevronRight, PackageSearch, Sparkles, Target, Users } from 'lucide-react'
import { firstNonBlankString } from '../../model/generateConfig'
import { formatQualityStatus } from '../../model/workflowPresentation'

// A bare number reads as arbitrary; the ring says the score is out of 100.
function ScoreRing({ score, size = 60, stroke = 5 }) {
  const parsed = Number(score)
  const value = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="strategy-score-track" />
        {value === null ? null : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            className="strategy-score-arc"
          />
        )}
      </svg>
      <span className="strategy-agent-title absolute inset-0 flex items-center justify-center text-[17px] font-bold tabular-nums">
        {value === null ? '--' : value}
      </span>
      <span className="sr-only">{value === null ? 'Plan quality score unavailable' : `Plan quality score ${value} out of 100`}</span>
    </div>
  )
}

export function StrategyOverview({ strategy }) {
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  if (!strategy) return null

  const product = strategy.product ?? {}
  const stp = strategy.stp ?? {}
  const campaign = strategy.campaignStrategy ?? {}
  const quality = strategy.planQuality ?? {}
  const segments = Array.isArray(stp.segments) ? stp.segments : []
  const segmentNames = new Map(segments.map((segment) => [segment.id, segment.label]))
  const targetedSegments = Array.isArray(stp.targetedSegments) ? stp.targetedSegments : []
  const personas = Array.isArray(strategy.personas) ? strategy.personas : []
  const objectives = Array.isArray(strategy.smartObjectives) ? strategy.smartObjectives : []
  const channels = Array.isArray(campaign.primaryChannels) ? campaign.primaryChannels : []
  const recommendations = Array.isArray(campaign.campaignRecommendations) ? campaign.campaignRecommendations : []

  const openIssues = Array.isArray(quality.issues) ? quality.issues.length : 0
  const summary = typeof campaign.summary === 'string' ? campaign.summary.trim() : ''
  // The generated summary is one long unbroken block. Clamp it to a readable
  // opening rather than pushing the rest of the plan below the fold.
  const summaryIsLong = summary.length > 320
  const heroStats = [
    { label: 'Personas', value: personas.length, icon: Users },
    { label: 'Objectives', value: objectives.length, icon: Target },
    { label: 'Channels', value: channels.length, icon: BarChart3 },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="strategy-agent-panel overflow-hidden rounded-[22px] border shadow-[0_12px_32px_rgba(46,32,51,0.06)]"
    >
      <div className="strategy-overview-hero relative overflow-hidden border-b px-5 py-6 sm:px-7 sm:py-7">
        <div className="strategy-hero-orb absolute -right-10 -top-20 size-64 rounded-full border blur-[1px]" />
        <div className="strategy-hero-ring absolute -bottom-28 right-24 size-52 rounded-full border" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <div className="min-w-0">
            <div className="strategy-agent-eyebrow mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-bold uppercase tracking-[0.17em]">
              <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
              Strategy ready for review
              {product.type ? <span className="strategy-hero-chip rounded-full px-2 py-0.5 text-[10px] tracking-[0.1em]">{product.type}</span> : null}
            </div>
            <h3 className="strategy-agent-title font-display text-[30px] leading-[1.06] tracking-[-0.7px] sm:text-[38px]">
              {firstNonBlankString(product.name, 'Your campaign strategy')}
            </h3>
            {summary ? (
              <p
                id="strategy-hero-summary"
                className={`strategy-agent-description mt-3 max-w-[62ch] whitespace-pre-line text-sm leading-6 ${summaryIsLong && !summaryExpanded ? 'line-clamp-4' : ''}`}
              >
                {summary}
              </p>
            ) : null}
            {summaryIsLong ? (
              <button
                type="button"
                onClick={() => setSummaryExpanded((current) => !current)}
                aria-expanded={summaryExpanded}
                aria-controls="strategy-hero-summary"
                className="strategy-hero-toggle mt-2 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold transition"
              >
                {summaryExpanded ? 'Show less' : 'Read the full summary'}
                <ChevronDown className={`size-3.5 transition-transform ${summaryExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <div className="strategy-quality-score rounded-2xl border p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3.5">
                <ScoreRing score={quality.score} />
                <div className="min-w-0">
                  <p className="strategy-agent-description text-[10px] font-bold uppercase tracking-[0.14em]">Plan quality</p>
                  <p className="strategy-agent-title mt-0.5 truncate text-[15px] font-semibold">{formatQualityStatus(quality.status)}</p>
                </div>
              </div>
              <p className="strategy-agent-description strategy-hero-divider mt-3 pt-3 text-xs leading-5">
                {openIssues > 0
                  ? `${openIssues} finding${openIssues === 1 ? '' : 's'} to resolve before approving.`
                  : 'No open findings. This plan is ready for your approval.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {heroStats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="strategy-hero-stat rounded-xl px-2 py-2.5 text-center">
                  <Icon className="mx-auto size-3.5 opacity-70" aria-hidden="true" />
                  <p className="strategy-agent-title mt-1.5 text-lg font-semibold leading-none tabular-nums">{value}</p>
                  <p className="strategy-agent-description mt-1 text-[10px] font-semibold uppercase tracking-[0.1em]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="strategy-overview-card rounded-2xl border p-5">
            <div className="flex items-center gap-2 text-primary"><Target className="size-4" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[0.16em]">Positioning statement</p></div>
            <p className="mt-3 font-display text-[22px] leading-[1.3] tracking-[-0.3px] text-foreground">{stp.positioning?.positioningStatement}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{stp.positioning?.brandPromise}</p>
          </div>
          <div className="strategy-overview-card rounded-2xl border p-5">
            <div className="flex items-center gap-2 text-primary"><PackageSearch className="size-4" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[0.16em]">Product angle</p></div>
            <p className="mt-2 text-lg font-semibold text-foreground">{product.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{product.type} · {product.industry}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.valueProposition}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="strategy-overview-card rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Priority audiences</p><p className="mt-1 text-xs text-muted-foreground">Ordered by strategic fit</p></div>
              <span className="strategy-subsection-icon flex size-9 items-center justify-center rounded-xl"><Users className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-4 divide-y divide-border">
              {targetedSegments.map((segment, index) => (
                <div key={segment.segmentId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold tabular-nums text-primary">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-foreground">{segmentNames.get(segment.segmentId) ?? segment.segmentId}</p><span className="strategy-soft-badge rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]">{segment.priority}</span></div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{segment.justification}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="strategy-overview-card rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Channel mix</p><p className="mt-1 text-xs text-muted-foreground">Recommended effort split</p></div>
              <span className="strategy-subsection-icon flex size-9 items-center justify-center rounded-xl"><BarChart3 className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {channels.map((channel) => (
                <div key={channel.channel}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize text-foreground">{channel.channel}</p>
                    <span className="text-xs font-bold tabular-nums text-primary">{channel.estimatedShare}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, Number(channel.estimatedShare) || 0))}%` }} /></div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{channel.primaryFunnelStage} · {channel.expectedKpis?.[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Campaign concepts</p>
              <p className="mt-1 text-sm text-muted-foreground">The workflow recommends these first moves.</p>
            </div>
            <span className="strategy-soft-badge rounded-full px-2.5 py-1 text-[11px] font-semibold">{recommendations.length} concepts</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="strategy-mini-card rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{recommendation.name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{recommendation.type} · {recommendation.duration}</p>
                  </div>
                  <span className="strategy-soft-badge rounded-full px-2 py-1 text-[10px] font-semibold capitalize">{recommendation.estimatedImpact} impact</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{recommendation.objective}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recommendation.channels?.map((channel) => <span key={channel} className="rounded-full border border-border bg-card px-2 py-1 text-[10px] font-medium capitalize text-muted-foreground">{channel}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="strategy-mini-card flex items-center gap-3 rounded-2xl border p-4">
            <span className="strategy-subsection-icon flex size-9 items-center justify-center rounded-xl"><Users className="size-4" /></span><div><p className="text-2xl font-semibold text-foreground">{personas.length}</p><p className="mt-0.5 text-xs text-muted-foreground">buyer personas</p></div>
          </div>
          <div className="strategy-mini-card flex items-center gap-3 rounded-2xl border p-4">
            <span className="strategy-subsection-icon flex size-9 items-center justify-center rounded-xl"><Target className="size-4" /></span><div><p className="text-2xl font-semibold text-foreground">{objectives.length}</p><p className="mt-0.5 text-xs text-muted-foreground">SMART objectives</p></div>
          </div>
          <div className="strategy-mini-card flex items-center gap-3 rounded-2xl border p-4">
            <span className="strategy-subsection-icon flex size-9 items-center justify-center rounded-xl"><BarChart3 className="size-4" /></span><div><p className="text-2xl font-semibold text-foreground">{campaign.kpis?.length ?? 0}</p><p className="mt-0.5 text-xs text-muted-foreground">primary KPIs</p></div>
          </div>
        </div>

        <details className="strategy-expandable group rounded-2xl border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            Explore assumptions, objectives, and guardrails
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-5 border-t border-border px-4 py-4 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Key messages</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                {(campaign.creativeDirection?.keyMessages ?? []).map((message) => <li key={message} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{message}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Next decisions</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                {(quality.nextDecisions ?? []).map((decision) => <li key={decision} className="flex gap-2"><ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />{decision}</li>)}
              </ul>
            </div>
          </div>
        </details>
      </div>

    </motion.section>
  )
}
