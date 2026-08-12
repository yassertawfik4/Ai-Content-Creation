import { useState } from 'react'
import { BarChart3, CalendarDays, Check, ChevronDown, CircleAlert, DollarSign, HelpCircle, Image as ImageIcon, Layers3, Lightbulb, ListChecks, MessageSquare, MousePointerClick, PackageSearch, Pencil, RefreshCw, ShieldCheck, Sparkles, Tag, Target, Users, Volume2 } from 'lucide-react'

const STRATEGY_FIELD_ICON_RULES = [
  { pattern: /pricing|price|budget|cost/i, icon: <DollarSign className="size-3.5" /> },
  { pattern: /product type|industry|type$/i, icon: <Tag className="size-3.5" /> },
  { pattern: /product name|working product/i, icon: <PackageSearch className="size-3.5" /> },
  { pattern: /value proposition|unique selling/i, icon: <Sparkles className="size-3.5" /> },
  { pattern: /core features|creative do|key differentiators|differentiators/i, icon: <ListChecks className="size-3.5" /> },
  { pattern: /customer problems|frustrations|objections/i, icon: <CircleAlert className="size-3.5" /> },
  { pattern: /positioning|objective|goals?|target value/i, icon: <Target className="size-3.5" /> },
  { pattern: /brand promise/i, icon: <ShieldCheck className="size-3.5" /> },
  { pattern: /tone of voice/i, icon: <Volume2 className="size-3.5" /> },
  { pattern: /segment|persona name/i, icon: <Users className="size-3.5" /> },
  { pattern: /summary|storytelling|key messages|review prompts/i, icon: <MessageSquare className="size-3.5" /> },
  { pattern: /buying triggers|purchase triggers|primary cta|cta$/i, icon: <MousePointerClick className="size-3.5" /> },
  { pattern: /questions/i, icon: <HelpCircle className="size-3.5" /> },
  { pattern: /follow-up/i, icon: <RefreshCw className="size-3.5" /> },
  { pattern: /education|reasoning/i, icon: <Lightbulb className="size-3.5" /> },
  { pattern: /referral/i, icon: <Users className="size-3.5" /> },
  { pattern: /deadline/i, icon: <CalendarDays className="size-3.5" /> },
  { pattern: /kpi|measurement/i, icon: <BarChart3 className="size-3.5" /> },
  { pattern: /visual style/i, icon: <ImageIcon className="size-3.5" /> },
  { pattern: /hierarchy/i, icon: <Layers3 className="size-3.5" /> },
]

const DEFAULT_STRATEGY_FIELD_ICON = <Pencil className="size-3.5" />

function iconForStrategyField(label) {
  return STRATEGY_FIELD_ICON_RULES.find(({ pattern }) => pattern.test(label))?.icon ?? DEFAULT_STRATEGY_FIELD_ICON
}

export function EditableText({ label, value, onChange, multiline = false, rows = 3, helper }) {
  const fieldIcon = iconForStrategyField(label)

  return (
    <label className="strategy-field block">
      <span className="strategy-field-label mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
        <span className="strategy-field-label-icon flex size-6 shrink-0 items-center justify-center rounded-lg" aria-hidden="true">{fieldIcon}</span>
        <span>{label}</span>
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="strategy-field-control w-full resize-y px-3.5 py-3 text-sm leading-6 outline-none"
        />
      ) : (
        <input
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="strategy-field-control h-11 w-full px-3.5 text-sm outline-none"
        />
      )}
      {helper ? <span className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-4 text-muted-foreground"><ListChecks className="size-3" aria-hidden="true" />{helper}</span> : null}
    </label>
  )
}

export function EditableList({ label, values, onChange, helper = 'One item per line', rows }) {
  return (
    <EditableText
      label={label}
      value={Array.isArray(values) ? values.join('\n') : ''}
      onChange={(value) => onChange(value.split('\n').map((item) => item.trim()).filter(Boolean))}
      multiline
      rows={rows ?? Math.min(6, Math.max(3, (values?.length ?? 0) + 1))}
      helper={helper}
    />
  )
}

export function AgentTabPanel({ eyebrow, title, description, icon: Icon = Sparkles, bodyClassName = '', children }) {
  return (
    <section className="strategy-agent-panel overflow-hidden rounded-[22px] border">
      <div className="strategy-agent-header border-b px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-4">
          <span className="strategy-agent-icon flex size-11 shrink-0 items-center justify-center rounded-2xl" aria-hidden="true">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="strategy-agent-eyebrow text-[10px] font-bold uppercase tracking-[0.17em]">{eyebrow}</p>
            <h3 className="strategy-agent-title mt-1.5 font-display text-[27px] leading-tight tracking-[-0.55px] sm:text-[30px]">{title}</h3>
            <p className="strategy-agent-description mt-2 max-w-2xl text-sm leading-6">{description}</p>
          </div>
        </div>
      </div>
      <div className={`strategy-agent-body space-y-6 p-5 sm:p-7 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export function StrategyFieldGroup({ title, description, icon: Icon, children }) {
  return (
    <section className="strategy-field-group rounded-2xl border p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="strategy-subsection-icon flex size-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

export function ExpandableEditor({ eyebrow, title, meta, icon: Icon = Pencil, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <details className="strategy-expandable group overflow-hidden rounded-2xl border" open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="strategy-subsection-icon flex size-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true"><Icon className="size-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">{title}</span>
        </span>
        {meta ? <span className="strategy-soft-badge hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex">{meta}</span> : null}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border p-4 sm:p-5">{children}</div>
    </details>
  )
}

export function ReadOnlyList({ label, values, icon: HeaderIcon = ListChecks, itemIcon: ItemIcon = Check, tone = 'default' }) {
  if (!Array.isArray(values) || values.length === 0) return null
  return (
    <div className={`strategy-audit-list is-${tone}`}>
      <p className="flex items-center gap-2 text-xs font-semibold text-foreground"><span className="strategy-field-label-icon flex size-7 shrink-0 items-center justify-center rounded-lg" aria-hidden="true"><HeaderIcon className="size-3.5" /></span>{label}<span className="ml-auto text-[11px] font-medium tabular-nums text-muted-foreground">{values.length}</span></p>
      <ul className="mt-3 space-y-2">
        {values.map((value, index) => (
          <li key={`${value}-${index}`} className="strategy-audit-list-item flex gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-5 text-muted-foreground"><ItemIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span>{value}</span></li>
        ))}
      </ul>
    </div>
  )
}

export function QualityMetricCard({ icon: Icon, value, label, description, tone = 'accent', progress }) {
  return (
    <article className={`strategy-quality-metric is-${tone} rounded-2xl border p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <span className="strategy-quality-metric-icon flex size-10 shrink-0 items-center justify-center rounded-xl" aria-hidden="true"><Icon className="size-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-none tracking-[-0.35px] text-foreground sm:text-2xl">{value}</p>
          <p className="mt-1.5 text-xs font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{description}</p>
        </div>
      </div>
      {typeof progress === 'number' ? <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${label}: ${progress} percent`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span className="strategy-quality-progress block h-full rounded-full" style={{ width: `${progress}%` }} /></div> : null}
    </article>
  )
}
