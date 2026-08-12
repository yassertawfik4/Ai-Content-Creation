import { AlertTriangle, BriefcaseBusiness, ChevronRight, CircleAlert, ExternalLink, Globe2, Lightbulb, ListChecks, Map as MapIcon, Megaphone, PackageSearch, Search, ShieldCheck, Sparkles, Target, Users, Wand2 } from 'lucide-react'
import { getEvidenceDomain } from '../../model/generateConfig'
import { formatQualityStatus } from '../../model/workflowPresentation'
import { StrategyOverview } from './StrategyOverview'
import { AgentTabPanel, EditableList, EditableText, ExpandableEditor, QualityMetricCard, ReadOnlyList, StrategyFieldGroup } from './StrategyFields'

const JOURNEY_STAGES = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'consideration', label: 'Consideration' },
  { id: 'decision', label: 'Decision' },
  { id: 'retention', label: 'Retention' },
  { id: 'advocacy', label: 'Advocacy' },
]

export function StrategyTabContent({ activeTab, strategy, updatePath }) {
  const product = strategy.product ?? {}
  const stp = strategy.stp ?? {}
  const campaign = strategy.campaignStrategy ?? {}
  const quality = strategy.planQuality ?? {}
  const positioning = stp.positioning ?? {}
  const personas = Array.isArray(strategy.personas) ? strategy.personas : []
  const journeys = Array.isArray(strategy.buyerJourney) ? strategy.buyerJourney : []
  const objectives = Array.isArray(strategy.smartObjectives) ? strategy.smartObjectives : []
  const segments = Array.isArray(stp.segments) ? stp.segments : []
  const recommendations = Array.isArray(campaign.campaignRecommendations) ? campaign.campaignRecommendations : []
  const qualityScoreNumber = quality.score === null || quality.score === undefined ? Number.NaN : Number(quality.score)
  const qualityScore = Number.isFinite(qualityScoreNumber) ? Math.max(0, Math.min(100, qualityScoreNumber)) : null
  const qualityIssues = Array.isArray(quality.issues) ? quality.issues : []
  const qualityAssumptions = Array.isArray(quality.assumptionRegister) ? quality.assumptionRegister : []
  const qualityNextDecisions = Array.isArray(quality.nextDecisions) ? quality.nextDecisions : []
  const qualityEvidenceSources = Array.isArray(quality.evidenceSources) ? quality.evidenceSources : []
  const qualityIssueCount = qualityIssues.length
  const qualityStatusLabel = formatQualityStatus(quality.status)
    if (activeTab === 'overview') return <StrategyOverview strategy={strategy} />

    if (activeTab === 'product') {
      return (
        <AgentTabPanel eyebrow="Product analysis agent" title="The product, clearly understood." description="Edit the product truth, value proposition, and customer problems that downstream agents use as context." icon={PackageSearch}>
          <StrategyFieldGroup title="Product foundation" description="The essential facts every downstream agent should share." icon={PackageSearch}>
            <div className="grid gap-4 md:grid-cols-2">
              <EditableText label="Working product name" value={product.name} onChange={(value) => updatePath(['product', 'name'], value)} />
              <EditableText label="Product type" value={product.type} onChange={(value) => updatePath(['product', 'type'], value)} />
              <EditableText label="Value proposition" value={product.valueProposition} onChange={(value) => updatePath(['product', 'valueProposition'], value)} multiline />
              <EditableText label="Pricing notes" value={product.pricingNotes} onChange={(value) => updatePath(['product', 'pricingNotes'], value)} multiline />
            </div>
          </StrategyFieldGroup>
          <StrategyFieldGroup title="Customer value" description="Keep each list focused; use one clear idea per line." icon={Lightbulb}>
            <div className="grid gap-4 md:grid-cols-2">
              <EditableList label="Core features" values={product.coreFeatures} onChange={(value) => updatePath(['product', 'coreFeatures'], value)} />
              <EditableList label="Customer problems" values={product.customerProblems} onChange={(value) => updatePath(['product', 'customerProblems'], value)} />
              <EditableList label="Unique selling points" values={product.uniqueSellingPoints} onChange={(value) => updatePath(['product', 'uniqueSellingPoints'], value)} />
              <EditableList label="Differentiators" values={product.differentiators} onChange={(value) => updatePath(['product', 'differentiators'], value)} />
            </div>
          </StrategyFieldGroup>
          <ReadOnlyList label="Agent assumptions" values={product.assumptions} />
        </AgentTabPanel>
      )
    }

    if (activeTab === 'stp') {
      return (
        <AgentTabPanel eyebrow="STP strategy agent" title="Choose who to win, and why." description="Refine the positioning language and target segment rationale before it shapes personas and campaign concepts." icon={Target}>
          <StrategyFieldGroup title="Market position" description="Shape the promise and language customers should remember." icon={Target}>
            <div className="grid gap-4 md:grid-cols-2">
              <EditableText label="Positioning statement" value={positioning.positioningStatement} onChange={(value) => updatePath(['stp', 'positioning', 'positioningStatement'], value)} multiline rows={4} />
              <EditableText label="Brand promise" value={positioning.brandPromise} onChange={(value) => updatePath(['stp', 'positioning', 'brandPromise'], value)} multiline />
              <EditableText label="Tone of voice" value={positioning.toneOfVoice} onChange={(value) => updatePath(['stp', 'positioning', 'toneOfVoice'], value)} multiline />
              <EditableList label="Key differentiators" values={positioning.keyDifferentiators} onChange={(value) => updatePath(['stp', 'positioning', 'keyDifferentiators'], value)} />
            </div>
          </StrategyFieldGroup>
          <StrategyFieldGroup title="Candidate segments" description="Rename a segment without changing its connection to the strategy." icon={Users}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <p className="text-xs text-muted-foreground">Review each audience before moving to personas.</p>
              <span className="strategy-soft-badge rounded-full px-2.5 py-1 text-[11px] font-semibold">{segments.length} segments</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {segments.map((segment, index) => (
                <div key={segment.id ?? index} className="strategy-mini-card rounded-2xl border p-4">
                  <EditableText label="Segment label" value={segment.label} onChange={(value) => updatePath(['stp', 'segments', index, 'label'], value)} />
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{segment.notes || segment.psychographics?.join(', ') || 'No additional segment notes.'}</p>
                </div>
              ))}
            </div>
          </StrategyFieldGroup>
        </AgentTabPanel>
      )
    }

    if (activeTab === 'personas') {
      return (
        <AgentTabPanel eyebrow="Buyer persona agent" title="Meet the people behind the segment." description="Open one persona at a time to refine the language, goals, and motivations that guide every post and CTA." icon={Users}>
          {personas.map((persona, index) => (
            <ExpandableEditor key={persona.id ?? index} eyebrow={`Persona ${index + 1}`} title={persona.name || 'Untitled persona'} meta={[persona.role, persona.archetype].filter(Boolean).join(' · ')} icon={Users} defaultOpen={index === 0}>
              <section className="strategy-persona-overview grid gap-5 rounded-2xl border p-4 lg:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)] lg:p-5" aria-label={`${persona.name || `Persona ${index + 1}`} overview`}>
                <div className="min-w-0">
                  <EditableText label="Persona name" value={persona.name} onChange={(value) => updatePath(['personas', index, 'name'], value)} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {persona.role ? <span className="strategy-persona-chip inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"><BriefcaseBusiness className="size-3 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{persona.role}</span></span> : null}
                    {persona.archetype ? <span className="strategy-persona-chip inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"><Sparkles className="size-3 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{persona.archetype}</span></span> : null}
                  </div>
                </div>
                <div className="min-w-0 lg:border-l lg:border-border lg:pl-5">
                  <EditableText label="Persona summary" value={persona.summary} onChange={(value) => updatePath(['personas', index, 'summary'], value)} multiline rows={5} />
                </div>
              </section>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <section className="strategy-persona-cluster is-motivation rounded-2xl border p-4 sm:p-5" aria-labelledby={`persona-${index}-motivations`}>
                  <div className="mb-5 flex items-start gap-3">
                    <span className="strategy-persona-cluster-icon flex size-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true"><Target className="size-4" /></span>
                    <div>
                      <h4 id={`persona-${index}-motivations`} className="text-sm font-semibold text-foreground">Motivations</h4>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">What this person wants and what prompts action. One item per line.</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <EditableList label="Goals" values={persona.goals} onChange={(value) => updatePath(['personas', index, 'goals'], value)} helper={false} rows={4} />
                    <EditableList label="Buying triggers" values={persona.buyingTriggers} onChange={(value) => updatePath(['personas', index, 'buyingTriggers'], value)} helper={false} rows={4} />
                  </div>
                </section>

                <section className="strategy-persona-cluster is-barrier rounded-2xl border p-4 sm:p-5" aria-labelledby={`persona-${index}-barriers`}>
                  <div className="mb-5 flex items-start gap-3">
                    <span className="strategy-persona-cluster-icon flex size-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true"><CircleAlert className="size-4" /></span>
                    <div>
                      <h4 id={`persona-${index}-barriers`} className="text-sm font-semibold text-foreground">Barriers</h4>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">What creates friction or prevents a confident purchase. One item per line.</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <EditableList label="Frustrations" values={persona.frustrations} onChange={(value) => updatePath(['personas', index, 'frustrations'], value)} helper={false} rows={4} />
                    <EditableList label="Objections" values={persona.objections} onChange={(value) => updatePath(['personas', index, 'objections'], value)} helper={false} rows={4} />
                  </div>
                </section>
              </div>
            </ExpandableEditor>
          ))}
        </AgentTabPanel>
      )
    }

    if (activeTab === 'journey') {
      return (
        <AgentTabPanel eyebrow="Buyer journey agent" title="Make the journey feel intentional." description="Open a persona journey, then work through each stage without losing the larger path." icon={MapIcon}>
          {journeys.map((journey, journeyIndex) => (
            <ExpandableEditor key={journey.personaId ?? journeyIndex} eyebrow="Persona journey" title={journey.personaName || `Journey ${journeyIndex + 1}`} meta="5 stages" icon={MapIcon} defaultOpen={journeyIndex === 0}>
              <div className="grid gap-3 lg:grid-cols-2">
                {JOURNEY_STAGES.map((stage, stageIndex) => (
                  <div key={stage.id} className="strategy-mini-card rounded-xl border p-3.5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary"><span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] tabular-nums">{stageIndex + 1}</span>{stage.label}</p>
                    {journey[stage.id]?.questions ? <EditableList label="Questions" values={journey[stage.id].questions} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'questions'], value)} /> : null}
                    {journey[stage.id]?.objections ? <EditableList label="Objections" values={journey[stage.id].objections} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'objections'], value)} /> : null}
                    {journey[stage.id]?.purchaseTriggers ? <EditableList label="Purchase triggers" values={journey[stage.id].purchaseTriggers} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'purchaseTriggers'], value)} /> : null}
                    {journey[stage.id]?.followUp ? <EditableList label="Follow-up" values={journey[stage.id].followUp} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'followUp'], value)} /> : null}
                    {journey[stage.id]?.customerEducation ? <EditableList label="Customer education" values={journey[stage.id].customerEducation} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'customerEducation'], value)} /> : null}
                    {journey[stage.id]?.referralOpportunities ? <EditableList label="Referral opportunities" values={journey[stage.id].referralOpportunities} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'referralOpportunities'], value)} /> : null}
                    {journey[stage.id]?.reviews ? <EditableList label="Review prompts" values={journey[stage.id].reviews} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'reviews'], value)} /> : null}
                    {journey[stage.id]?.cta ? <EditableText label="CTA" value={journey[stage.id].cta} onChange={(value) => updatePath(['buyerJourney', journeyIndex, stage.id, 'cta'], value)} /> : null}
                  </div>
                ))}
              </div>
            </ExpandableEditor>
          ))}
        </AgentTabPanel>
      )
    }

    if (activeTab === 'objectives') {
      return (
        <AgentTabPanel eyebrow="SMART objectives agent" title="Make the ambition measurable." description="Review one objective at a time, with its target, deadline, KPI, and measurement method kept together." icon={ListChecks}>
          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <ExpandableEditor key={objective.id ?? index} eyebrow={`Objective ${index + 1}`} title={objective.objective || 'Untitled objective'} meta={objective.deadline || objective.kpi} icon={Target} defaultOpen={index === 0}>
                <EditableText label="Objective" value={objective.objective} onChange={(value) => updatePath(['smartObjectives', index, 'objective'], value)} multiline rows={3} />
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <EditableText label="Target value" value={objective.targetValue} onChange={(value) => updatePath(['smartObjectives', index, 'targetValue'], value)} />
                  <EditableText label="Deadline" value={objective.deadline} onChange={(value) => updatePath(['smartObjectives', index, 'deadline'], value)} />
                  <EditableText label="KPI" value={objective.kpi} onChange={(value) => updatePath(['smartObjectives', index, 'kpi'], value)} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <EditableText label="Measurement method" value={objective.measurementMethod} onChange={(value) => updatePath(['smartObjectives', index, 'measurementMethod'], value)} multiline />
                  <EditableText label="Reasoning" value={objective.reasoning} onChange={(value) => updatePath(['smartObjectives', index, 'reasoning'], value)} multiline />
                </div>
              </ExpandableEditor>
            ))}
          </div>
        </AgentTabPanel>
      )
    }

    if (activeTab === 'campaign') {
      return (
        <AgentTabPanel eyebrow="Campaign planner agent" title="Turn strategy into a campaign system." description="Shape the final creative direction the content workflow will use after approval." icon={Megaphone}>
          <StrategyFieldGroup title="Campaign direction" description="The shared story, visual language, and call to action." icon={Megaphone}>
            <EditableText label="Campaign summary" value={campaign.summary} onChange={(value) => updatePath(['campaignStrategy', 'summary'], value)} multiline rows={5} />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <EditableText label="Storytelling approach" value={campaign.creativeDirection?.storytellingApproach} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'storytellingApproach'], value)} multiline />
              <EditableText label="Visual style" value={campaign.creativeDirection?.visualStyle} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'visualStyle'], value)} multiline />
              <EditableList label="Key messages" values={campaign.creativeDirection?.keyMessages} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'keyMessages'], value)} />
              <EditableList label="Creative do list" values={campaign.creativeDirection?.doList} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'doList'], value)} />
              <EditableText label="Primary CTA" value={campaign.ctaStrategy?.primaryCta} onChange={(value) => updatePath(['campaignStrategy', 'ctaStrategy', 'primaryCta'], value)} />
              <EditableText label="CTA hierarchy" value={campaign.ctaStrategy?.ctaHierarchy} onChange={(value) => updatePath(['campaignStrategy', 'ctaStrategy', 'ctaHierarchy'], value)} multiline />
            </div>
          </StrategyFieldGroup>
          <StrategyFieldGroup title="Recommended concepts" description="Open-ended objectives for the first campaign moves." icon={Wand2}>
            <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.id ?? index} className="strategy-mini-card rounded-2xl border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">{recommendation.name}</p>
                <EditableText label="Objective" value={recommendation.objective} onChange={(value) => updatePath(['campaignStrategy', 'campaignRecommendations', index, 'objective'], value)} multiline />
              </div>
            ))}
            </div>
          </StrategyFieldGroup>
        </AgentTabPanel>
      )
    }

    return (
      <AgentTabPanel eyebrow="Quality gate agent" title="Know what is solid, and what is assumed." description="This audit is read-only. Review the evidence and assumptions before approving the edited strategy." icon={ShieldCheck} bodyClassName="strategy-quality-body">
        <section aria-label="Quality summary" className="grid gap-3 md:grid-cols-3">
          <QualityMetricCard
            icon={ShieldCheck}
            value={qualityScore ?? '--'}
            label="Plan quality"
            description={qualityScore !== null && qualityScore >= 80 ? 'Strong enough to move forward.' : 'Resolve gaps before final approval.'}
            tone={qualityScore !== null && qualityScore >= 80 ? 'success' : 'accent'}
            progress={qualityScore ?? undefined}
          />
          <QualityMetricCard
            icon={Search}
            value={qualityStatusLabel}
            label="Evidence status"
            description="Shows how much of the plan is supported by verified inputs."
            tone={qualityStatusLabel.toLowerCase().includes('ready') ? 'success' : 'warning'}
          />
          <QualityMetricCard
            icon={CircleAlert}
            value={qualityIssueCount}
            label="Open findings"
            description={qualityIssueCount > 0 ? 'Items still need a decision or stronger evidence.' : 'No unresolved findings remain.'}
            tone={qualityIssueCount > 0 ? 'warning' : 'success'}
          />
        </section>

        {qualityAssumptions.length > 0 || qualityNextDecisions.length > 0 ? (
          <div className="grid items-start gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            {qualityAssumptions.length > 0 ? <section className="strategy-quality-section rounded-2xl border p-4 sm:p-5"><ReadOnlyList label="Assumption register" values={qualityAssumptions} icon={Lightbulb} itemIcon={CircleAlert} tone="assumption" /></section> : null}
            {qualityNextDecisions.length > 0 ? <section className="strategy-quality-section rounded-2xl border p-4 sm:p-5"><ReadOnlyList label="Next decisions" values={qualityNextDecisions} icon={Target} itemIcon={ChevronRight} tone="decision" /></section> : null}
          </div>
        ) : null}

        <section className="strategy-quality-section rounded-2xl border p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="strategy-subsection-icon flex size-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true"><Search className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold text-foreground">Research evidence</h4><span className="strategy-soft-badge rounded-full px-2.5 py-1 text-[11px] font-semibold">{qualityEvidenceSources.length} sources</span></div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Open a source to review the original evidence behind the strategy.</p>
            </div>
          </div>
          {qualityEvidenceSources.length > 0 ? (
            <ul className="strategy-evidence-list mt-4 overflow-hidden rounded-xl border" aria-label="Research evidence sources">
              {qualityEvidenceSources.map((source, index) => {
                const domain = getEvidenceDomain(source)
                return (
                  <li key={`${source.url}-${index}`} className="border-b border-border last:border-b-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      title={source.excerpt ? `${source.title} — ${source.excerpt}` : source.title}
                      aria-label={`Open ${source.title} from ${domain}`}
                      className="strategy-evidence-row group grid min-h-12 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(7rem,11rem)_auto]"
                    >
                      <span className="strategy-evidence-icon flex size-8 shrink-0 items-center justify-center rounded-lg" aria-hidden="true"><Globe2 className="size-4" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">{source.title}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground sm:hidden">{domain}</span>
                      </span>
                      <span className="hidden truncate text-right font-mono text-[11px] text-muted-foreground sm:block">{domain}</span>
                      <ExternalLink className="hidden size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary sm:block" aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="strategy-quality-notice mt-4 flex items-start gap-3 rounded-xl border p-3.5" role="status"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><div><p className="text-xs font-semibold">External evidence is still needed</p><p className="mt-1 text-xs leading-5">Treat the current assumptions as working inputs and confirm them before launch.</p></div></div>
          )}
        </section>

        {qualityIssueCount > 0 ? (
          <section className="strategy-quality-section rounded-2xl border p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3"><span className="strategy-quality-warning-icon flex size-9 items-center justify-center rounded-xl"><AlertTriangle className="size-4" /></span><div><h4 className="text-sm font-semibold text-foreground">Findings to resolve</h4><p className="mt-0.5 text-xs text-muted-foreground">Address these before approving the plan.</p></div><span className="ml-auto rounded-full bg-[#fff1dc] px-2.5 py-1 text-[11px] font-bold text-[#8a4b08]">{qualityIssueCount} open</span></div>
            <div className="grid gap-3 md:grid-cols-2">
              {qualityIssues.map((issue, index) => (
                <article key={`${issue.code}-${index}`} className="strategy-quality-finding rounded-xl border p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9b5a12]">{issue.severity} · {issue.field}</p>
                  <p className="mt-2 text-sm leading-5 text-foreground">{issue.message}</p>
                  <p className="mt-2 border-t border-[#efd9b8] pt-2 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Recommended:</span> {issue.resolution}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </AgentTabPanel>
    )
  }
