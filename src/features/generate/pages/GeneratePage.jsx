import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  AtSign,
  Bell,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  Copy,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Music2,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Video,
  Wand2,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  campaignBriefSchema,
  campaignOutputSchema,
  BRAND_VOICE_PRESETS,
  CAMPAIGN_GOAL_OPTIONS,
  DURATION_OPTIONS,
  PLATFORM_OPTIONS,
} from '../schema/campaignSchema'
import {
  cancelCampaign,
  startCampaign,
  waitForCampaign,
} from '@/lib/campaignApi'

const PLATFORM_ICONS = {
  instagram: Camera,
  twitter: AtSign,
  linkedin: BriefcaseBusiness,
  facebook: Users,
  tiktok: Music2,
  youtube_shorts: Video,
}

const ART_GRADIENTS = [
  'from-[#f2d8b8] via-[#e7b58d] to-[#7c482e]',
  'from-[#d8d0ea] via-[#8a769f] to-[#34263f]',
  'from-[#f0b8c6] via-[#b95770] to-[#522232]',
  'from-[#bfe6cf] via-[#66b89a] to-[#1f5142]',
  'from-[#d6e8ff] via-[#6f9bd1] to-[#243a64]',
  'from-[#fde3b3] via-[#e3a86b] to-[#7a4a1a]',
]

const WORKFLOW_STEPS = [
  { id: 'research', label: 'Research' },
  { id: 'strategize', label: 'Strategy' },
  { id: 'generate-content', label: 'Copywriting' },
  { id: 'generate-visuals', label: 'Visual direction', optional: 'images' },
  { id: 'generate-images', label: 'Image generation', optional: 'images' },
  { id: 'generate-hashtags', label: 'Hashtags & SEO' },
  { id: 'qa', label: 'Editor QA' },
  { id: 'schedule', label: 'Calendar' },
]

const initialProjects = [
  {
    id: 1,
    name: 'Spring Launch',
    meta: '6 conversations',
    color: '#b7f36b',
  },
  {
    id: 2,
    name: 'Evergreen Social',
    meta: '12 conversations',
    color: '#d0bcff',
  },
  {
    id: 3,
    name: 'Founder Stories',
    meta: '4 conversations',
    color: '#ffb3c7',
  },
]

function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[11px] bg-[#381e72] text-white shadow-[0_5px_14px_rgba(56,30,114,0.25)]">
      <span className="absolute -right-1 -top-2 size-5 rounded-full bg-[#b7f36b]" />
      <Sparkles className="relative size-[18px]" strokeWidth={2.2} />
    </span>
  )
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Generate', to: '/generate' },
  { label: 'Connectors', to: '/connectors' },
  { label: 'Pricing', href: '/#pricing' },
]

function AppHeader() {
  const location = useLocation()

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-[#ded7e3] bg-[#fffaff]/95 px-4 backdrop-blur-xl sm:px-6">
      <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="AetherFlow home">
        <BrandMark />
        <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
          AetherFlow <span className="font-normal text-[#6a6170]">AI</span>
        </span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
        {navLinks.map((link) => {
          const isActive = link.to ? location.pathname === link.to : false
          const className = `text-sm transition-colors ${isActive ? 'font-semibold text-[#381e72]' : 'text-[#6a6170] hover:text-[#381e72]'}`
          return link.to ? (
            <Link key={link.to} to={link.to} className={className}>
              {link.label}
            </Link>
          ) : (
            <a key={link.href} href={link.href} className={className}>
              {link.label}
            </a>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="hidden h-10 min-w-48 items-center gap-2 rounded-xl border border-[#ded7e3] bg-white px-3 text-sm text-[#776e7d] shadow-[0_1px_2px_rgba(29,27,32,0.04)] transition-colors hover:border-[#a99eb4] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] md:flex"
          aria-label="Search projects"
        >
          <Search className="size-4" />
          <span>Search anything</span>
          <kbd className="ml-auto rounded-md bg-[#f3edf5] px-1.5 py-0.5 text-[10px] text-[#625b71]">⌘ K</kbd>
        </button>
        {[HelpCircle, Bell].map((Icon, index) => (
          <button
            key={index}
            type="button"
            aria-label={index === 0 ? 'Help and resources' : 'Notifications'}
            className="relative flex size-10 items-center justify-center rounded-xl text-[#625b71] transition-colors hover:bg-[#f3edf5] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            <Icon className="size-[19px]" />
            {index === 1 ? <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ad3150] ring-2 ring-[#fffaff]" /> : null}
          </button>
        ))}
        <button
          type="button"
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-[#e3d5f7] text-xs font-bold text-[#381e72] ring-1 ring-[#cbb9e3] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
          aria-label="Open profile menu"
        >
          YA
        </button>
      </div>
    </header>
  )
}

function ProjectSidebar({ projects, activeProject, onSelect, onNewProject }) {
  return (
    <aside className="hidden w-[244px] shrink-0 flex-col border-r border-[#ded7e3] bg-[#f6f0f7] p-3 lg:flex">
      <button
        type="button"
        onClick={() => document.querySelector('#product')?.focus()}
        className="group flex h-12 w-full items-center gap-3 rounded-xl bg-[#381e72] px-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(56,30,114,0.18)] transition-all hover:bg-[#4f378a] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
      >
        <Wand2 className="size-[18px] text-[#d8ff9d] transition-transform group-hover:rotate-12" />
        Generate content
      </button>

      <nav className="mt-3 space-y-1" aria-label="Workspace navigation">
        <button className="flex h-10 w-full items-center gap-3 rounded-xl bg-white/70 px-3 text-sm font-medium text-[#381e72] ring-1 ring-[#e2d9e6]" type="button">
          <Folder className="size-[18px]" /> Projects
        </button>
        <button className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-[#625b71] transition-colors hover:bg-white/70 hover:text-[#201a25]" type="button">
          <MessageSquare className="size-[18px]" /> Chat history
        </button>
      </nav>

      <div className="mt-6 flex items-center justify-between px-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#827887]">Your projects</p>
        <button
          type="button"
          onClick={onNewProject}
          aria-label="Create new project"
          className="flex size-8 items-center justify-center rounded-lg text-[#625b71] transition-colors hover:bg-white hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="mt-1.5 space-y-1">
        {projects.map((project) => {
          const isActive = project.id === activeProject
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelect(project.id)}
              className={`group flex min-h-[58px] w-full items-center gap-3 rounded-xl px-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                isActive ? 'bg-white shadow-[0_2px_12px_rgba(37,24,44,0.07)] ring-1 ring-[#e0d7e4]' : 'hover:bg-white/60'
              }`}
            >
              <span className="size-2.5 shrink-0 rounded-full ring-4 ring-white" style={{ backgroundColor: project.color }} />
              <span className="min-w-0">
                <span className={`block truncate text-sm ${isActive ? 'font-semibold text-[#201a25]' : 'font-medium text-[#514a56]'}`}>
                  {project.name}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[#89808e]">{project.meta}</span>
              </span>
              {isActive ? <ChevronLeft className="ml-auto size-3.5 rotate-180 text-[#85798c]" /> : null}
            </button>
          )
        })}
      </div>

      <div className="mt-auto rounded-2xl border border-[#ded3e4] bg-[#fffaff] p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#381e72]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#e6fbc7]">
            <Sparkles className="size-3.5" />
          </span>
          Pro workspace
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e1eb]">
          <div className="h-full w-[64%] rounded-full bg-[#4f378a]" />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-[#746b79]">6,420 of 10,000 words used</p>
        <button type="button" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#4f378a] hover:underline">
          <Settings className="size-3.5" /> Manage plan
        </button>
      </div>
    </aside>
  )
}

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

const EMPTY_VALUES = {
  brandName: '',
  product: '',
  campaignGoal: '',
  targetAudience: '',
  brandVoice: 'warm, friendly, comforting',
  voicePreset: 'warm',
  platforms: ['instagram', 'linkedin'],
  duration: '2 weeks',
  postsPerWeek: 3,
  generateImages: true,
  keyMessagesText: '',
  constraints: '',
}

function buildBrief(values) {
  const keyMessages = values.keyMessagesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return {
    brandName: values.brandName,
    brandVoice: values.brandVoice,
    product: values.product,
    campaignGoal: values.campaignGoal,
    targetAudience: values.targetAudience,
    platforms: values.platforms,
    duration: values.duration,
    postsPerWeek: values.postsPerWeek,
    generateImages: values.generateImages,
    keyMessages,
    constraints: values.constraints,
  }
}

function CampaignForm({ values, setValues, errors, onGenerate, isGenerating }) {
  const set = (patch) => setValues((current) => ({ ...current, ...patch }))

  const togglePlatform = (id) => {
    setValues((current) => ({
      ...current,
      platforms: current.platforms.includes(id)
        ? current.platforms.filter((platform) => platform !== id)
        : [...current.platforms, id],
    }))
  }

  const onPresetClick = (preset) => {
    setValues((current) => ({
      ...current,
      voicePreset: preset.id,
      brandVoice: preset.value,
    }))
  }

  return (
    <section className="w-full shrink-0 border-b border-[#ded7e3] bg-[#fffaff] lg:w-[374px] lg:border-b-0 lg:border-r">
      <form
        className="mx-auto flex max-w-xl flex-col px-5 py-6 sm:px-7 lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto"
        onSubmit={onGenerate}
      >
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[#4f378a]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#4f378a]">Campaign brief</span>
          </div>
          <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.8px] text-[#201a25]">What are we creating?</h1>
          <p className="mt-2 text-sm leading-5 text-[#746b79]">
            Give the creative team a clear direction. Every field here feeds the workflow that researches, writes, and schedules your campaign.
          </p>
        </div>

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
            placeholder="e.g. Ember Smart Mug"
            className={inputClass(Boolean(errors.product))}
            aria-invalid={Boolean(errors.product)}
          />
          <FieldError message={errors.product} />
        </div>

        <div className="mt-5">
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

        <fieldset className="mt-5">
          <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">Brand voice</legend>
          <div className="grid grid-cols-2 gap-2">
            {BRAND_VOICE_PRESETS.map((preset) => {
              const selected = values.voicePreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPresetClick(preset)}
                  className={`h-10 rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                    selected
                      ? 'border-[#4f378a] bg-[#eee5f8] text-[#381e72] shadow-[inset_0_0_0_1px_#4f378a]'
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
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#201a25] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10 ${
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
                {DURATION_OPTIONS.map((duration) => (
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
                max={20}
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
                  setValues((current) => ({ ...current, postsPerWeek: Math.min(20, (current.postsPerWeek || 1) + 1) }))
                }
                disabled={values.postsPerWeek >= 20}
                className="flex size-9 items-center justify-center rounded-lg text-lg text-[#625b71] hover:bg-[#f3edf5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
            <FieldError message={errors.postsPerWeek} />
          </div>
        </div>

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

        <fieldset className="mt-5">
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
                  onClick={() => togglePlatform(id)}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                    selected ? 'border-[#4f378a] bg-[#f2eafa] text-[#381e72]' : 'border-[#dcd4df] bg-white text-[#665d6b] hover:border-[#a99db0]'
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
        </fieldset>

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

        <div className="mt-7 border-t border-[#e3dce5] pt-5">
          <button
            type="submit"
            disabled={isGenerating}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
          >
            <span className="absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-96" />
            {isGenerating ? (
              <Loader2 className="size-[17px] animate-spin text-[#d8ff9d]" />
            ) : (
              <Wand2 className="size-[17px] text-[#d8ff9d]" />
            )}
            {isGenerating ? 'Running the workflow…' : 'Generate campaign'}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">
            Runs research, strategy, copywriting, visuals, hashtags, QA, and calendar steps
          </p>
        </div>
      </form>
    </section>
  )
}

function PostArtwork({ gradient, imageUrl, label, product, platform }) {
  return (
    <div role="img" aria-label={label} className={`relative min-h-48 overflow-hidden ${imageUrl ? '' : `bg-gradient-to-br ${gradient}`}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="absolute -right-8 -top-8 size-36 rounded-full border border-white/35 bg-white/10" />
      <div className="absolute bottom-[-52px] left-[-38px] size-44 rounded-full bg-[#201a25]/20 blur-sm" />
      <div className="absolute inset-x-6 bottom-5 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            {platform}
          </span>
          <span className="font-display text-3xl leading-none tracking-tight text-white drop-shadow-sm">
            {product || 'Your brand'}
          </span>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full border border-white/35 bg-white/15 backdrop-blur-md">
          <Sparkles className="size-5 text-white" />
        </span>
      </div>
    </div>
  )
}

function PostCard({ post, index, showImage, product, onCaptionChange }) {
  const [copied, setCopied] = useState(false)
  const platformLabel = PLATFORM_OPTIONS.find((option) => option.id === post.platform)?.label ?? post.platform
  const Icon = PLATFORM_ICONS[post.platform]
  const gradient = ART_GRADIENTS[index % ART_GRADIENTS.length]

  const copyPost = async () => {
    const value = [post.caption, post.hashtags?.length ? post.hashtags.map((tag) => `#${tag}`).join(' ') : '', post.cta]
      .filter(Boolean)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard access can be unavailable in embedded previews.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <motion.article
      layout
      className="overflow-hidden rounded-[20px] border border-[#dcd3df] bg-[#fffaff] shadow-[0_12px_34px_rgba(46,32,51,0.07)]"
    >
      <div className="flex min-h-14 items-center gap-3 border-b border-[#e5dee7] px-4 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#e8fbcf] text-[11px] font-bold text-[#315016]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">
            {Icon ? <Icon className="size-3.5" /> : null}
            {platformLabel}
          </p>
          <p className="truncate text-xs text-[#918895]">{post.date || 'Scheduled'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={copyPost}
            aria-label={`Copy post ${index + 1}`}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#625b71] transition-colors hover:bg-[#f1eaf3] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button type="button" aria-label={`More options for post ${index + 1}`} className="flex size-9 items-center justify-center rounded-lg text-[#716777] hover:bg-[#f1eaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
            <MoreHorizontal className="size-[18px]" />
          </button>
        </div>
      </div>

      <div className={`grid ${showImage ? 'md:grid-cols-[minmax(210px,0.82fr)_minmax(0,1.18fr)]' : ''}`}>
        {showImage ? (
          <PostArtwork
            gradient={gradient}
            imageUrl={post.imageUrl}
            label={post.visualPrompt || `Campaign visual for ${product}`}
            product={product?.split(' ')[0]}
            platform={platformLabel}
          />
        ) : null}
        <div className="p-5 sm:p-6">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#948a98]" htmlFor={`post-caption-${index}`}>
            Caption
          </label>
          <textarea
            id={`post-caption-${index}`}
            rows={5}
            defaultValue={post.caption}
            onBlur={(event) => onCaptionChange(index, event.target.value)}
            className="w-full resize-none border-0 bg-transparent text-sm leading-[1.65] text-[#514a56] outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#4f378a]/30"
          />
          {post.hashtags?.length ? (
            <input
              readOnly
              value={post.hashtags.map((tag) => `#${tag}`).join(' ')}
              className="mt-3 w-full border-0 bg-transparent text-xs font-medium text-[#4f378a] outline-none"
              aria-label={`Hashtags for post ${index + 1}`}
            />
          ) : null}
          {post.cta ? (
            <p className="mt-3 rounded-lg bg-[#f3edf5] px-3 py-2 text-xs font-semibold text-[#4f378a]">{post.cta}</p>
          ) : null}
          {showImage && post.visualPrompt ? (
            <p className="mt-3 border-t border-[#ece4ee] pt-3 text-[11px] leading-[1.5] text-[#948a98]">
              <span className="font-semibold uppercase tracking-[0.13em]">Visual prompt</span> · {post.visualPrompt}
            </p>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

function StrategySummary({ strategy }) {
  if (!strategy) return null
  return (
    <section className="mb-6 rounded-[20px] border border-[#dcd3df] bg-[#fffaff] p-5 shadow-[0_8px_24px_rgba(46,32,51,0.05)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#e6fbc7] text-[#315016]">
          <Lightbulb className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">Strategy</p>
          <h3 className="font-display text-lg tracking-[-0.3px] text-[#201a25]">Core narrative &amp; pillars</h3>
        </div>
      </div>
      <p className="text-sm leading-[1.65] text-[#514a56]">{strategy.coreNarrative}</p>

      {Array.isArray(strategy.contentPillars) && strategy.contentPillars.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {strategy.contentPillars.map((pillar, index) => (
            <li key={`${pillar.name}-${index}`} className="rounded-xl border border-[#ece4ee] bg-[#f8f3f8] p-3">
              <p className="text-sm font-semibold text-[#201a25]">{pillar.name}</p>
              <p className="mt-1 text-xs leading-[1.55] text-[#746b79]">{pillar.description}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {strategy.tonePerPlatform && Object.keys(strategy.tonePerPlatform).length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(strategy.tonePerPlatform).map(([platform, tone]) => {
            const label = PLATFORM_OPTIONS.find((option) => option.id === platform)?.label ?? platform
            return (
              <span key={platform} className="rounded-full border border-[#e2d9e6] bg-white px-3 py-1 text-[11px] text-[#5d5462]">
                <span className="font-semibold text-[#4f378a]">{label}:</span> {tone}
              </span>
            )
          })}
        </div>
      ) : null}

      {strategy.rationale ? (
        <p className="mt-4 text-xs italic leading-[1.55] text-[#827889]">{strategy.rationale}</p>
      ) : null}
    </section>
  )
}

function QANotes({ notes }) {
  if (!notes || notes.length === 0) return null
  const icons = { info: CircleAlert, warning: AlertTriangle, error: AlertTriangle }
  const colors = {
    info: 'text-[#4f378a] bg-[#f2eafa]',
    warning: 'text-[#b25c00] bg-[#fcefd9]',
    error: 'text-[#ad3150] bg-[#fbe2e8]',
  }
  return (
    <section className="mb-6 rounded-[20px] border border-[#dcd3df] bg-[#fffaff] p-5 shadow-[0_8px_24px_rgba(46,32,51,0.05)] sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#e6fbc7] text-[#315016]">
          <Check className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">QA notes</p>
          <h3 className="font-display text-lg tracking-[-0.3px] text-[#201a25]">Editor review</h3>
        </div>
      </div>
      <ul className="space-y-2">
        {notes.map((note, index) => {
          const Icon = icons[note.severity] ?? CircleAlert
          return (
            <li key={index} className="flex items-start gap-2.5 rounded-xl bg-[#f8f3f8] p-3">
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${colors[note.severity] ?? colors.info}`}>
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-[#514a56]">
                  {String(note.message)}
                  {note.postId ? <span className="ml-1 text-xs text-[#948a98]">· {note.postId}</span> : null}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-[#948a98]">
                  {note.severity} · {note.resolved ? 'resolved' : 'open'}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function WorkflowProgress({ runState, generateImages }) {
  const completed = new Set(runState?.completedSteps ?? [])
  const active = new Set(runState?.activeSteps ?? [])
  const visibleSteps = WORKFLOW_STEPS.filter((step) => step.optional !== 'images' || generateImages)
  const activeLabels = visibleSteps
    .filter((step) => active.has(step.id))
    .map((step) => step.label)

  return (
    <section className="campaign-pulse rounded-[20px] border border-[#d9cfe0] bg-[#fffaff] p-5 shadow-[0_8px_24px_rgba(46,32,51,0.05)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#381e72] text-[#d8ff9d]">
          <Loader2 className="size-4 animate-spin" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#201a25]">
            {activeLabels.length > 0 ? activeLabels.join(' + ') : 'Starting campaign workflow'}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-[#746b79]">
            You can keep this page open while the agents work. The status below comes directly from the workflow.
          </p>
        </div>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {visibleSteps.map((step) => {
          const isComplete = completed.has(step.id)
          const isActive = active.has(step.id)
          return (
            <li
              key={step.id}
              className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                isComplete
                  ? 'border-[#cfe6ad] bg-[#eff9df] text-[#315016]'
                  : isActive
                    ? 'border-[#b9a4d2] bg-[#f2eafa] text-[#381e72]'
                    : 'border-[#e5dee7] bg-[#faf6fa] text-[#8b818f]'
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/80">
                {isComplete ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : isActive ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-35" />
                )}
              </span>
              {step.label}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#eccfd5] bg-[#fbe9ee] px-4 py-3 text-sm text-[#8a2440]">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Campaign generation failed</p>
        <p className="mt-0.5 break-words text-[#a1385a]">{String(message)}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-2 py-0.5 text-xs font-semibold text-[#8a2440] hover:bg-[#f4d2da]"
      >
        Dismiss
      </button>
    </div>
  )
}

function ResultsPanel({ campaign, setCampaign, values, isGenerating, runState, projectName, error, onDismissError }) {
  const selectedPlatforms = PLATFORM_OPTIONS.filter((platform) => values.platforms.includes(platform.id))

  const updateCaption = (index, value) => {
    setCampaign((current) => {
      if (!current) return current
      const calendar = current.calendar.map((entry, idx) => (idx === index ? { ...entry, caption: value } : entry))
      return { ...current, calendar }
    })
  }

  const hasResults = Boolean(campaign)
  const totalPosts = campaign?.calendar?.length ?? 0

  return (
    <main className="min-w-0 flex-1 bg-[#f8f3f8] lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto" id="generated-results">
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-7 lg:px-8 lg:py-8 xl:px-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#776e7d]">
              <span>{projectName}</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-[#4f378a]">Campaign generation</span>
            </div>
            <h2 className="font-display text-[34px] leading-none tracking-[-0.75px] text-[#201a25] sm:text-[40px]">
              {hasResults ? 'Your campaign, ready to shape.' : 'Your campaign will appear here.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716777]">
              {hasResults
                ? 'Edit captions in place, copy what works, and keep every iteration in this project.'
                : 'Fill the brief and run the workflow to research, write, and schedule your posts.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex -space-x-1.5" aria-label={`Selected platforms: ${selectedPlatforms.map((platform) => platform.label).join(', ')}`}>
              {selectedPlatforms.map(({ id, label }) => {
                const Icon = PLATFORM_ICONS[id]
                return (
                  <span key={id} title={label} className="flex size-8 items-center justify-center rounded-full border-2 border-[#f8f3f8] bg-white text-[#4f378a] shadow-sm">
                    {Icon ? <Icon className="size-3.5" /> : null}
                  </span>
                )
              })}
            </div>
            <span className="rounded-full border border-[#d9d0dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5462]">{totalPosts} posts</span>
          </div>
        </div>

        {error ? <ErrorBanner message={error} onDismiss={onDismissError} /> : null}

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" aria-live="polite" aria-label="Generating campaign posts">
              <WorkflowProgress runState={runState} generateImages={values.generateImages} />
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
                <div key={item} className="h-72 animate-pulse overflow-hidden rounded-[20px] border border-[#dfd6e1] bg-[#fffaff] p-6">
                  <div className="h-3 w-24 rounded bg-[#e7dfe9]" />
                  <div className="mt-12 h-7 w-3/5 rounded bg-[#e7dfe9]" />
                  <div className="mt-5 h-3 w-full rounded bg-[#eee7ef]" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-[#eee7ef]" />
                </div>
              ))}
            </motion.div>
          ) : hasResults ? (
            <motion.div key="results" className="space-y-5" aria-live="polite">
              <StrategySummary strategy={campaign?.strategy} />
              <QANotes notes={campaign?.notes ?? []} />
              {(campaign?.calendar ?? []).map((entry, index) => (
                <PostCard
                  key={`${entry.platform}-${index}`}
                  post={entry}
                  index={index}
                  showImage={values.generateImages}
                  product={values.product}
                  onCaptionChange={updateCaption}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#c8bcd0] bg-[#fffaff]/70 px-6 py-20 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f3edf5] text-[#4f378a]">
                <Sparkles className="size-6" />
              </span>
              <p className="mt-4 font-display text-xl tracking-[-0.3px] text-[#201a25]">No campaign yet</p>
              <p className="mt-1 max-w-md text-sm text-[#746b79]">Complete the brief and click Generate to run the full workflow — research, strategy, copywriting, visuals, hashtags, QA, and scheduling.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function fieldErrorsFromZod(issue) {
  const paths = issue.path.filter(Boolean)
  const key = paths[0]
  if (!key) return { _form: issue.message }
  return { [key]: issue.message }
}

export function GeneratePage() {
  const [projects, setProjects] = useState(initialProjects)
  const [activeProject, setActiveProject] = useState(1)
  const [campaign, setCampaign] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState(EMPTY_VALUES)
  const [submittedBrief, setSubmittedBrief] = useState(null)
  const [runState, setRunState] = useState(null)
  const [activeRunId, setActiveRunId] = useState('')
  const abortRef = useRef(null)

  const currentProject = projects.find((project) => project.id === activeProject) ?? projects[0]

  useEffect(() => () => abortRef.current?.abort(), [])

  const handleNewProject = () => {
    const nextId = Math.max(...projects.map((project) => project.id)) + 1
    const project = { id: nextId, name: `Untitled Project ${nextId - 2}`, meta: 'New project', color: '#ffd36e' }
    setProjects((current) => [project, ...current])
    setActiveProject(nextId)
    setValues({ ...EMPTY_VALUES })
    setCampaign(null)
    setSubmittedBrief(null)
    setRunState(null)
    setError('')
    window.setTimeout(() => document.querySelector('#product')?.focus(), 50)
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    if (isGenerating) return

    setError('')
    setErrors({})

    const brief = buildBrief(values)
    const parsed = campaignBriefSchema.safeParse(brief)
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.reduce((acc, issue) => ({ ...acc, ...fieldErrorsFromZod(issue) }), {})
      setErrors(fieldErrors)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsGenerating(true)
    setCampaign(null)
    setSubmittedBrief(parsed.data)
    setRunState({
      status: 'running',
      activeSteps: [],
      completedSteps: [],
    })
    try {
      const { runId } = await startCampaign(parsed.data, { signal: controller.signal })
      setActiveRunId(runId)

      const finalState = await waitForCampaign(runId, {
        signal: controller.signal,
        intervalMs: 1500,
        maxAttempts: 600,
        onTick: (state) => setRunState(state),
      })

      setRunState(finalState)

      if (finalState.status === 'failed') {
        const raw = finalState.error
        setError(typeof raw === 'string' ? raw : raw?.message || 'The workflow failed to complete.')
      } else if (finalState.status === 'canceled') {
        setError('')
      } else if (finalState.result) {
        const parsedResult = campaignOutputSchema.safeParse(finalState.result)
        if (!parsedResult.success) {
          throw new Error('The workflow completed, but its response did not match the campaign result schema.')
        }
        setCampaign(parsedResult.data)
        setProjects((current) =>
          current.map((project) =>
            project.id === activeProject ? { ...project, meta: `${parsedResult.data.calendar.length} posts` } : project,
          ),
        )
      } else {
        throw new Error('The workflow completed without returning a campaign.')
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong while generating the campaign.')
    } finally {
      setIsGenerating(false)
      setActiveRunId('')
    }
  }

  const handleCancel = async () => {
    const runId = activeRunId
    if (runId) {
      try {
        const state = await cancelCampaign(runId)
        setRunState(state)
      } catch (err) {
        setError(typeof err?.message === 'string' ? err.message : 'Could not cancel the campaign workflow.')
      }
    }
    abortRef.current?.abort()
    setIsGenerating(false)
    setActiveRunId('')
  }

  const effectiveError = error
  const resultValues = submittedBrief ?? values

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-[#f8f3f8] text-[#201a25]">
      <AppHeader />
      <div className="border-b border-[#ded7e3] bg-[#f6f0f7] px-4 py-2.5 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: currentProject.color }} />
          <span className="truncate text-sm font-semibold">{currentProject.name}</span>
          <button type="button" onClick={handleNewProject} className="ml-auto flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-[#4f378a] ring-1 ring-[#ded7e3]">
            <Plus className="size-3.5" /> New project
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ProjectSidebar projects={projects} activeProject={activeProject} onSelect={setActiveProject} onNewProject={handleNewProject} />
        <CampaignForm
          values={values}
          setValues={setValues}
          errors={errors}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <ResultsPanel
          campaign={campaign}
          setCampaign={setCampaign}
          values={resultValues}
          isGenerating={isGenerating}
          runState={runState}
          projectName={currentProject.name}
          error={effectiveError}
          onDismissError={() => setError('')}
        />
      </div>
      {isGenerating ? (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#381e72] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <Loader2 className="size-3.5 animate-spin text-[#d8ff9d]" />
          Running workflow…
          <button type="button" onClick={handleCancel} className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] hover:bg-white/25">
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  )
}
