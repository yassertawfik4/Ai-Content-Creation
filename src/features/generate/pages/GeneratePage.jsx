import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  AtSign,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Folder,
  HelpCircle,
  History,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Video,
  Wand2,
  X,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  campaignOutputSchema,
  marketingStrategyInputSchema,
  marketingStrategyOutputSchema,
  BRAND_VOICE_PRESETS,
  CAMPAIGN_GOAL_OPTIONS,
  DURATION_OPTIONS,
  PLATFORM_OPTIONS,
} from '../schema/campaignSchema'
import {
  createChat,
  createProject,
  deleteChat,
  deleteProject,
  getChatHistory,
  listChats,
  listProjects,
  renameProject,
  startContent,
  startStrategy,
  subscribeToWorkflow,
  waitForContent,
  waitForStrategy,
} from '@/lib/campaignApi'

const PLATFORM_ICONS = {
  instagram: Camera,
  x: AtSign,
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
  { id: 'research', eventIds: ['build-brief', 'content-research'], label: 'Research', description: 'Builds the content brief and gathers current audience and trend signals.' },
  { id: 'strategize', eventIds: ['content-strategy'], label: 'Strategy', description: 'Turns the research into a narrative, pillars, and platform direction.' },
  { id: 'generate-content', eventIds: ['generate-content'], label: 'Copywriting', description: 'Writes the campaign posts for each selected platform.' },
  { id: 'generate-visuals', eventIds: ['generate-visuals'], label: 'Visual direction', description: 'Creates a complete visual prompt for every post.' },
  { id: 'generate-images', eventIds: ['generate-visuals'], label: 'Image generation', optional: 'images', description: 'Renders an image asset from each approved visual direction.' },
  { id: 'generate-hashtags', eventIds: ['generate-hashtags'], label: 'Hashtags & SEO', description: 'Adds platform-aware hashtags and search keywords.' },
  { id: 'qa', eventIds: ['content-preflight', 'qa-review', 'content-approval'], label: 'Editor QA', description: 'Checks claims, platform rules, and editorial quality.' },
  { id: 'schedule', eventIds: ['schedule', 'claim-audit'], label: 'Calendar', description: 'Schedules the posts and completes the final claim audit.' },
]

const STRATEGY_STEPS = [
  { id: 'intake-gate', label: 'Brief validation', description: 'Checks that the campaign brief has enough context to begin.' },
  { id: 'product-analysis', label: 'Product analysis', description: 'Finds the clearest value proposition and product strengths.' },
  { id: 'stp-research', label: 'Market research', description: 'Collects current evidence about the market and audience.' },
  { id: 'stp-strategy', label: 'Positioning', description: 'Defines the target segment and market position.' },
  { id: 'buyer-persona', label: 'Buyer personas', description: 'Builds the primary buyer profiles for the campaign.' },
  { id: 'buyer-journey', label: 'Buyer journey', description: 'Maps audience needs and messages across the journey.' },
  { id: 'smart-objectives', label: 'SMART objectives', description: 'Sets measurable campaign goals and success criteria.' },
  { id: 'campaign-planner', label: 'Campaign plan', description: 'Combines every strategy decision into an actionable plan.' },
  { id: 'quality-gate', label: 'Quality check', description: 'Audits the plan for evidence, gaps, and assumptions.' },
]

const EMPTY_PROJECT = { id: '', name: 'Campaign workspace', color: '#d0bcff', historyCount: 0 }

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
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileMenuRef = useRef(null)
  const profileButtonRef = useRef(null)

  useEffect(() => {
    if (!profileMenuOpen) return undefined

    const closeOnOutsidePress = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setProfileMenuOpen(false)
      profileButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileMenuOpen])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await logout()
    navigate('/')
  }

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
        <div ref={profileMenuRef} className="relative ml-1">
          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => setProfileMenuOpen((current) => !current)}
            className="flex h-11 items-center gap-1 rounded-xl px-1 text-[#625b71] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            aria-controls="account-menu"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e3d5f7] text-xs font-bold text-[#381e72] ring-1 ring-[#cbb9e3]">
              {initials || 'A'}
            </span>
            <ChevronDown className={`size-3.5 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          <AnimatePresence>
            {profileMenuOpen ? (
              <motion.div
                id="account-menu"
                role="menu"
                aria-label="Account menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 top-[calc(100%+7px)] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-[#ded7e3] bg-[#fffaff] p-2 shadow-[0_16px_40px_rgba(45,31,52,0.16)]"
              >
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-[#201a25]">{user?.name || 'AetherFlow user'}</p>
                  {user?.email ? <p className="mt-0.5 truncate text-xs text-[#7b7180]">{user.email}</p> : null}
                </div>
                <div className="my-1 h-px bg-[#e7dfe9]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-[#9f2949] transition-colors hover:bg-[#fbe9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoggingOut ? <Loader2 className="size-[17px] animate-spin" /> : <LogOut className="size-[17px]" />}
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function ProjectSidebar({
  projects,
  activeProject,
  chats,
  activeChat,
  onSelect,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenHistory,
  historyOpen,
  isOpen,
  onToggle,
}) {
  const [collapsedProjectId, setCollapsedProjectId] = useState('')
  const [editingProjectId, setEditingProjectId] = useState('')
  const [projectNameDraft, setProjectNameDraft] = useState('')
  const cancelRenameRef = useRef(false)

  const selectProject = (project) => {
    setCollapsedProjectId('')
    onSelect(project.id)
  }

  const toggleProject = (project) => {
    if (project.id !== activeProject) {
      selectProject(project)
      return
    }
    setCollapsedProjectId((current) => current === project.id ? '' : project.id)
  }

  const beginRename = (project) => {
    cancelRenameRef.current = false
    setProjectNameDraft(project.name)
    setEditingProjectId(project.id)
  }

  const commitRename = async (project) => {
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false
      return
    }
    const nextName = projectNameDraft.trim()
    setEditingProjectId('')
    if (!nextName || nextName === project.name) return
    const renamed = await onRenameProject(project, nextName)
    if (renamed === false) {
      setEditingProjectId(project.id)
    }
  }

  if (!isOpen) {
    return (
      <aside className="hidden w-[52px] shrink-0 flex-col items-center border-r border-[#ded7e3] bg-[#f6f0f7] pt-2 lg:flex">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Open projects sidebar"
          title="Open projects sidebar"
          className="flex size-11 items-center justify-center rounded-xl text-[#625b71] transition-colors hover:bg-white hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <PanelLeftOpen className="size-[18px]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="hidden w-[244px] shrink-0 flex-col border-r border-[#ded7e3] bg-[#f6f0f7] p-3 lg:flex">
      <div className="flex h-11 items-center justify-end">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close projects sidebar"
          title="Close projects sidebar"
          className="flex size-11 items-center justify-center rounded-xl text-[#625b71] transition-colors hover:bg-white hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <PanelLeftClose className="size-[18px]" />
        </button>
      </div>

      <nav className="mt-1 space-y-1" aria-label="Workspace navigation">
        <button className="flex h-10 w-full items-center gap-3 rounded-xl bg-white/70 px-3 text-sm font-medium text-[#381e72] ring-1 ring-[#e2d9e6]" type="button">
          <Folder className="size-[18px]" /> Projects
        </button>
        <button onClick={onOpenHistory} className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors ${historyOpen ? 'bg-white text-[#381e72] ring-1 ring-[#e2d9e6]' : 'text-[#625b71] hover:bg-white/70 hover:text-[#201a25]'}`} type="button">
          <History className="size-[18px]" /> Chat history
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

      <div className="mt-1.5 min-h-0 flex-1 space-y-2 overflow-y-auto px-0.5 pb-3">
        {projects.map((project) => {
          const isActive = project.id === activeProject
          const isExpanded = isActive && collapsedProjectId !== project.id
          const chatLabel = project.chatCount === 1 ? '1 chat' : project.chatCount ? `${project.chatCount} chats` : 'No chats yet'
          return (
            <div key={project.id} className="group/project">
              <div className={`relative flex min-h-[60px] items-center rounded-xl transition-all ${isActive ? 'bg-white shadow-[0_2px_12px_rgba(37,24,44,0.07)] ring-1 ring-[#e0d7e4]' : 'hover:bg-white/60'}`}>
                <button
                  type="button"
                  onClick={() => toggleProject(project)}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${project.name}`}
                  aria-expanded={isExpanded}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#817687] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                >
                  <ChevronRight className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#4f378a]' : ''}`} />
                </button>

                {editingProjectId === project.id ? (
                  <div className="min-w-0 flex-1 py-2 pr-[66px]">
                    <input
                      autoFocus
                      value={projectNameDraft}
                      onChange={(event) => setProjectNameDraft(event.target.value)}
                      onFocus={(event) => event.currentTarget.select()}
                      onBlur={() => void commitRename(project)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                        if (event.key === 'Escape') {
                          cancelRenameRef.current = true
                          setEditingProjectId('')
                          event.currentTarget.blur()
                        }
                      }}
                      maxLength={80}
                      aria-label={`New name for ${project.name}`}
                      className="h-8 w-full rounded-md border border-[#8e70b2] bg-[#faf6ff] px-2 text-sm font-semibold text-[#201a25] outline-none ring-2 ring-[#ddd0ef] selection:bg-[#d9c8f4]"
                    />
                    <span className="mt-0.5 block text-[10px] text-[#89808e]">Enter to save · Esc to cancel</span>
                  </div>
                ) : (
                  <button type="button" onClick={() => selectProject(project)} className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-[66px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                    <span className="size-2.5 shrink-0 rounded-full ring-4 ring-white" style={{ backgroundColor: project.color }} />
                    <span className="min-w-0">
                      <span className={`block truncate text-sm ${isActive ? 'font-semibold text-[#201a25]' : 'font-medium text-[#514a56]'}`} title={project.name}>
                        {project.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#89808e]">{chatLabel}</span>
                    </span>
                  </button>
                )}

                <div className={`absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover/project:opacity-100 group-focus-within/project:opacity-100'}`}>
                  <button type="button" onClick={() => beginRename(project)} aria-label={`Rename ${project.name}`} title="Rename project" className="flex size-8 items-center justify-center rounded-lg text-[#786e7e] hover:bg-[#f2eafa] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"><Pencil className="size-3.5" /></button>
                  <button type="button" onClick={() => onDeleteProject(project)} aria-label={`Delete ${project.name}`} title="Delete project" className="flex size-8 items-center justify-center rounded-lg text-[#9b6573] hover:bg-[#fbe2e8] hover:text-[#ad3150] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150]"><Trash2 className="size-3.5" /></button>
                </div>
              </div>

              {isExpanded ? (
                <div className="ml-[21px] mt-1.5 border-l border-[#d8ccdf] pl-2">
                  <div className="flex min-h-10 items-center justify-between px-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8a7f90]">Chats</p>
                    <button type="button" onClick={onNewChat} aria-label={`Create chat in ${project.name}`} title="Create new chat" className="flex size-10 items-center justify-center rounded-lg text-[#625b71] transition-colors hover:bg-white hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"><Plus className="size-4" /></button>
                  </div>
                  <div className="space-y-1 pb-1">
                    {chats.map((chat) => {
                      const selected = chat.id === activeChat
                      return (
                        <div key={chat.id} className={`group/chat relative rounded-xl transition ${selected ? 'bg-[#381e72] text-white shadow-[0_6px_16px_rgba(56,30,114,0.2)]' : 'text-[#625b71] hover:bg-white/75 hover:text-[#201a25]'}`}>
                          <button type="button" onClick={() => onSelectChat(chat.id)} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 pr-14 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                            <MessageSquare className={`size-4 shrink-0 ${selected ? 'text-[#d8ff9d]' : 'text-[#8d7c98]'}`} />
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold" title={chat.title}>{chat.title}</span>
                          </button>
                          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                            {chat.historyCount ? <span className={`mr-0.5 text-[10px] transition-opacity group-hover/chat:opacity-0 ${selected ? 'text-white/60' : 'text-[#9a909e]'}`}>{chat.historyCount}</span> : null}
                            <button type="button" onClick={() => onDeleteChat(chat)} aria-label={`Delete ${chat.title}`} title="Delete chat" className={`flex size-8 items-center justify-center rounded-lg opacity-0 transition group-hover/chat:opacity-100 group-focus-within/chat:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 ${selected ? 'text-white/70 hover:bg-white/15 hover:text-white focus-visible:ring-white/70' : 'text-[#9b6573] hover:bg-[#fbe2e8] hover:text-[#ad3150] focus-visible:ring-[#ad3150]'}`}>
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
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
  industry: '',
  businessType: '',
  pricing: '',
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

const GENERATE_STORAGE_KEY = 'aetherflow.generate.workspace.v1'

function readGenerateState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(GENERATE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function mergeStoredValues(storedValues) {
  if (!storedValues || typeof storedValues !== 'object') return EMPTY_VALUES
  const platforms = Array.isArray(storedValues.platforms)
    ? storedValues.platforms.map((platform) => (platform === 'twitter' ? 'x' : platform))
    : EMPTY_VALUES.platforms
  return { ...EMPTY_VALUES, ...storedValues, platforms }
}

const STRATEGY_GOALS = {
  awareness: 'awareness',
  launch: 'awareness',
  engagement: 'balanced',
  conversion: 'conversion',
  community: 'retention',
}

function buildStrategyBrief(values) {
  const descriptionParts = [values.product]
  if (values.keyMessagesText.trim()) descriptionParts.push(`Key messages: ${values.keyMessagesText.trim()}`)

  return {
    description: descriptionParts.join('\n\n'),
    industry: values.industry,
    businessType: values.businessType,
    targetMarket: values.targetAudience || undefined,
    pricing: values.pricing || undefined,
    additionalNotes: [
      values.brandVoice ? `Brand voice: ${values.brandVoice}` : '',
      values.constraints ? `Constraints: ${values.constraints}` : '',
    ].filter(Boolean).join('\n'),
    intake: {
      targetGeography: 'unknown',
      primaryIcp: values.targetAudience,
      salesMotion: 'unknown',
      monthlyBudget: 'unknown',
      supportedIntegrations: ['unknown'],
      verifiedProofPoints: ['none verified'],
      prohibitedClaims: ['none specified'],
      baselineMetrics: {
        monthlyQualifiedVisits: 'unknown',
        monthlyLeads: 'unknown',
        trialOrDemoConversionRate: 'unknown',
        activationRate: 'unknown',
        paidConversionRate: 'unknown',
        monthlyChurnRate: 'unknown',
      },
    },
    options: {
      maxPersonas: 3,
      primaryGoal: STRATEGY_GOALS[values.campaignGoal] ?? 'balanced',
    },
  }
}

function CampaignForm({ values, setValues, errors, onGenerate, isGenerating, isLocked = false }) {
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
        <fieldset disabled={isLocked} className="contents">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[#4f378a]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#4f378a]">Campaign brief</span>
          </div>
          <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.8px] text-[#201a25]">What are we creating?</h1>
          <p className="mt-2 text-sm leading-5 text-[#746b79]">
            Start with the business context. A strategy team will turn it into a plan for you to review before any posts are made.
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
            {isGenerating ? 'Building your strategy…' : 'Build strategy'}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">
            Strategy first. Posts only start after you approve the plan.
          </p>
        </div>
        </fieldset>
      </form>
    </section>
  )
}

function PostArtwork({ gradient, imageUrl, label, product, platform }) {
  const canRenderImage = typeof imageUrl === 'string' && /^(https?:|data:image\/|blob:)/i.test(imageUrl)
  return (
    <div role="img" aria-label={label} className={`relative min-h-48 overflow-hidden ${canRenderImage ? '' : `bg-gradient-to-br ${gradient}`}`}>
      {canRenderImage ? (
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

function StrategyOverview({ strategy }) {
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="strategy-review overflow-hidden rounded-[24px] border border-[#cfc1dc] bg-[#fffaff] shadow-[0_18px_45px_rgba(46,32,51,0.09)]"
    >
      <div className="relative overflow-hidden border-b border-[#e5dce7] bg-[#2b174f] px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="absolute -right-10 -top-20 size-64 rounded-full border border-[#d8ff9d]/20 bg-[#d8ff9d]/10 blur-[1px]" />
        <div className="absolute -bottom-28 right-24 size-52 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8ff9d]">
              <Sparkles className="size-3.5" /> Strategy ready for review
            </div>
            <h3 className="font-display text-[32px] leading-[1.02] tracking-[-0.8px] sm:text-[40px]">A point of view worth building from.</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">{campaign.summary}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex size-12 items-center justify-center rounded-full border border-[#d8ff9d]/50 bg-[#d8ff9d] text-lg font-bold text-[#2b174f]">
              {quality.score ?? '--'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Plan quality</p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-white">{String(quality.status ?? 'review')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#84788c]">Positioning statement</p>
            <p className="mt-3 font-display text-[22px] leading-[1.25] tracking-[-0.3px] text-[#2b174f]">{stp.positioning?.positioningStatement}</p>
            <p className="mt-4 text-sm leading-6 text-[#6d6275]">{stp.positioning?.brandPromise}</p>
          </div>
          <div className="rounded-2xl border border-[#e5dce7] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#84788c]">Product angle</p>
            <p className="mt-2 text-lg font-semibold text-[#201a25]">{product.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#907f9a]">{product.type} · {product.industry}</p>
            <p className="mt-4 text-sm leading-6 text-[#6d6275]">{product.valueProposition}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#e5dce7] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#84788c]">Who we are targeting</p>
              <Users className="size-4 text-[#4f378a]" />
            </div>
            <div className="mt-4 space-y-3">
              {targetedSegments.map((segment) => (
                <div key={segment.segmentId} className="flex items-start gap-3 rounded-xl bg-[#f7f1f8] p-3">
                  <span className="mt-0.5 rounded-full bg-[#e6fbc7] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#315016]">{segment.priority}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#201a25]">{segmentNames.get(segment.segmentId) ?? segment.segmentId}</p>
                    <p className="mt-1 text-xs leading-5 text-[#766b7d]">{segment.justification}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e5dce7] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#84788c]">Channel mix</p>
              <BarChart3 className="size-4 text-[#4f378a]" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {channels.map((channel) => (
                <div key={channel.channel} className="rounded-xl border border-[#ece4ee] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize text-[#201a25]">{channel.channel}</p>
                    <span className="text-xs font-bold text-[#4f378a]">{channel.estimatedShare}%</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#766b7d]">{channel.primaryFunnelStage} · {channel.expectedKpis?.[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#84788c]">Campaign concepts</p>
              <p className="mt-1 text-sm text-[#6d6275]">The workflow recommends these first moves.</p>
            </div>
            <span className="rounded-full bg-[#f2eafa] px-2.5 py-1 text-[11px] font-semibold text-[#4f378a]">{recommendations.length} concepts</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#201a25]">{recommendation.name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#907f9a]">{recommendation.type} · {recommendation.duration}</p>
                  </div>
                  <span className="rounded-full border border-[#d8cbe0] px-2 py-1 text-[10px] font-semibold capitalize text-[#5d5068]">{recommendation.estimatedImpact} impact</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#6d6275]">{recommendation.objective}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recommendation.channels?.map((channel) => <span key={channel} className="rounded-full bg-white px-2 py-1 text-[10px] font-medium capitalize text-[#685b72]">{channel}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5dce7] bg-[#f8f3f8] p-4">
            <p className="text-2xl font-semibold text-[#2b174f]">{personas.length}</p>
            <p className="mt-1 text-xs text-[#766b7d]">buyer personas mapped</p>
          </div>
          <div className="rounded-2xl border border-[#e5dce7] bg-[#f8f3f8] p-4">
            <p className="text-2xl font-semibold text-[#2b174f]">{objectives.length}</p>
            <p className="mt-1 text-xs text-[#766b7d]">SMART objectives</p>
          </div>
          <div className="rounded-2xl border border-[#e5dce7] bg-[#f8f3f8] p-4">
            <p className="text-2xl font-semibold text-[#2b174f]">{campaign.kpis?.length ?? 0}</p>
            <p className="mt-1 text-xs text-[#766b7d]">primary KPIs to watch</p>
          </div>
        </div>

        <details className="group rounded-2xl border border-[#e5dce7] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-[#3d2b4b] [&::-webkit-details-marker]:hidden">
            Explore assumptions, objectives, and guardrails
            <ChevronDown className="size-4 text-[#84788c] transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-5 border-t border-[#eee7ef] px-4 py-4 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#84788c]">Key messages</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#6d6275]">
                {(campaign.creativeDirection?.keyMessages ?? []).map((message) => <li key={message} className="flex gap-2"><span className="text-[#4f378a]">•</span>{message}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#84788c]">Next decisions</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#6d6275]">
                {(quality.nextDecisions ?? []).map((decision) => <li key={decision} className="flex gap-2"><span className="text-[#4f378a]">•</span>{decision}</li>)}
              </ul>
            </div>
          </div>
        </details>
      </div>

    </motion.section>
  )
}

const STRATEGY_AGENT_TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'product', label: 'Product analysis', icon: Lightbulb },
  { id: 'stp', label: 'STP strategy', icon: BarChart3 },
  { id: 'personas', label: 'Buyer personas', icon: Users },
  { id: 'journey', label: 'Buyer journey', icon: MessageSquare },
  { id: 'objectives', label: 'SMART objectives', icon: Check },
  { id: 'campaign', label: 'Campaign planner', icon: Wand2 },
  { id: 'quality', label: 'Quality gate', icon: CircleAlert },
]

const JOURNEY_STAGES = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'consideration', label: 'Consideration' },
  { id: 'decision', label: 'Decision' },
  { id: 'retention', label: 'Retention' },
  { id: 'advocacy', label: 'Advocacy' },
]

function EditableText({ label, value, onChange, multiline = false, rows = 3, helper }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.13em] text-[#84788c]">{label}</span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-y rounded-xl border border-[#d8cbdc] bg-white px-3 py-2.5 text-sm leading-5 text-[#3d3046] outline-none transition focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
        />
      ) : (
        <input
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-[#d8cbdc] bg-white px-3 text-sm text-[#3d3046] outline-none transition focus:border-[#4f378a] focus:ring-3 focus:ring-[#4f378a]/10"
        />
      )}
      {helper ? <span className="mt-1 block text-[11px] leading-4 text-[#95899c]">{helper}</span> : null}
    </label>
  )
}

function EditableList({ label, values, onChange, helper }) {
  return (
    <EditableText
      label={label}
      value={Array.isArray(values) ? values.join('\n') : ''}
      onChange={(value) => onChange(value.split('\n').map((item) => item.trim()).filter(Boolean))}
      multiline
      rows={Math.min(6, Math.max(3, (values?.length ?? 0) + 1))}
      helper={helper ?? 'One item per line'}
    />
  )
}

function AgentTabPanel({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#cfc1dc] bg-[#fffaff] shadow-[0_12px_32px_rgba(46,32,51,0.06)]">
      <div className="border-b border-[#e5dce7] bg-[#2b174f] px-5 py-5 text-white sm:px-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#d8ff9d]">{eyebrow}</p>
        <h3 className="mt-2 font-display text-[28px] leading-none tracking-[-0.6px]">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-5 text-white/65">{description}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-7">{children}</div>
    </section>
  )
}

function ReadOnlyList({ label, values }) {
  if (!Array.isArray(values) || values.length === 0) return null
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#84788c]">{label}</p>
      <ul className="mt-2 space-y-2">
        {values.map((value, index) => (
          <li key={`${value}-${index}`} className="rounded-xl bg-[#f8f3f8] px-3 py-2 text-xs leading-5 text-[#6d6275]">{value}</li>
        ))}
      </ul>
    </div>
  )
}

function StrategyReview({ strategy, onConfirm, onEdit, onStrategyChange, isSubmitting }) {
  const [activeTab, setActiveTab] = useState('overview')
  if (!strategy) return null

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

  const renderTab = () => {
    if (activeTab === 'overview') return <StrategyOverview strategy={strategy} />

    if (activeTab === 'product') {
      return (
        <AgentTabPanel eyebrow="Product analysis agent" title="The product, clearly understood." description="Edit the product truth, value proposition, and customer problems that downstream agents use as context.">
          <div className="grid gap-4 md:grid-cols-2">
            <EditableText label="Working product name" value={product.name} onChange={(value) => updatePath(['product', 'name'], value)} />
            <EditableText label="Product type" value={product.type} onChange={(value) => updatePath(['product', 'type'], value)} />
            <EditableText label="Value proposition" value={product.valueProposition} onChange={(value) => updatePath(['product', 'valueProposition'], value)} multiline />
            <EditableText label="Pricing notes" value={product.pricingNotes} onChange={(value) => updatePath(['product', 'pricingNotes'], value)} multiline />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <EditableList label="Core features" values={product.coreFeatures} onChange={(value) => updatePath(['product', 'coreFeatures'], value)} />
            <EditableList label="Customer problems" values={product.customerProblems} onChange={(value) => updatePath(['product', 'customerProblems'], value)} />
            <EditableList label="Unique selling points" values={product.uniqueSellingPoints} onChange={(value) => updatePath(['product', 'uniqueSellingPoints'], value)} />
            <EditableList label="Differentiators" values={product.differentiators} onChange={(value) => updatePath(['product', 'differentiators'], value)} />
          </div>
          <ReadOnlyList label="Agent assumptions" values={product.assumptions} />
        </AgentTabPanel>
      )
    }

    if (activeTab === 'stp') {
      return (
        <AgentTabPanel eyebrow="STP strategy agent" title="Choose who to win, and why." description="Refine the positioning language and target segment rationale before it shapes personas and campaign concepts.">
          <div className="grid gap-4 md:grid-cols-2">
            <EditableText label="Positioning statement" value={positioning.positioningStatement} onChange={(value) => updatePath(['stp', 'positioning', 'positioningStatement'], value)} multiline rows={4} />
            <EditableText label="Brand promise" value={positioning.brandPromise} onChange={(value) => updatePath(['stp', 'positioning', 'brandPromise'], value)} multiline />
            <EditableText label="Tone of voice" value={positioning.toneOfVoice} onChange={(value) => updatePath(['stp', 'positioning', 'toneOfVoice'], value)} multiline />
            <EditableList label="Key differentiators" values={positioning.keyDifferentiators} onChange={(value) => updatePath(['stp', 'positioning', 'keyDifferentiators'], value)} />
          </div>
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#84788c]">Candidate segments</p>
                <p className="mt-1 text-xs text-[#766b7d]">You can rename the segments without changing their IDs.</p>
              </div>
              <span className="rounded-full bg-[#f2eafa] px-2.5 py-1 text-[11px] font-semibold text-[#4f378a]">{segments.length} segments</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {segments.map((segment, index) => (
                <div key={segment.id ?? index} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4">
                  <EditableText label="Segment label" value={segment.label} onChange={(value) => updatePath(['stp', 'segments', index, 'label'], value)} />
                  <p className="mt-3 text-xs leading-5 text-[#766b7d]">{segment.notes || segment.psychographics?.join(', ') || 'No additional segment notes.'}</p>
                </div>
              ))}
            </div>
          </div>
        </AgentTabPanel>
      )
    }

    if (activeTab === 'personas') {
      return (
        <AgentTabPanel eyebrow="Buyer persona agent" title="Meet the people behind the segment." description="Edit the language, goals, and frustrations that should guide every post and CTA.">
          {personas.map((persona, index) => (
            <article key={persona.id ?? index} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <EditableText label="Persona name" value={persona.name} onChange={(value) => updatePath(['personas', index, 'name'], value)} />
                  <p className="mt-2 text-xs uppercase tracking-[0.11em] text-[#907f9a]">{persona.role} · {persona.archetype}</p>
                </div>
                <EditableText label="Persona summary" value={persona.summary} onChange={(value) => updatePath(['personas', index, 'summary'], value)} multiline rows={4} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <EditableList label="Goals" values={persona.goals} onChange={(value) => updatePath(['personas', index, 'goals'], value)} />
                <EditableList label="Frustrations" values={persona.frustrations} onChange={(value) => updatePath(['personas', index, 'frustrations'], value)} />
                <EditableList label="Buying triggers" values={persona.buyingTriggers} onChange={(value) => updatePath(['personas', index, 'buyingTriggers'], value)} />
                <EditableList label="Objections" values={persona.objections} onChange={(value) => updatePath(['personas', index, 'objections'], value)} />
              </div>
            </article>
          ))}
        </AgentTabPanel>
      )
    }

    if (activeTab === 'journey') {
      return (
        <AgentTabPanel eyebrow="Buyer journey agent" title="Make the journey feel intentional." description="Shape the questions and content needs at each stage of the funnel. These edits flow into the content handoff.">
          {journeys.map((journey, journeyIndex) => (
            <article key={journey.personaId ?? journeyIndex} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#84788c]">Persona journey</p>
                  <h4 className="mt-1 text-base font-semibold text-[#201a25]">{journey.personaName}</h4>
                </div>
                <span className="rounded-full bg-[#e6fbc7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#315016]">5 stages</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {JOURNEY_STAGES.map((stage) => (
                  <div key={stage.id} className="rounded-xl border border-[#e5dce7] bg-white p-3">
                    <p className="mb-3 text-xs font-semibold text-[#4f378a]">{stage.label}</p>
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
            </article>
          ))}
        </AgentTabPanel>
      )
    }

    if (activeTab === 'objectives') {
      return (
        <AgentTabPanel eyebrow="SMART objectives agent" title="Make the ambition measurable." description="Edit objectives, target values, and deadlines. The quality gate remains visible in its own tab after you make changes.">
          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <article key={objective.id ?? index} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4">
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
              </article>
            ))}
          </div>
        </AgentTabPanel>
      )
    }

    if (activeTab === 'campaign') {
      return (
        <AgentTabPanel eyebrow="Campaign planner agent" title="Turn strategy into a campaign system." description="These are the fields the content workflow will use after approval. Edit them to change the final creative direction.">
          <EditableText label="Campaign summary" value={campaign.summary} onChange={(value) => updatePath(['campaignStrategy', 'summary'], value)} multiline rows={5} />
          <div className="grid gap-4 md:grid-cols-2">
            <EditableText label="Storytelling approach" value={campaign.creativeDirection?.storytellingApproach} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'storytellingApproach'], value)} multiline />
            <EditableText label="Visual style" value={campaign.creativeDirection?.visualStyle} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'visualStyle'], value)} multiline />
            <EditableList label="Key messages" values={campaign.creativeDirection?.keyMessages} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'keyMessages'], value)} />
            <EditableList label="Creative do list" values={campaign.creativeDirection?.doList} onChange={(value) => updatePath(['campaignStrategy', 'creativeDirection', 'doList'], value)} />
            <EditableText label="Primary CTA" value={campaign.ctaStrategy?.primaryCta} onChange={(value) => updatePath(['campaignStrategy', 'ctaStrategy', 'primaryCta'], value)} />
            <EditableText label="CTA hierarchy" value={campaign.ctaStrategy?.ctaHierarchy} onChange={(value) => updatePath(['campaignStrategy', 'ctaStrategy', 'ctaHierarchy'], value)} multiline />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.id ?? index} className="rounded-2xl border border-[#e5dce7] bg-[#fbf7fb] p-4">
                <p className="mb-3 text-sm font-semibold text-[#201a25]">{recommendation.name}</p>
                <EditableText label="Objective" value={recommendation.objective} onChange={(value) => updatePath(['campaignStrategy', 'campaignRecommendations', index, 'objective'], value)} multiline />
              </div>
            ))}
          </div>
        </AgentTabPanel>
      )
    }

    return (
      <AgentTabPanel eyebrow="Quality gate agent" title="Know what is solid, and what is assumed." description="This audit is read-only. Review the evidence and assumptions before approving the edited strategy.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#e6fbc7] p-4"><p className="text-2xl font-semibold text-[#2b174f]">{quality.score ?? '--'}</p><p className="mt-1 text-xs text-[#315016]">plan quality score</p></div>
          <div className="rounded-2xl bg-[#f2eafa] p-4"><p className="text-sm font-semibold capitalize text-[#381e72]">{quality.status ?? 'review'}</p><p className="mt-1 text-xs text-[#5d5068]">quality status</p></div>
          <div className="rounded-2xl bg-[#f8f3f8] p-4"><p className="text-2xl font-semibold text-[#2b174f]">{quality.issues?.length ?? 0}</p><p className="mt-1 text-xs text-[#766b7d]">open findings</p></div>
        </div>
        <ReadOnlyList label="Assumption register" values={quality.assumptionRegister} />
        <ReadOnlyList label="Next decisions" values={quality.nextDecisions} />
        <div className="space-y-2">
          {(quality.issues ?? []).map((issue, index) => (
            <div key={`${issue.code}-${index}`} className="rounded-xl border border-[#f0d9b7] bg-[#fff8eb] p-3">
              <p className="text-xs font-semibold capitalize text-[#9b5a12]">{issue.severity} · {issue.field}</p>
              <p className="mt-1 text-sm text-[#6d6275]">{issue.message}</p>
              <p className="mt-1 text-xs text-[#907f9a]">Resolution: {issue.resolution}</p>
            </div>
          ))}
        </div>
      </AgentTabPanel>
    )
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="strategy-review overflow-hidden rounded-[24px] border border-[#cfc1dc] bg-[#f8f3f8] shadow-[0_18px_45px_rgba(46,32,51,0.09)]">
      <div className="border-b border-[#ded3e4] bg-[#fffaff] px-3 py-3 sm:px-5">
        <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Strategy agents">
          {STRATEGY_AGENT_TABS.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(id)}
                className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${selected ? 'bg-[#381e72] text-white shadow-[0_5px_14px_rgba(56,30,114,0.18)]' : 'text-[#6d6275] hover:bg-[#f2eafa] hover:text-[#381e72]'}`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            )
          })}
        </div>
        <p className="mt-2 px-1 text-[11px] text-[#95899c]">Every panel is owned by one agent. Edit the highlighted fields, then approve the final handoff.</p>
      </div>

      <div className="p-3 sm:p-5">{renderTab()}</div>

      <div className="flex flex-col gap-3 border-t border-[#ded3e4] bg-[#fbf7fb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-sm font-semibold text-[#201a25]">Ready to turn the edited plan into posts?</p>
          <p className="mt-0.5 text-xs text-[#766b7d]">Approval sends this current strategy draft to the content workflow.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} disabled={isSubmitting} className="h-11 rounded-xl border border-[#d8cbdc] bg-white px-4 text-sm font-semibold text-[#62556b] transition hover:border-[#a99eb4] disabled:opacity-50">Edit brief</button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(56,30,114,0.2)] transition hover:bg-[#4f378a] disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? <Loader2 className="size-4 animate-spin text-[#d8ff9d]" /> : <Wand2 className="size-4 text-[#d8ff9d]" />}
            {isSubmitting ? 'Starting content workflow...' : 'Approve & create posts'}
          </button>
        </div>
      </div>
    </motion.section>
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

function WorkflowProgress({ runState, generateImages, workflowKind = 'content' }) {
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

  return (
    <section className="campaign-pulse rounded-[20px] border border-[#d9cfe0] bg-[#fffaff] p-5 shadow-[0_8px_24px_rgba(46,32,51,0.05)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#381e72] text-[#d8ff9d]">
          <Loader2 className="size-4 animate-spin" />
        </span>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-[#201a25]">
             {activeLabels.length > 0 ? activeLabels.join(' + ') : workflowKind === 'strategy' ? 'Starting strategy workflow' : 'Starting content workflow'}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[#746b79]">
             {workflowKind === 'strategy' ? 'The strategy team is turning your brief into a plan you can approve.' : 'The content team is turning your approved strategy into publishable posts.'}
            </p>
        </div>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {visibleSteps.map((step) => {
          const isComplete = isStepComplete(step)
          const isActive = isStepActive(step)
          const status = isComplete ? 'Complete' : isActive ? 'Working now' : 'Waiting'
          return (
            <motion.li
              key={step.id}
              tabIndex={0}
              aria-label={`${step.label}: ${status}. ${step.description}`}
              whileHover={{ y: -2 }}
              className={`group relative flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium outline-none transition-[border-color,background-color,box-shadow,color] focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
                isComplete
                  ? 'border-[#cfe6ad] bg-[#eff9df] text-[#315016]'
                  : isActive
                    ? 'border-[#8d6bb4] bg-[#f2eafa] text-[#381e72] shadow-[0_7px_18px_rgba(79,55,138,0.14)] ring-1 ring-[#d2c0e5]'
                    : 'border-[#e5dee7] bg-[#faf6fa] text-[#8b818f] hover:border-[#cfc2d5] hover:bg-white hover:text-[#625b71]'
              }`}
            >
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-[#381e72] text-[#d8ff9d]' : 'bg-white/80'}`}>
                {isComplete ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : isActive ? (
                  <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-35" />
                )}
              </span>
              <span className="min-w-0 flex-1 leading-4">{step.label}</span>
              {isActive ? <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#6aa51f]" aria-hidden="true" /> : null}
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-xl bg-[#241936] px-3 py-2.5 text-left text-[11px] font-normal leading-4 text-white shadow-[0_10px_30px_rgba(36,25,54,0.24)] group-hover:block group-focus-visible:block">
                <span className="block font-semibold text-[#d8ff9d]">{status}</span>
                <span className="mt-0.5 block text-white/75">{step.description}</span>
              </span>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

function ErrorBanner({ message, onDismiss, onRetry, title = 'Workflow failed' }) {
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

function ProjectHistoryDrawer({ project, chat, entries, isLoading, onClose, onOpenEntry }) {
  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 28 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#d9cfe0] bg-[#fffaff] shadow-[-20px_0_60px_rgba(46,32,51,0.16)]"
        aria-label={`${chat.title} history in ${project.name}`}
      >
        <div className="flex items-start gap-3 border-b border-[#e5dee7] px-5 py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#381e72] text-[#d8ff9d]">
            <History className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#84788c]">{project.name} · Chat history</p>
            <h2 className="truncate font-display text-xl text-[#201a25]">{chat.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close history" className="ml-auto flex size-9 items-center justify-center rounded-lg text-[#716777] hover:bg-[#f1eaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
            <X className="size-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#746b79]"><Loader2 className="size-4 animate-spin" /> Loading history…</div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfc2d5] bg-[#f8f3f8] px-6 py-12 text-center">
              <Clock3 className="mx-auto size-6 text-[#8d7c98]" />
              <p className="mt-3 text-sm font-semibold text-[#381e72]">No workflow runs yet</p>
              <p className="mt-1 text-xs leading-5 text-[#807586]">Build a strategy and create posts. Each result will be saved here automatically.</p>
            </div>
          ) : (
            <ol className="space-y-2">
              {entries.map((entry) => {
                const canOpen = entry.status === 'success' && entry.result
                return (
                  <li key={entry.id} className="rounded-2xl border border-[#e2d9e6] bg-white p-4 shadow-[0_5px_16px_rgba(46,32,51,0.05)]">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${entry.status === 'success' ? 'bg-[#6aa51f]' : entry.status === 'failed' ? 'bg-[#ad3150]' : 'bg-[#a17b24]'}`} />
                      <p className="text-sm font-semibold capitalize text-[#201a25]">{entry.kind} workflow</p>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7f90]">{entry.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#807586]">{new Date(entry.createdAt).toLocaleString()}</p>
                    {entry.postCount > 0 ? <p className="mt-1 text-xs font-medium text-[#4f378a]">{entry.postCount} posts generated</p> : null}
                    {entry.error ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1385a]">{entry.error}</p> : null}
                    {canOpen ? (
                      <button type="button" onClick={() => onOpenEntry(entry)} className="mt-3 h-9 rounded-lg bg-[#f2eafa] px-3 text-xs font-semibold text-[#381e72] transition hover:bg-[#e8dcf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                        Open saved result
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

function ResultsPanel({
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
  onEditStrategy,
  onStrategyChange,
}) {
  const selectedPlatforms = PLATFORM_OPTIONS.filter((platform) => values.platforms.includes(platform.id))

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

  return (
    <main className="min-w-0 flex-1 bg-[#f8f3f8] lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto" id="generated-results">
      <div className={`mx-auto px-4 py-6 transition-[max-width] duration-300 sm:px-7 lg:px-8 lg:py-8 xl:px-10 ${hasStrategyReview ? 'max-w-[1180px]' : 'max-w-[960px]'}`}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#776e7d]">
              <span>{projectName}</span>
              <span aria-hidden="true">/</span>
               <span className="font-medium text-[#4f378a]">{hasStrategyReview ? 'Strategy review' : hasResults ? 'Campaign generation' : 'Strategy workspace'}</span>
            </div>
            <h2 className="font-display text-[34px] leading-none tracking-[-0.75px] text-[#201a25] sm:text-[40px]">
              {hasResults ? 'Your campaign, ready to shape.' : hasStrategyReview ? 'Review the thinking before the making.' : 'Build a campaign with intention.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716777]">
              {hasResults
                ? 'Edit captions in place, copy what works, and keep every iteration in this project.'
                : hasStrategyReview
                  ? 'The plan below is the handoff between your brief and the content team. Approve it when the direction feels right.'
                  : 'Fill the brief and let the strategy team create a considered plan before any content is generated.'}
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
            <span className="rounded-full border border-[#d9d0dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5462]">{hasStrategyReview ? 'Plan ready' : `${totalPosts} posts`}</span>
          </div>
        </div>

        {error ? <ErrorBanner message={error} onDismiss={onDismissError} onRetry={onRetryError} title={phase === 'strategy' || (!campaign && !strategy) ? 'Strategy generation failed' : 'Content generation failed'} /> : null}

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" aria-live="polite" aria-label="Generating campaign posts">
              <WorkflowProgress runState={runState} generateImages={values.generateImages} workflowKind={workflowKind} />
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
          ) : hasStrategyReview ? (
            <StrategyReview strategy={strategy} onConfirm={onConfirmStrategy} onEdit={onEditStrategy} onStrategyChange={onStrategyChange} isSubmitting={false} />
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
              <p className="mt-1 max-w-md text-sm text-[#746b79]">Complete the brief and build a strategy. You will get a full review before the content workflow begins.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function fieldErrorsFromZod(issue) {
  const paths = issue.path.filter(Boolean)
  const key = paths[0] === 'description' ? 'product' : paths[0]
  if (!key) return { _form: issue.message }
  return { [key]: issue.message }
}

function mergeWorkflowStatus(current, next) {
  return {
    ...current,
    ...next,
    // Polling returns durable status/result but no Mastra step graph. Retain
    // the SSE snapshot until a newer SSE event advances it.
    activeSteps: next.activeSteps?.length ? next.activeSteps : (current?.activeSteps ?? []),
    completedSteps: next.completedSteps?.length ? next.completedSteps : (current?.completedSteps ?? []),
  }
}

export function GeneratePage() {
  const [restoredState] = useState(() => readGenerateState())
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(() => restoredState?.activeProject ?? '')
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(() => restoredState?.activeChat ?? '')
  const [campaign, setCampaign] = useState(() => restoredState?.campaign ?? null)
  const [strategy, setStrategy] = useState(() => restoredState?.strategy ?? null)
  const [strategyRunId, setStrategyRunId] = useState(() => restoredState?.strategyRunId ?? '')
  const [phase, setPhase] = useState(() => {
    if (restoredState?.activeRunId && (restoredState.phase === 'strategy' || restoredState.phase === 'content')) return restoredState.phase
    return restoredState?.campaign ? 'complete' : restoredState?.strategy ? 'review' : 'idle'
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState(() => mergeStoredValues(restoredState?.values))
  const [submittedValues, setSubmittedValues] = useState(() => restoredState?.submittedValues ?? null)
  const [runState, setRunState] = useState(null)
  const [activeRunId, setActiveRunId] = useState(() => restoredState?.activeRunId ?? '')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileRenameOpen, setMobileRenameOpen] = useState(false)
  const [mobileProjectName, setMobileProjectName] = useState('')
  const [chatPendingDelete, setChatPendingDelete] = useState(null)
  const abortRef = useRef(null)
  const sseHealthyRef = useRef(false)
  const cancelMobileRenameRef = useRef(false)

  const currentProject = projects.find((project) => project.id === activeProject) ?? projects[0] ?? EMPTY_PROJECT
  const currentChat = chats.find((chat) => chat.id === activeChat) ?? chats[0] ?? { id: '', title: 'New chat', historyCount: 0 }
  const isGenerating = phase === 'strategy' || phase === 'content'
  const restoredRunId = restoredState?.activeRunId
  const restoredPhase = restoredState?.phase
  const restoredProjectId = restoredState?.activeProject
  const restoredChatId = restoredState?.activeChat

  useEffect(() => () => abortRef.current?.abort(), [])

  // Live agent progress arrives over SSE. `waitForStrategy`/`waitForContent`
  // still poll the persisted run as a reconnect-safe fallback and to retrieve
  // the full final result.
  useEffect(() => {
    if (!activeRunId || (phase !== 'strategy' && phase !== 'content')) return undefined
    sseHealthyRef.current = false
    return subscribeToWorkflow(phase, activeRunId, {
      onProgress: (progress) => {
        sseHealthyRef.current = progress.status !== 'success' && progress.status !== 'failed' && progress.status !== 'suspended'
        setRunState(progress)
      },
      onError: () => {
        sseHealthyRef.current = false
      },
    })
  }, [activeRunId, phase])

  useEffect(() => {
    const controller = new AbortController()
    const loadProjects = async () => {
      try {
        let loadedProjects = await listProjects({ signal: controller.signal })
        if (loadedProjects.length === 0) {
          const firstProject = await createProject('My first campaign', { signal: controller.signal })
          loadedProjects = [firstProject]
        }
        const selectedProject = loadedProjects.find((project) => project.id === restoredProjectId) ?? loadedProjects[0]
        let loadedChats = await listChats(selectedProject.id, { signal: controller.signal })
        if (loadedChats.length === 0) {
          const firstChat = await createChat(selectedProject.id, 'Campaign chat 1', { signal: controller.signal })
          loadedChats = [firstChat]
        }
        setProjects(loadedProjects.map((project) => project.id === selectedProject.id ? { ...project, chatCount: loadedChats.length } : project))
        setActiveProject(selectedProject.id)
        setChats(loadedChats)
        const selectedChatId = loadedChats.some((chat) => chat.id === restoredChatId) ? restoredChatId : loadedChats[0].id
        setActiveChat(selectedChatId)
        const history = await getChatHistory(selectedProject.id, selectedChatId, { signal: controller.signal })
        restoreChatHistory(history)
      } catch (loadError) {
        if (loadError?.name !== 'AbortError') {
          setError(typeof loadError?.message === 'string' ? loadError.message : 'Could not load projects from the backend.')
        }
      }
    }
    void loadProjects()
    return () => controller.abort()
    // The restore helpers only use stable React state setters and schemas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoredChatId, restoredProjectId])

  useEffect(() => {
    if (
      !restoredRunId ||
      restoredRunId !== activeRunId ||
      restoredPhase !== phase ||
      (phase !== 'strategy' && phase !== 'content')
    ) return undefined
    const controller = new AbortController()
    abortRef.current = controller

    const resumeRun = async () => {
      try {
        const finalState = phase === 'strategy'
          ? await waitForStrategy(activeRunId, { signal: controller.signal, shouldPoll: () => !sseHealthyRef.current, onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)) })
          : await waitForContent(activeRunId, { signal: controller.signal, shouldPoll: () => !sseHealthyRef.current, onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)) })
        setRunState(finalState)

        if (finalState.status === 'failed') {
          const raw = finalState.error
          setError(typeof raw === 'string' ? raw : raw?.message || 'The workflow failed to complete.')
          setPhase(phase === 'strategy' ? 'idle' : 'review')
        } else if (finalState.status === 'canceled') {
          setPhase(phase === 'strategy' ? 'idle' : 'review')
        } else if (finalState.result && phase === 'strategy') {
          const parsedResult = marketingStrategyOutputSchema.safeParse(finalState.result)
          if (!parsedResult.success) throw new Error('The restored strategy response did not match the strategy schema.')
          setStrategy(parsedResult.data)
          setStrategyRunId(activeRunId)
          setPhase('review')
        } else if (finalState.result && phase === 'content') {
          const parsedResult = campaignOutputSchema.safeParse(finalState.result)
          if (!parsedResult.success) throw new Error('The restored campaign response did not match the campaign schema.')
          setCampaign(parsedResult.data)
          setPhase('complete')
          void Promise.all([listProjects(), listChats(activeProject)])
            .then(([nextProjects, nextChats]) => {
              setProjects(nextProjects)
              setChats(nextChats)
            })
            .catch(() => undefined)
        } else {
          throw new Error('The restored workflow completed without returning a result.')
        }
      } catch (error) {
        if (error?.name === 'AbortError') return
        setError(typeof error?.message === 'string' ? error.message : 'The workflow could not be restored after refresh.')
        setPhase(phase === 'strategy' ? 'idle' : 'review')
      } finally {
        setActiveRunId('')
      }
    }

    void resumeRun()
    return () => controller.abort()
  }, [activeProject, activeRunId, phase, restoredPhase, restoredRunId])

  useEffect(() => {
    try {
      window.localStorage.setItem(GENERATE_STORAGE_KEY, JSON.stringify({
        activeProject,
        activeChat,
        activeRunId,
        campaign,
        phase,
        strategy,
        strategyRunId,
        submittedValues,
        values,
      }))
    } catch {
      // Persistence is best-effort when storage is disabled or unavailable.
    }
  }, [activeChat, activeProject, activeRunId, campaign, phase, strategy, strategyRunId, submittedValues, values])

  const refreshProjectNavigation = () => {
    if (!activeProject) return
    void Promise.all([listProjects(), listChats(activeProject)])
      .then(([nextProjects, nextChats]) => {
        setProjects(nextProjects)
        setChats(nextChats)
      })
      .catch(() => undefined)
  }

  function restoreHistoryEntry(entry) {
    if (!entry?.result) return false
    if (entry.kind === 'content') {
      const parsed = campaignOutputSchema.safeParse(entry.result)
      if (!parsed.success) return false
      setCampaign(parsed.data)
      setStrategy(null)
      setStrategyRunId('')
      setPhase('complete')
      return true
    }
    const parsed = marketingStrategyOutputSchema.safeParse(entry.result)
    if (!parsed.success) return false
    setStrategy(parsed.data)
    setStrategyRunId(entry.id ?? '')
    setCampaign(null)
    setPhase('review')
    return true
  }

  function restoreChatHistory(entries) {
    const active = entries.find((entry) => entry.status === 'running' && (entry.kind === 'strategy' || entry.kind === 'content'))
    if (active?.id) {
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setPhase(active.kind)
      setActiveRunId(active.id)
      setRunState({ status: 'running', activeSteps: [], completedSteps: [] })
      return true
    }

    const latestSuccess = entries.find((entry) => entry.status === 'success' && entry.result)
    return latestSuccess ? restoreHistoryEntry(latestSuccess) : false
  }

  const handleNewProject = async () => {
    try {
      const project = await createProject(`Untitled Project ${projects.length + 1}`)
      const chat = await createChat(project.id, 'Campaign chat 1')
      setProjects((current) => [{ ...project, chatCount: 1 }, ...current])
      setActiveProject(project.id)
      setChats([chat])
      setActiveChat(chat.id)
      setValues({ ...EMPTY_VALUES })
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setError('')
      window.setTimeout(() => document.querySelector('#product')?.focus(), 50)
    } catch (createError) {
      setError(typeof createError?.message === 'string' ? createError.message : 'Could not create the project.')
    }
  }

  const handleSelectProject = async (projectId) => {
    if (isGenerating || projectId === activeProject) return
    try {
      let projectChats = await listChats(projectId)
      if (projectChats.length === 0) projectChats = [await createChat(projectId, 'Campaign chat 1')]
      setActiveProject(projectId)
      setChats(projectChats)
      setProjects((current) => current.map((project) => project.id === projectId ? { ...project, chatCount: projectChats.length } : project))
      setActiveChat(projectChats[0].id)
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setError('')
      const projectChatHistory = await getChatHistory(projectId, projectChats[0].id)
      restoreChatHistory(projectChatHistory)
    } catch (selectError) {
      setError(typeof selectError?.message === 'string' ? selectError.message : 'Could not open the project.')
    }
  }

  const handleRenameProject = async (project, nextName) => {
    const name = nextName?.trim()
    if (!name || name === project.name) return true
    try {
      const updated = await renameProject(project.id, name)
      setProjects((current) => current.map((item) => item.id === updated.id
        ? { ...item, ...updated, chatCount: updated.chatCount ?? item.chatCount }
        : item))
      return true
    } catch (renameError) {
      setError(typeof renameError?.message === 'string' ? renameError.message : 'Could not rename the project.')
      return false
    }
  }

  const beginMobileRename = () => {
    cancelMobileRenameRef.current = false
    setMobileProjectName(currentProject.name)
    setMobileRenameOpen(true)
  }

  const commitMobileRename = async () => {
    if (cancelMobileRenameRef.current) {
      cancelMobileRenameRef.current = false
      return
    }
    const nextName = mobileProjectName.trim()
    setMobileRenameOpen(false)
    if (!nextName || nextName === currentProject.name) return
    const renamed = await handleRenameProject(currentProject, nextName)
    if (!renamed) setMobileRenameOpen(true)
  }

  const handleDeleteProject = async (project) => {
    if (isGenerating) return
    const confirmed = window.confirm(`Delete “${project.name}” and all of its chats and history? This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteProject(project.id)
      let remaining = await listProjects()
      if (remaining.length === 0) remaining = [await createProject('My first campaign')]
      const nextProject = remaining[0]
      let nextChats = await listChats(nextProject.id)
      if (nextChats.length === 0) nextChats = [await createChat(nextProject.id, 'Campaign chat 1')]
      setProjects(remaining)
      setActiveProject(nextProject.id)
      setChats(nextChats)
      setActiveChat(nextChats[0].id)
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setError('')
    } catch (deleteError) {
      setError(typeof deleteError?.message === 'string' ? deleteError.message : 'Could not delete the project.')
    }
  }

  const handleNewChat = async () => {
    if (!activeProject || isGenerating) return
    try {
      const chat = await createChat(activeProject, `Campaign chat ${chats.length + 1}`)
      setChats((current) => [chat, ...current])
      setProjects((current) => current.map((project) => project.id === activeProject ? { ...project, chatCount: (project.chatCount ?? 0) + 1 } : project))
      setActiveChat(chat.id)
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setError('')
    } catch (chatError) {
      setError(typeof chatError?.message === 'string' ? chatError.message : 'Could not create the chat.')
    }
  }

  const handleConfirmDeleteChat = async () => {
    const chat = chatPendingDelete
    if (!chat || !activeProject || isGenerating) return
    try {
      await deleteChat(activeProject, chat.id)
      let remainingChats = await listChats(activeProject)
      if (remainingChats.length === 0) {
        remainingChats = [await createChat(activeProject, 'Campaign chat 1')]
      }
      const deletedActiveChat = chat.id === activeChat
      setChats(remainingChats)
      setProjects((current) => current.map((project) => project.id === activeProject ? { ...project, chatCount: remainingChats.length } : project))
      if (deletedActiveChat) {
        const nextChat = remainingChats[0]
        setActiveChat(nextChat.id)
        setCampaign(null)
        setStrategy(null)
        setStrategyRunId('')
        setSubmittedValues(null)
        setPhase('idle')
        setRunState(null)
        setHistoryOpen(false)
        const nextHistory = await getChatHistory(activeProject, nextChat.id)
        setHistoryEntries(nextHistory)
        restoreChatHistory(nextHistory)
      }
      setError('')
    } catch (chatError) {
      setError(typeof chatError?.message === 'string' ? chatError.message : 'Could not delete the chat.')
    } finally {
      setChatPendingDelete(null)
    }
  }

  const handleSelectChat = async (chatId) => {
    if (isGenerating || chatId === activeChat) return
    setActiveChat(chatId)
    setCampaign(null)
    setStrategy(null)
    setStrategyRunId('')
    setSubmittedValues(null)
    setPhase('idle')
    setRunState(null)
    setHistoryOpen(false)
    setError('')
    try {
      const chatHistory = await getChatHistory(activeProject, chatId)
      setHistoryEntries(chatHistory)
      restoreChatHistory(chatHistory)
    } catch (chatError) {
      setError(typeof chatError?.message === 'string' ? chatError.message : 'Could not load the chat.')
    }
  }

  const handleOpenHistory = async () => {
    if (!activeProject || !activeChat) return
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      setHistoryEntries(await getChatHistory(activeProject, activeChat))
    } catch (historyError) {
      setError(typeof historyError?.message === 'string' ? historyError.message : 'Could not load project history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleOpenHistoryEntry = (entry) => {
    restoreHistoryEntry(entry)
    setHistoryOpen(false)
  }

  const handleGenerate = async (event) => {
    event?.preventDefault()
    if (isGenerating) return

    setError('')
    setErrors({})

    const requiredFormErrors = {}
    if (!values.brandName.trim()) requiredFormErrors.brandName = 'Brand name is required'
    if (!values.targetAudience.trim()) requiredFormErrors.targetAudience = 'Audience is required'
    if (!values.campaignGoal) requiredFormErrors.campaignGoal = 'Pick a campaign goal'
    if (!values.platforms.length) requiredFormErrors.platforms = 'Select at least one platform'
    if (!values.duration) requiredFormErrors.duration = 'Duration is required'
    if (!Number.isInteger(values.postsPerWeek) || values.postsPerWeek < 1 || values.postsPerWeek > 20) {
      requiredFormErrors.postsPerWeek = 'Posts per week must be between 1 and 20'
    }
    if (Object.keys(requiredFormErrors).length > 0) {
      setErrors(requiredFormErrors)
      return
    }

    const brief = buildStrategyBrief(values)
    const parsed = marketingStrategyInputSchema.safeParse(brief)
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.reduce((acc, issue) => ({ ...acc, ...fieldErrorsFromZod(issue) }), {})
      setErrors(fieldErrors)
      return
    }

    abortRef.current?.abort()
    sseHealthyRef.current = false
    const controller = new AbortController()
    abortRef.current = controller

    setPhase('strategy')
    setCampaign(null)
    setStrategy(null)
    setStrategyRunId('')
    setSubmittedValues({ ...values, platforms: [...values.platforms] })
    setRunState({
      status: 'running',
      activeSteps: [],
      completedSteps: [],
    })
    try {
      const { runId } = await startStrategy(parsed.data, { signal: controller.signal, projectId: activeProject, chatId: activeChat })
      setActiveRunId(runId)

      const finalState = await waitForStrategy(runId, {
        signal: controller.signal,
        shouldPoll: () => !sseHealthyRef.current,
        intervalMs: 1500,
        maxAttempts: 600,
        onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)),
      })

      setRunState(finalState)

      if (finalState.status === 'failed') {
        const raw = finalState.error
        setError(typeof raw === 'string' ? raw : raw?.message || 'The workflow failed to complete.')
        setPhase('idle')
      } else if (finalState.status === 'canceled') {
        setError('')
        setPhase('idle')
      } else if (finalState.result) {
        const parsedResult = marketingStrategyOutputSchema.safeParse(finalState.result)
        if (!parsedResult.success) {
          throw new Error('The strategy workflow completed, but its response did not match the strategy schema.')
        }
        setStrategy(parsedResult.data)
        setStrategyRunId(runId)
        setPhase('review')
        refreshProjectNavigation()
      } else {
        throw new Error('The strategy workflow completed without returning a plan.')
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong while building the strategy.')
      setPhase('idle')
    } finally {
      setActiveRunId('')
    }
  }

  const handleConfirmStrategy = async () => {
    if (!strategy || isGenerating) return

    const sourceValues = submittedValues ?? values
    if (!strategyRunId) {
      setError('The strategy did not include a campaign plan to send to the content workflow.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setError('')
    setPhase('content')
    setCampaign(null)
    setRunState({ status: 'running', activeSteps: [], completedSteps: [] })

    const contentInput = {
      brandName: sourceValues.brandName,
      product: sourceValues.product,
      targetAudience: sourceValues.targetAudience || strategy.campaignStrategy.audienceStrategy.primaryAudience,
      platforms: sourceValues.platforms,
      duration: sourceValues.duration,
      postsPerWeek: sourceValues.postsPerWeek,
      generateImages: sourceValues.generateImages,
      requireApproval: false,
    }

    try {
      const { runId } = await startContent(contentInput, { signal: controller.signal, chatId: activeChat, strategyId: strategyRunId })
      setActiveRunId(runId)
      const finalState = await waitForContent(runId, {
        signal: controller.signal,
        shouldPoll: () => !sseHealthyRef.current,
        intervalMs: 1500,
        maxAttempts: 600,
        onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)),
      })

      setRunState(finalState)
      if (finalState.status === 'failed') {
        const raw = finalState.error
        setError(typeof raw === 'string' ? raw : raw?.message || 'The content workflow failed to complete.')
        setPhase('review')
      } else if (finalState.status === 'canceled') {
        setPhase('review')
      } else if (finalState.result) {
        const parsedResult = campaignOutputSchema.safeParse(finalState.result)
        if (!parsedResult.success) {
          throw new Error('The content workflow completed, but its response did not match the campaign result schema.')
        }
        setCampaign(parsedResult.data)
        setPhase('complete')
        refreshProjectNavigation()
      } else {
        throw new Error('The content workflow completed without returning a campaign.')
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong while creating the posts.')
      setPhase('review')
    } finally {
      setActiveRunId('')
    }
  }

  const handleEditStrategy = () => {
    abortRef.current?.abort()
    setStrategy(null)
    setStrategyRunId('')
    setCampaign(null)
    setPhase('idle')
    setRunState(null)
    setError('')
    window.setTimeout(() => document.querySelector('#product')?.focus(), 50)
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    sseHealthyRef.current = false
    setError('Stopped waiting for this run. It continues in the background and remains available in history.')
    setPhase(phase === 'content' ? 'review' : 'idle')
    setActiveRunId('')
  }

  const effectiveError = error
  const resultValues = submittedValues ?? values

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-[#f8f3f8] text-[#201a25]">
      <AppHeader />
      <div className="border-b border-[#ded7e3] bg-[#f6f0f7] px-4 py-2.5 lg:hidden">
        <div className="mx-auto max-w-xl space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: currentProject.color }} />
            {mobileRenameOpen ? (
              <input
                autoFocus
                value={mobileProjectName}
                onChange={(event) => setMobileProjectName(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                onBlur={() => void commitMobileRename()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur()
                  if (event.key === 'Escape') {
                    cancelMobileRenameRef.current = true
                    setMobileRenameOpen(false)
                    event.currentTarget.blur()
                  }
                }}
                maxLength={80}
                aria-label={`New name for ${currentProject.name}`}
                className="h-9 min-w-0 flex-1 rounded-lg border border-[#8e70b2] bg-[#faf6ff] px-2.5 text-sm font-semibold text-[#201a25] outline-none ring-2 ring-[#ddd0ef] selection:bg-[#d9c8f4]"
              />
            ) : (
              <select value={activeProject} onChange={(event) => void handleSelectProject(event.target.value)} disabled={isGenerating} aria-label="Active project" className="min-w-0 flex-1 truncate rounded-lg border border-[#ded7e3] bg-white px-2.5 py-2 text-xs font-semibold text-[#201a25] outline-none focus:border-[#4f378a]">
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            )}
            <button type="button" onClick={beginMobileRename} aria-label="Rename current project" className="flex size-9 items-center justify-center rounded-lg bg-white text-[#625b71] ring-1 ring-[#ded7e3]"><Pencil className="size-3.5" /></button>
            <button type="button" onClick={() => handleDeleteProject(currentProject)} aria-label="Delete current project" className="flex size-9 items-center justify-center rounded-lg bg-white text-[#ad3150] ring-1 ring-[#eccfd5]"><Trash2 className="size-3.5" /></button>
            <button type="button" onClick={handleNewProject} aria-label="Create new project" className="flex size-9 items-center justify-center rounded-lg bg-[#381e72] text-white"><Plus className="size-3.5" /></button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {chats.map((chat) => (
              <div key={chat.id} className={`flex h-8 shrink-0 items-center overflow-hidden rounded-lg ${chat.id === activeChat ? 'bg-[#381e72] text-white' : 'bg-white text-[#625b71] ring-1 ring-[#ded7e3]'}`}>
                <button type="button" onClick={() => handleSelectChat(chat.id)} className="h-full px-2.5 text-[11px] font-semibold">{chat.title}</button>
                <button type="button" onClick={() => setChatPendingDelete(chat)} aria-label={`Delete ${chat.title}`} className={`flex h-full w-8 items-center justify-center ${chat.id === activeChat ? 'text-white/70 hover:bg-white/15 hover:text-white' : 'text-[#a45b70] hover:bg-[#fbe2e8]'}`}><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={handleNewChat} className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4f378a] ring-1 ring-[#ded7e3]" aria-label="Create new chat"><Plus className="size-3.5" /></button>
            <button type="button" onClick={handleOpenHistory} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[11px] font-semibold text-[#4f378a] ring-1 ring-[#ded7e3]"><History className="size-3.5" /> History</button>
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ProjectSidebar
          projects={projects}
          activeProject={activeProject}
          chats={chats}
          activeChat={activeChat}
          onSelect={handleSelectProject}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={setChatPendingDelete}
          onOpenHistory={handleOpenHistory}
          historyOpen={historyOpen}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((current) => !current)}
        />
        <CampaignForm
          values={values}
          setValues={setValues}
          errors={errors}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isLocked={!activeProject || !activeChat || phase === 'strategy' || phase === 'review' || phase === 'content'}
        />
        <ResultsPanel
          campaign={campaign}
          setCampaign={setCampaign}
          strategy={strategy}
          values={resultValues}
          phase={phase}
          runState={runState}
          projectName={`${currentProject.name} · ${currentChat.title}`}
          error={effectiveError}
          onDismissError={() => setError('')}
          onRetryError={strategy && !campaign ? handleConfirmStrategy : handleGenerate}
          onConfirmStrategy={handleConfirmStrategy}
          onEditStrategy={handleEditStrategy}
          onStrategyChange={setStrategy}
        />
      </div>
      {isGenerating ? (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#381e72] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <Loader2 className="size-3.5 animate-spin text-[#d8ff9d]" />
           {phase === 'strategy' ? 'Building strategy…' : 'Creating posts…'}
          <button type="button" onClick={handleCancel} className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] hover:bg-white/25">
            Cancel
          </button>
        </div>
      ) : null}
      {historyOpen ? (
        <ProjectHistoryDrawer
          project={currentProject}
          chat={currentChat}
          entries={historyEntries}
          isLoading={historyLoading}
          onClose={() => setHistoryOpen(false)}
          onOpenEntry={handleOpenHistoryEntry}
        />
      ) : null}
      <AlertDialog open={Boolean(chatPendingDelete)} onOpenChange={(open) => { if (!open) setChatPendingDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-[#fbe2e8] text-[#ad3150]">
              <Trash2 className="size-5" />
            </span>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              “{chatPendingDelete?.title}” and all of its strategy and content history will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep chat</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDeleteChat()}>Delete chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
