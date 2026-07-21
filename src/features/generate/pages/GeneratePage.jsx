import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  AtSign,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

const initialPosts = [
  {
    id: 1,
    eyebrow: 'POST 01',
    headline: 'Your morning ritual, reimagined.',
    content:
      'Meet Ember — the ceramic mug that keeps every sip at your perfect temperature. Thoughtful design, effortless warmth, and no more forgotten cold coffee.\n\nA small upgrade for the part of your day that matters most.',
    tags: '#MorningRitual #ProductDesign #MadeForYou',
    imageLabel: 'A warm product scene for Ember smart mug',
    art: 'from-[#f2d8b8] via-[#e7b58d] to-[#7c482e]',
  },
  {
    id: 2,
    eyebrow: 'POST 02',
    headline: 'Good ideas deserve warm coffee.',
    content:
      'Deep work has a rhythm. Ember keeps up — holding your drink at exactly the temperature you choose while you focus on the work in front of you.\n\nSet it once. Sip when you are ready.',
    tags: '#CreativeWork #SmartHome #StayInFlow',
    imageLabel: 'Ember mug beside a notebook in a creative studio',
    art: 'from-[#d8d0ea] via-[#8a769f] to-[#34263f]',
  },
  {
    id: 3,
    eyebrow: 'POST 03',
    headline: 'Some gifts say: I really know you.',
    content:
      'For the early riser, the late-night thinker, and everyone who has reheated the same cup three times. Give them a better everyday ritual with Ember.',
    tags: '#GiftIdeas #EverydayBetter #Ember',
    imageLabel: 'Gift-ready Ember mug with soft paper textures',
    art: 'from-[#f0b8c6] via-[#b95770] to-[#522232]',
  },
]

const tones = ['Warm', 'Bold', 'Playful', 'Professional']
const platformOptions = [
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'linkedin', label: 'LinkedIn', icon: BriefcaseBusiness },
  { id: 'facebook', label: 'Facebook', icon: Users },
  { id: 'twitter', label: 'X / Twitter', icon: AtSign },
]

function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[11px] bg-[#381e72] text-white shadow-[0_5px_14px_rgba(56,30,114,0.25)]">
      <span className="absolute -right-1 -top-2 size-5 rounded-full bg-[#b7f36b]" />
      <Sparkles className="relative size-[18px]" strokeWidth={2.2} />
    </span>
  )
}

function AppHeader() {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-[#ded7e3] bg-[#fffaff]/95 px-4 backdrop-blur-xl sm:px-6">
      <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="AetherFlow home">
        <BrandMark />
        <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
          AetherFlow <span className="font-normal text-[#6a6170]">AI</span>
        </span>
      </Link>

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
        onClick={() => document.querySelector('#campaign-name')?.focus()}
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

function CampaignForm({ values, setValues, onGenerate, isGenerating }) {
  const togglePlatform = (id) => {
    setValues((current) => ({
      ...current,
      platforms: current.platforms.includes(id)
        ? current.platforms.filter((platform) => platform !== id)
        : [...current.platforms, id],
    }))
  }

  return (
    <section className="w-full shrink-0 border-b border-[#ded7e3] bg-[#fffaff] lg:w-[374px] lg:border-b-0 lg:border-r">
      <form className="mx-auto flex max-w-xl flex-col px-5 py-6 sm:px-7 lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto" onSubmit={onGenerate}>
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[#4f378a]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#4f378a]">Campaign brief</span>
          </div>
          <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.8px] text-[#201a25]">What are we creating?</h1>
          <p className="mt-2 text-sm leading-5 text-[#746b79]">Give the creative team a clear direction. You can refine every post after generation.</p>
        </div>

        <div>
          <FieldLabel htmlFor="campaign-name">Product or campaign</FieldLabel>
          <input
            id="campaign-name"
            required
            value={values.campaign}
            onChange={(event) => setValues((current) => ({ ...current, campaign: event.target.value }))}
            placeholder="e.g. Ember Smart Mug"
            className="h-12 w-full rounded-xl border border-[#d8cfdc] bg-white px-3.5 text-[15px] text-[#201a25] shadow-[0_1px_2px_rgba(29,27,32,0.03)] outline-none transition placeholder:text-[#aaa1ae] focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
          />
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="audience">Audience</FieldLabel>
          <div className="relative">
            <select
              id="audience"
              value={values.audience}
              onChange={(event) => setValues((current) => ({ ...current, audience: event.target.value }))}
              className="h-12 w-full appearance-none rounded-xl border border-[#d8cfdc] bg-white px-3.5 pr-10 text-[15px] text-[#201a25] outline-none transition focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
            >
              <option>Creative professionals, 25–40</option>
              <option>Busy founders and entrepreneurs</option>
              <option>Gen Z lifestyle shoppers</option>
              <option>Enterprise marketing teams</option>
              <option>Eco-conscious consumers</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#776e7d]" />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">Tone of voice</legend>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((tone) => (
              <button
                key={tone}
                type="button"
                aria-pressed={values.tone === tone}
                onClick={() => setValues((current) => ({ ...current, tone }))}
                className={`h-10 rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                  values.tone === tone
                    ? 'border-[#4f378a] bg-[#eee5f8] text-[#381e72] shadow-[inset_0_0_0_1px_#4f378a]'
                    : 'border-[#dcd4df] bg-white text-[#665d6b] hover:border-[#a99db0] hover:text-[#201a25]'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex gap-3">
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="post-count">Number of posts</FieldLabel>
            <div className="flex h-12 items-center rounded-xl border border-[#d8cfdc] bg-white p-1">
              <button
                type="button"
                aria-label="Decrease post count"
                onClick={() => setValues((current) => ({ ...current, count: Math.max(1, current.count - 1) }))}
                disabled={values.count === 1}
                className="flex size-9 items-center justify-center rounded-lg text-lg text-[#625b71] hover:bg-[#f3edf5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <input id="post-count" readOnly value={values.count} className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-[#201a25] outline-none" />
              <button
                type="button"
                aria-label="Increase post count"
                onClick={() => setValues((current) => ({ ...current, count: Math.min(6, current.count + 1) }))}
                disabled={values.count === 6}
                className="flex size-9 items-center justify-center rounded-lg text-lg text-[#625b71] hover:bg-[#f3edf5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <FieldLabel htmlFor="include-images">Post images</FieldLabel>
            <button
              id="include-images"
              type="button"
              role="switch"
              aria-checked={values.images}
              onClick={() => setValues((current) => ({ ...current, images: !current.images }))}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#d8cfdc] bg-white px-3 text-sm font-medium text-[#514a56] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            >
              <span className="flex items-center gap-2"><ImageIcon className="size-4 text-[#4f378a]" /> {values.images ? 'Included' : 'Off'}</span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${values.images ? 'bg-[#4f378a]' : 'bg-[#cfc6d2]'}`}>
                <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${values.images ? 'left-6' : 'left-1'}`} />
              </span>
            </button>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5f5664]">Publish on</legend>
          <div className="grid grid-cols-2 gap-2">
            {platformOptions.map(({ id, label, icon: Icon }) => {
              const selected = values.platforms.includes(id)
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
                  <Icon className="size-4" />
                  <span>{label}</span>
                  {selected ? <Check className="ml-auto size-3.5" strokeWidth={2.5} /> : null}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-7 border-t border-[#e3dce5] pt-5">
          <button
            type="submit"
            disabled={isGenerating || !values.campaign.trim() || values.platforms.length === 0}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
          >
            <span className="absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-96" />
            {isGenerating ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Wand2 className="size-[17px] text-[#d8ff9d]" />}
            {isGenerating ? 'Building your campaign…' : `Generate ${values.count} posts`}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">Uses approximately {values.count * 180} words · Auto-saved to project</p>
        </div>
      </form>
    </section>
  )
}

function PostArtwork({ className, label, product }) {
  return (
    <div role="img" aria-label={label} className={`relative min-h-48 overflow-hidden bg-gradient-to-br ${className}`}>
      <div className="absolute -right-8 -top-8 size-36 rounded-full border border-white/35 bg-white/10" />
      <div className="absolute bottom-[-52px] left-[-38px] size-44 rounded-full bg-[#201a25]/20 blur-sm" />
      <div className="absolute inset-x-6 bottom-5 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Made for your moment</span>
          <span className="font-display text-3xl leading-none tracking-tight text-white drop-shadow-sm">{product || 'Ember'}</span>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full border border-white/35 bg-white/15 backdrop-blur-md">
          <Sparkles className="size-5 text-white" />
        </span>
      </div>
    </div>
  )
}

function PostCard({ post, index, showImage, product, onChange }) {
  const [copied, setCopied] = useState(false)

  const copyPost = async () => {
    const value = `${post.headline}\n\n${post.content}\n\n${post.tags}`
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
        <span className="flex size-7 items-center justify-center rounded-full bg-[#e8fbcf] text-[11px] font-bold text-[#315016]">{String(index + 1).padStart(2, '0')}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">{post.eyebrow}</p>
          <p className="truncate text-xs text-[#918895]">Ready for review</p>
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
        {showImage ? <PostArtwork className={post.art} label={post.imageLabel} product={product.split(' ')[0]} /> : null}
        <div className="p-5 sm:p-6">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#948a98]" htmlFor={`post-headline-${post.id}`}>Headline</label>
          <input
            id={`post-headline-${post.id}`}
            value={post.headline}
            onChange={(event) => onChange(post.id, 'headline', event.target.value)}
            className="w-full border-0 bg-transparent font-display text-[27px] leading-[1.1] tracking-[-0.45px] text-[#201a25] outline-none placeholder:text-[#aaa1ae] focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#4f378a]/30"
          />
          <div className="my-4 h-px bg-[#e9e1eb]" />
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#948a98]" htmlFor={`post-content-${post.id}`}>Post content</label>
          <textarea
            id={`post-content-${post.id}`}
            rows={5}
            value={post.content}
            onChange={(event) => onChange(post.id, 'content', event.target.value)}
            className="w-full resize-none border-0 bg-transparent text-sm leading-[1.65] text-[#514a56] outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#4f378a]/30"
          />
          <input
            aria-label={`Hashtags for post ${index + 1}`}
            value={post.tags}
            onChange={(event) => onChange(post.id, 'tags', event.target.value)}
            className="mt-3 w-full border-0 bg-transparent text-xs font-medium text-[#4f378a] outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#4f378a]/30"
          />
        </div>
      </div>
    </motion.article>
  )
}

function ResultsPanel({ posts, setPosts, values, isGenerating, projectName }) {
  const selectedPlatforms = platformOptions.filter((platform) => values.platforms.includes(platform.id))

  const updatePost = (id, field, value) => {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, [field]: value } : post)))
  }

  const addPost = () => {
    setPosts((current) => {
      const index = current.length
      const template = initialPosts[index % initialPosts.length]
      return [
        ...current,
        {
          ...template,
          id: Date.now(),
          eyebrow: `POST ${String(index + 1).padStart(2, '0')}`,
          headline: `One more way ${values.campaign} fits your day.`,
          imageLabel: `Additional campaign visual for ${values.campaign}`,
        },
      ]
    })
  }

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
            <h2 className="font-display text-[34px] leading-none tracking-[-0.75px] text-[#201a25] sm:text-[40px]">Your campaign, ready to shape.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716777]">Edit in place, copy what works, and keep every iteration in this project.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex -space-x-1.5" aria-label={`Selected platforms: ${selectedPlatforms.map((platform) => platform.label).join(', ')}`}>
              {selectedPlatforms.map(({ id, icon: Icon }) => (
                <span key={id} className="flex size-8 items-center justify-center rounded-full border-2 border-[#f8f3f8] bg-white text-[#4f378a] shadow-sm">
                  <Icon className="size-3.5" />
                </span>
              ))}
            </div>
            <span className="rounded-full border border-[#d9d0dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5462]">{posts.length} posts</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" aria-live="polite" aria-label="Generating campaign posts">
              {[0, 1, 2].map((item) => (
                <div key={item} className="campaign-pulse h-72 animate-pulse overflow-hidden rounded-[20px] border border-[#dfd6e1] bg-[#fffaff] p-6">
                  <div className="h-3 w-24 rounded bg-[#e7dfe9]" />
                  <div className="mt-12 h-7 w-3/5 rounded bg-[#e7dfe9]" />
                  <div className="mt-5 h-3 w-full rounded bg-[#eee7ef]" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-[#eee7ef]" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="results" className="space-y-5" aria-live="polite">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} showImage={values.images} product={values.campaign} onChange={updatePost} />
              ))}
              <button
                type="button"
                onClick={addPost}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b9adbe] bg-white/45 text-sm font-semibold text-[#4f378a] transition-colors hover:border-[#4f378a] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
              >
                <Plus className="size-4" /> Add another post
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

export function GeneratePage() {
  const [projects, setProjects] = useState(initialProjects)
  const [activeProject, setActiveProject] = useState(1)
  const [posts, setPosts] = useState(initialPosts)
  const [isGenerating, setIsGenerating] = useState(false)
  const [values, setValues] = useState({
    campaign: 'Ember Smart Mug',
    audience: 'Creative professionals, 25–40',
    tone: 'Warm',
    count: 3,
    images: true,
    platforms: ['instagram', 'linkedin'],
  })

  const currentProject = projects.find((project) => project.id === activeProject) ?? projects[0]

  const handleNewProject = () => {
    const nextId = Math.max(...projects.map((project) => project.id)) + 1
    const project = { id: nextId, name: `Untitled Project ${nextId - 2}`, meta: 'New project', color: '#ffd36e' }
    setProjects((current) => [project, ...current])
    setActiveProject(nextId)
    setValues((current) => ({ ...current, campaign: '' }))
    window.setTimeout(() => document.querySelector('#campaign-name')?.focus(), 50)
  }

  const handleGenerate = (event) => {
    event.preventDefault()
    if (!values.campaign.trim() || values.platforms.length === 0) return

    setIsGenerating(true)
    window.setTimeout(() => {
      const base = initialPosts.map((post, index) => ({
        ...post,
        id: Date.now() + index,
        eyebrow: `POST ${String(index + 1).padStart(2, '0')}`,
        headline:
          index === 0
            ? `${values.campaign}, made for your everyday.`
            : index === 1
              ? `A better ritual starts with ${values.campaign}.`
              : `Meet the detail your day was missing.`,
        content: `${values.campaign} was designed for ${values.audience.toLowerCase()}. This ${values.tone.toLowerCase()} campaign idea turns one thoughtful product benefit into a moment people can see themselves in.\n\nSimple, useful, and ready to become part of the day.`,
        tags: `#${values.campaign.replace(/[^a-zA-Z0-9]/g, '')} #${values.tone}Campaign #MadeForYou`,
        imageLabel: `Generated ${values.tone.toLowerCase()} campaign visual for ${values.campaign}`,
      }))

      const generated = Array.from({ length: values.count }, (_, index) => ({
        ...(base[index % base.length]),
        id: Date.now() + index,
        eyebrow: `POST ${String(index + 1).padStart(2, '0')}`,
      }))
      setPosts(generated)
      setProjects((current) => current.map((project) => (project.id === activeProject ? { ...project, meta: `${values.count + 1} conversations` } : project)))
      setIsGenerating(false)
    }, 850)
  }

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
        <CampaignForm values={values} setValues={setValues} onGenerate={handleGenerate} isGenerating={isGenerating} />
        <ResultsPanel posts={posts} setPosts={setPosts} values={values} isGenerating={isGenerating} projectName={currentProject.name} />
      </div>
    </div>
  )
}
