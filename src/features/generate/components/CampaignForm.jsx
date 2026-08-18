import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND_VOICE_PRESETS, CAMPAIGN_GOAL_OPTIONS, PLATFORM_OPTIONS } from '../schema/campaignSchema'
import { CAMPAIGN_FORM_STEPS, PLATFORM_ICONS } from '../model/generateConfig'
import {
  campaignCreditCost,
  campaignLimitDescription,
  campaignPostCount,
  clampCampaignValues,
  getAvailableDurations,
  getCampaignPlanLimits,
} from '../model/campaignPlanLimits'
import { LoadingRing } from './AppHeader'

function FieldLabel({ htmlFor, children, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">
      {children}
      {optional ? <span className="ml-auto font-normal normal-case tracking-normal text-[#938a98]">Optional</span> : null}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-[#ad3150]">{String(message)}</p>
}

function selectClass(hasError) {
  return `h-12 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-[15px] text-[#201a25] outline-none transition focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10 ${
    hasError ? 'border-[#ad3150]' : 'border-[#d8cfdc]'
  }`
}

function inputClass(hasError) {
  return `h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-[#201a25] shadow-[0_1px_2px_rgba(29,27,32,0.03)] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10 ${
    hasError ? 'border-[#ad3150]' : 'border-[#d8cfdc]'
  }`
}

/**
 * The price of the campaign as currently shaped: one credit for the strategy
 * plus one for every post. The three fields that decide it — duration, posts
 * per week, and platforms — live on two different steps, so the total is shown
 * beside each of them rather than only at the end.
 */
function CreditCostNote({ creditCost, postCount, remaining, overBudget }) {
  if (creditCost === null) return null

  const tone = overBudget
    ? 'border-[#e7c4cf] bg-[#fdf2f5] text-[#8a3145]'
    : 'border-[#dfd4e5] bg-[#f8f2fa] text-[#6f6277]'

  return (
    <div className={`mt-3 rounded-xl border px-3.5 py-3 text-[11px] leading-5 ${tone}`}>
      <span className="font-bold text-[#4f378a]">
        This campaign uses {creditCost} {creditCost === 1 ? 'credit' : 'credits'}
      </span>{' '}
      — 1 for the strategy and {postCount} for {postCount === 1 ? 'its post' : 'its posts'}.
      {remaining === null ? null : (
        <>
          {' '}You have {remaining} left.{' '}
          {overBudget ? (
            <Link to="/billing" className="font-bold underline underline-offset-2">
              Upgrade, or shorten the campaign
            </Link>
          ) : null}
        </>
      )}
    </div>
  )
}

function CampaignForm({ values, setValues, errors, onGenerate, onFillTestData, isGenerating, isLocked = false, initiallyOpen = false, onRequestClose, isModal = false, creditUsage }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [currentStep, setCurrentStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const set = (patch) => setValues((current) => ({ ...current, ...patch }))
  const stepCompletion = CAMPAIGN_FORM_STEPS.map((step) => Boolean(step.isComplete(values)))
  const currentStepData = CAMPAIGN_FORM_STEPS[currentStep]
  const currentStepComplete = stepCompletion[currentStep]
  const isLastStep = currentStep === CAMPAIGN_FORM_STEPS.length - 1
  const campaignLimits = useMemo(() => getCampaignPlanLimits(creditUsage), [creditUsage])
  const availableDurations = getAvailableDurations(campaignLimits.maxCampaignWeeks)

  useEffect(() => {
    if (!campaignLimits.isResolved) return
    setValues((current) => {
      const next = clampCampaignValues(current, campaignLimits)
      const unchanged =
        next.duration === current.duration &&
        next.postsPerWeek === current.postsPerWeek &&
        next.generateImages === current.generateImages &&
        next.platforms?.length === current.platforms?.length
      return unchanged ? current : next
    })
  }, [campaignLimits, setValues])

  const platformsAtLimit = values.platforms.length >= campaignLimits.maxPlatforms

  const togglePlatform = (id) => {
    setValues((current) => {
      const selected = current.platforms.includes(id)
      if (!selected && current.platforms.length >= campaignLimits.maxPlatforms) {
        return current
      }
      return {
        ...current,
        platforms: selected
          ? current.platforms.filter((platform) => platform !== id)
          : [...current.platforms, id],
      }
    })
  }

  // One credit per post, plus one for the strategy. Shown before submitting
  // because a campaign's shape decides its price, and the three inputs that
  // drive it sit on two different steps of this form.
  const postCount = campaignPostCount(values)
  const creditCost = campaignCreditCost(values)
  const creditsRemaining = creditUsage?.remaining ?? null
  const overBudget =
    creditCost !== null && creditsRemaining !== null && creditCost > creditsRemaining

  const onPresetClick = (preset) => {
    setValues((current) => ({
      ...current,
      voicePreset: preset.id,
      brandVoice: preset.value,
    }))
  }

  const fillWithTestData = () => {
    onFillTestData(campaignLimits)
    setCurrentStep(0)
    setFurthestStep(0)
    setIsOpen(true)
  }

  const goToStep = (index) => {
    const previousStepsComplete = stepCompletion.slice(0, index).every(Boolean)
    if (index <= furthestStep && previousStepsComplete) setCurrentStep(index)
  }

  const submitStep = (event) => {
    if (isLastStep) {
      onGenerate(event)
      return
    }
    event.preventDefault()
    if (currentStepComplete) {
      const nextStep = Math.min(currentStep + 1, CAMPAIGN_FORM_STEPS.length - 1)
      setCurrentStep(nextStep)
      setFurthestStep((step) => Math.max(step, nextStep))
    }
  }

  const closeForm = () => {
    if (onRequestClose) onRequestClose()
    else setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <section className="w-full shrink-0 border-b border-[#ded7e3] bg-[#fffaff] lg:w-[410px] lg:border-b-0 lg:border-r">
        <div className="mx-auto flex max-w-xl flex-col px-5 py-6 sm:px-7 lg:h-[calc(100dvh-64px)] lg:justify-center lg:overflow-y-auto">
          <div className="overflow-hidden rounded-[26px] border border-[#ded4e4] bg-white shadow-[0_18px_50px_rgba(54,35,68,0.09)]">
            <div className="relative border-b border-[#ece4ef] bg-[#f4eef9] px-6 py-7">
              <span className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full border-[18px] border-white/45" />
              <span className="relative flex size-11 items-center justify-center rounded-2xl bg-[#4f378a] text-white shadow-[0_8px_18px_rgba(79,55,138,0.24)]">
                <Wand2 className="size-5" />
              </span>
              <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.17em] text-[#4f378a]">Campaign builder</p>
              <h1 className="relative mt-2 font-display text-[34px] leading-[1.05] tracking-[-0.8px] text-[#201a25]">Create with a clear brief.</h1>
              <p className="relative mt-3 text-sm leading-6 text-[#706676]">A short guided form will turn your business context into a strategy ready for review.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                {CAMPAIGN_FORM_STEPS.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <span className="mx-auto flex size-7 items-center justify-center rounded-full border border-[#d8cce1] bg-[#faf7fc] text-[11px] font-bold text-[#695d70]">{index + 1}</span>
                    <span className="mt-1.5 block truncate text-[10px] font-semibold text-[#7a7080]">{step.label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={isLocked}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-bold text-white shadow-[0_9px_22px_rgba(56,30,114,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4f378a] hover:shadow-[0_13px_28px_rgba(56,30,114,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Sparkles className="size-4" />
                {isLocked ? 'Select a campaign chat first' : 'Open campaign brief'}
                {!isLocked ? <ChevronRight className="size-4" /> : null}
              </button>
              {!isLocked ? <button type="button" onClick={fillWithTestData} className="mt-3 w-full text-center text-xs font-semibold text-[#4f378a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">Or fill with test data</button> : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={isModal ? 'w-full bg-[#fffaff]' : 'w-full shrink-0 border-b border-[#ded7e3] bg-[#fffaff] lg:w-[410px] lg:border-b-0 lg:border-r'}>
      <form
        className={isModal ? 'mx-auto flex max-h-[calc(100dvh-48px)] max-w-3xl flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10' : 'mx-auto flex max-w-xl flex-col px-5 py-6 sm:px-7 lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto'}
        onSubmit={submitStep}
      >
        <fieldset disabled={isLocked} className="contents">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#4f378a]">Campaign brief</span>
            <button type="button" onClick={closeForm} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#746b79] transition hover:bg-[#f1eaf4] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">{isModal ? 'Close' : 'Hide form'}</button>
          </div>

          <div className="relative mt-5 px-1">
            <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-[#ddd3e3]" />
            <div className="absolute left-[12.5%] top-4 h-px bg-[#4f378a] transition-[width] duration-300" style={{ width: `${(currentStep / (CAMPAIGN_FORM_STEPS.length - 1)) * 75}%` }} />
            <ol className="relative grid grid-cols-4 gap-1" aria-label="Campaign brief progress">
              {CAMPAIGN_FORM_STEPS.map((step, index) => {
                const isCurrent = index === currentStep
                const isComplete = index < furthestStep && stepCompletion[index]
                const isUnlocked = index <= furthestStep && stepCompletion.slice(0, index).every(Boolean)
                return (
                  <li key={step.id} className="min-w-0 text-center">
                    <button
                      type="button"
                      onClick={() => goToStep(index)}
                      disabled={!isUnlocked}
                      aria-current={isCurrent ? 'step' : undefined}
                      title={isComplete ? `${step.label} completed` : step.label}
                      className="group w-full rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed"
                    >
                      <span className={`mx-auto flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${isCurrent ? 'border-[#4f378a] bg-[#4f378a] text-white shadow-[0_5px_14px_rgba(79,55,138,0.24)]' : isComplete ? 'border-[#9fcd68] bg-[#e6fbc7] text-[#315c19] group-hover:-translate-y-0.5 group-hover:shadow-sm' : 'border-[#d8cfe0] bg-white text-[#8a7f90]'}`}>
                        {isComplete && !isCurrent ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                      </span>
                      <span className={`mt-1.5 block truncate text-[10px] font-bold transition-colors ${isCurrent ? 'text-[#4f378a]' : isComplete ? 'text-[#476b32] group-hover:text-[#315c19]' : 'text-[#8d8392]'}`}>{step.label}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <motion.div key={currentStepData.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#78688a]">Step {currentStep + 1} of {CAMPAIGN_FORM_STEPS.length}</p>
            <h1 className="mt-1.5 font-display text-[30px] leading-[1.08] tracking-[-0.7px] text-[#201a25]">{currentStepData.title}</h1>
            <p className="mt-2 text-sm leading-5 text-[#746b79]">{currentStepData.description}</p>
          </motion.div>

          {currentStep === 0 ? <button type="button" onClick={fillWithTestData} className="mt-3 text-xs font-semibold text-[#4f378a] transition-colors hover:text-[#381e72] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2">Fill with test data</button> : null}
        </div>

        {currentStep === 0 ? <motion.div key="basics" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
        <div>
          <FieldLabel htmlFor="brand-name">Brand name</FieldLabel>
          <input
            id="brand-name"
            value={values.brandName}
            onChange={(event) => set({ brandName: event.target.value })}
            placeholder="e.g. Ember Goods Co."
            className={inputClass(Boolean(errors.brandName))}
            aria-invalid={Boolean(errors.brandName)}
          />
          <FieldError message={errors.brandName} />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="product">Product or campaign</FieldLabel>
          <input
            id="product"
            value={values.product}
            onChange={(event) => set({ product: event.target.value })}
            placeholder="e.g. A smart mug that keeps coffee at the perfect temperature"
            className={inputClass(Boolean(errors.product))}
            aria-invalid={Boolean(errors.product)}
          />
          <FieldError message={errors.product} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="industry">Industry</FieldLabel>
            <input
              id="industry"
              value={values.industry}
              onChange={(event) => set({ industry: event.target.value })}
              placeholder="e.g. Consumer tech"
              className={inputClass(Boolean(errors.industry))}
              aria-invalid={Boolean(errors.industry)}
            />
            <FieldError message={errors.industry} />
          </div>
          <div>
            <FieldLabel htmlFor="business-type">Business type</FieldLabel>
            <input
              id="business-type"
              value={values.businessType}
              onChange={(event) => set({ businessType: event.target.value })}
              placeholder="e.g. DTC brand"
              className={inputClass(Boolean(errors.businessType))}
              aria-invalid={Boolean(errors.businessType)}
            />
            <FieldError message={errors.businessType} />
          </div>
        </div>
        </motion.div> : null}

        {currentStep === 1 ? <motion.div key="audience" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
        <div>
          <FieldLabel htmlFor="campaign-goal">Campaign goal</FieldLabel>
          <div className="relative">
            <select
              id="campaign-goal"
              value={values.campaignGoal}
              onChange={(event) => set({ campaignGoal: event.target.value })}
              className={selectClass(Boolean(errors.campaignGoal))}
              aria-invalid={Boolean(errors.campaignGoal)}
            >
              <option value="">Select a goal…</option>
              {CAMPAIGN_GOAL_OPTIONS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#776e7d]" />
          </div>
          <FieldError message={errors.campaignGoal} />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="audience">Audience</FieldLabel>
          <input
            id="audience"
            value={values.targetAudience}
            onChange={(event) => set({ targetAudience: event.target.value })}
            placeholder="e.g. Creative professionals, 25–40"
            className={inputClass(Boolean(errors.targetAudience))}
            aria-invalid={Boolean(errors.targetAudience)}
          />
          <FieldError message={errors.targetAudience} />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="pricing" optional>
            Pricing or offer context
          </FieldLabel>
          <input
            id="pricing"
            value={values.pricing}
            onChange={(event) => set({ pricing: event.target.value })}
            placeholder="e.g. $129 one-time purchase, free shipping"
            className={inputClass(Boolean(errors.pricing))}
          />
        </div>
        </motion.div> : null}

        {currentStep === 2 ? <motion.div key="voice" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
        <fieldset>
          <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">Brand voice</legend>
          <div className="grid grid-cols-2 gap-2">
            {BRAND_VOICE_PRESETS.map((preset) => {
              const selected = values.voicePreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selected}
                  data-selected={selected}
                  onClick={() => onPresetClick(preset)}
                  className={`campaign-voice-preset h-10 rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                    selected
                      ? 'border-[#4f378a] text-[#381e72]'
                      : 'border-[#dcd4df] bg-white text-[#665d6b] hover:border-[#a99db0] hover:text-[#201a25]'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
          <input
            value={values.brandVoice}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                voicePreset: BRAND_VOICE_PRESETS.some((preset) => preset.value === event.target.value.trim())
                  ? BRAND_VOICE_PRESETS.find((preset) => preset.value === event.target.value.trim()).id
                  : 'custom',
                brandVoice: event.target.value,
              }))
            }
            placeholder="Describe the voice, e.g. witty, confident, minimal"
            className={`campaign-voice-input mt-2 h-11 w-full rounded-xl border px-3.5 text-sm text-[#201a25] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10 ${
              errors.brandVoice ? 'border-[#ad3150]' : 'border-[#dcd4df]'
            }`}
            aria-label="Brand voice description"
            aria-invalid={Boolean(errors.brandVoice)}
          />
          <FieldError message={errors.brandVoice} />
        </fieldset>

        <div className="mt-5 flex gap-3">
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="duration">Duration</FieldLabel>
            <div className="relative">
              <select
                id="duration"
                value={values.duration}
                onChange={(event) => set({ duration: event.target.value })}
                className={selectClass(Boolean(errors.duration))}
                aria-invalid={Boolean(errors.duration)}
              >
                {availableDurations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#776e7d]" />
            </div>
            <FieldError message={errors.duration} />
          </div>
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="posts-per-week">Posts per week</FieldLabel>
            <div className="flex h-12 items-center rounded-xl border border-[#d8cfdc] bg-white p-1">
              <button
                type="button"
                aria-label="Decrease posts per week"
                onClick={() =>
                  setValues((current) => ({ ...current, postsPerWeek: Math.max(1, current.postsPerWeek - 1) }))
                }
                disabled={values.postsPerWeek <= 1}
                className="flex size-9 items-center justify-center rounded-lg text-lg text-[#625b71] hover:bg-[#f3edf5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <input
                id="posts-per-week"
                type="number"
                min={1}
                max={campaignLimits.maxPostsPerWeek}
                value={values.postsPerWeek}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10)
                  set({ postsPerWeek: Number.isNaN(next) ? '' : next })
                }}
                className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-[#201a25] outline-none"
              />
              <button
                type="button"
                aria-label="Increase posts per week"
                onClick={() =>
                  setValues((current) => ({ ...current, postsPerWeek: Math.min(campaignLimits.maxPostsPerWeek, (current.postsPerWeek || 1) + 1) }))
                }
                disabled={values.postsPerWeek >= campaignLimits.maxPostsPerWeek}
                className="flex size-9 items-center justify-center rounded-lg text-lg text-[#625b71] hover:bg-[#f3edf5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
            <FieldError message={errors.postsPerWeek} />
          </div>
        </div>

        {campaignLimits.isResolved ? (
          <div className="mt-3 rounded-xl border border-[#dfd4e5] bg-[#f8f2fa] px-3.5 py-3 text-[11px] leading-5 text-[#6f6277]">
            <span className="font-bold text-[#4f378a]">{campaignLimitDescription(campaignLimits)}</span>{' '}
            {campaignLimits.hasPlanCaps ? <Link to="/billing" className="font-bold underline underline-offset-2">Upgrade for more</Link> : null}
          </div>
        ) : null}

        <CreditCostNote
          creditCost={creditCost}
          postCount={postCount}
          remaining={creditsRemaining}
          overBudget={overBudget}
        />

        {campaignLimits.allowsImageGeneration ? (
        <div className="mt-5">
          <FieldLabel htmlFor="include-images">Post images</FieldLabel>
          <button
            id="include-images"
            type="button"
            role="switch"
            aria-checked={values.generateImages}
            onClick={() => setValues((current) => ({ ...current, generateImages: !current.generateImages }))}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#d8cfdc] bg-white px-3 text-sm font-medium text-[#514a56] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="size-4 text-[#4f378a]" /> {values.generateImages ? 'Generate visuals' : 'Off'}
            </span>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${values.generateImages ? 'bg-[#4f378a]' : 'bg-[#cfc6d2]'}`}>
              <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${values.generateImages ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
          <p className="mt-1.5 text-[11px] text-[#8b818f]">
            Turn this off if your image provider is rate-limited; copy, hashtags, QA, and scheduling will still run.
          </p>
        </div>
        ) : (
        <div className="mt-5 rounded-xl border border-[#dfd4e5] bg-[#f8f2fa] px-3.5 py-3 text-[11px] leading-5 text-[#6f6277]">
          <span className="flex items-center gap-2 font-bold text-[#4f378a]">
            <ImageIcon className="size-3.5" /> Posts are written without images on {campaignLimits.name}.
          </span>
          <span className="mt-1 block">
            Copy, hashtags, QA, and scheduling all still run.{' '}
            <Link to="/billing" className="font-bold underline underline-offset-2">Upgrade for AI images</Link>
          </span>
        </div>
        )}
        </motion.div> : null}

        {currentStep === 3 ? <motion.div key="channels" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
        <fieldset>
          <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">Publish on</legend>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORM_OPTIONS.map(({ id, label }) => {
              const selected = values.platforms.includes(id)
              const Icon = PLATFORM_ICONS[id]
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  data-selected={selected}
                  onClick={() => togglePlatform(id)}
                  disabled={!selected && platformsAtLimit}
                  className={`campaign-platform-option flex h-10 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected ? 'border-[#4f378a] text-[#381e72]' : 'border-[#dcd4df] bg-white text-[#665d6b] hover:border-[#a99db0]'
                  }`}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  <span>{label}</span>
                  {selected ? <Check className="ml-auto size-3.5" strokeWidth={2.5} /> : null}
                </button>
              )
            })}
          </div>
          <FieldError message={errors.platforms} />
          {campaignLimits.isResolved ? (
            <p className="mt-2 text-[11px] leading-5 text-[#6f6277]">
              Every platform gets its own post, so each one you add multiplies the
              campaign. <span className="font-bold text-[#4f378a]">{campaignLimits.name} allows {campaignLimits.maxPlatforms} {campaignLimits.maxPlatforms === 1 ? 'platform' : 'platforms'}.</span>{' '}
              {platformsAtLimit ? <Link to="/billing" className="font-bold underline underline-offset-2">Upgrade for more</Link> : null}
            </p>
          ) : null}
        </fieldset>

        <CreditCostNote
          creditCost={creditCost}
          postCount={postCount}
          remaining={creditsRemaining}
          overBudget={overBudget}
        />

        <div className="mt-5">
          <FieldLabel htmlFor="key-messages" optional>
            Key messages
          </FieldLabel>
          <textarea
            id="key-messages"
            rows={3}
            value={values.keyMessagesText}
            onChange={(event) => set({ keyMessagesText: event.target.value })}
            placeholder="One message per line — e.g.&#10;Keeps coffee at the perfect temperature&#10;Designed in Portland, made to last"
            className="min-h-[88px] w-full resize-y rounded-xl border border-[#d8cfdc] bg-white px-3.5 py-3 text-sm leading-[1.55] text-[#201a25] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
          />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="constraints" optional>
            Constraints
          </FieldLabel>
          <textarea
            id="constraints"
            rows={2}
            value={values.constraints}
            onChange={(event) => set({ constraints: event.target.value })}
            placeholder="Banned words, compliance notes, must-haves…"
            className="min-h-[64px] w-full resize-y rounded-xl border border-[#d8cfdc] bg-white px-3.5 py-3 text-sm leading-[1.55] text-[#201a25] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
          />
        </div>
        </motion.div> : null}

        <div className="mt-7 border-t border-[#e3dce5] pt-5">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0}
              className="flex h-12 min-w-[108px] items-center justify-center gap-1.5 rounded-xl border border-[#d8cfdc] bg-white px-4 text-sm font-semibold text-[#62586a] transition hover:border-[#b8a8c4] hover:bg-[#f7f2fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="size-4 rotate-180" /> Previous
            </button>
            <button
              type="submit"
              disabled={!currentStepComplete || isGenerating || (isLastStep && (creditUsage?.canGenerate === false || overBudget))}
              className="group relative flex h-12 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
            >
              <span className="absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-96" />
              {isLastStep ? (isGenerating ? <LoadingRing className="size-[17px] text-[#d8ff9d]" /> : <Wand2 className="size-[17px] text-[#d8ff9d]" />) : null}
              {isLastStep
                ? (isGenerating ? 'Building…' : creditUsage?.canGenerate === false ? 'Credits required' : overBudget ? `Needs ${creditCost} credits` : 'Build strategy')
                : <>Next <ChevronRight className="size-4" /></>}
            </button>
          </div>
          {!currentStepComplete ? (
            <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">Complete the required fields above to continue.</p>
          ) : isLastStep && creditUsage?.canGenerate === false ? (
            <p role="status" className="mt-2.5 text-center text-[11px] font-medium text-[#9f2949]">
              {creditUsage.blockedReason === 'payment_required' ? 'Your subscription needs attention.' : 'Your monthly credits are used.'}{' '}
              <Link to="/billing" className="font-bold text-[#4f378a] underline underline-offset-2">Manage plan</Link>
            </p>
          ) : (
            <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">{isLastStep ? `Building the strategy uses 1 credit${postCount ? `; the ${postCount} ${postCount === 1 ? 'post costs' : 'posts cost'} ${postCount} more` : ''}. Posts begin only after your approval.` : 'Your progress is saved as you move between steps.'}</p>
          )}
        </div>
        </fieldset>
      </form>
    </section>
  )
}

export function CampaignFormModal({ open, onClose, chatKey, ...formProps }) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#211928]/55 p-3 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Campaign brief"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/70 bg-[#fffaff] shadow-[0_30px_90px_rgba(31,20,40,0.28)]"
          >
            <CampaignForm key={chatKey} {...formProps} initiallyOpen isModal onRequestClose={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
