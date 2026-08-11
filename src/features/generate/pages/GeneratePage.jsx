import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  AtSign,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  DollarSign,
  ExternalLink,
  Folder,
  Globe2,
  Hash,
  HelpCircle,
  History,
  Image as ImageIcon,
  Lightbulb,
  Layers3,
  ListChecks,
  Loader2,
  LogOut,
  Map as MapIcon,
  Megaphone,
  MessageSquare,
  MessageCircleMore,
  MoreHorizontal,
  MousePointerClick,
  Music2,
  PackageSearch,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Trash2,
  Users,
  Video,
  Volume2,
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
  contentWorkflowInputSchema,
  marketingStrategyInputSchema,
  marketingStrategyOutputSchema,
  BRAND_VOICE_PRESETS,
  CAMPAIGN_GOAL_OPTIONS,
  DURATION_OPTIONS,
  PLATFORM_OPTIONS,
} from '../schema/campaignSchema'
import {
  cancelContent,
  cancelStrategy,
  createChat,
  createProject,
  deleteChat,
  deleteProject,
  getChatHistory,
  listChats,
  listProjects,
  listStrategyReviews,
  renameChat,
  renameProject,
  regenerateStrategySection,
  reviewStrategy,
  startContent,
  startStrategy,
  subscribeToWorkflow,
  waitForContent,
  waitForStrategy,
} from '@/lib/campaignApi'
import { ProjectIcon, forgetProjectAppearance, saveProjectAppearance } from '@/lib/projectAppearance'
import ProjectAppearanceModal from '../components/ProjectAppearanceModal'
import { PlatformLogo, getPlatformBrandColor, hasPlatformLogo } from '@/lib/platformBrands'

const PLATFORM_ICONS = {
  instagram: Camera,
  x: AtSign,
  linkedin: BriefcaseBusiness,
  facebook: Users,
  tiktok: Music2,
  youtube_shorts: Video,
}

const REGENERATABLE_STRATEGY_TABS = {
  personas: { section: 'personas', label: 'personas' },
  journey: { section: 'buyerJourney', label: 'buyer journey' },
  objectives: { section: 'smartObjectives', label: 'objectives' },
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
  { id: 'plan-quality-gate', label: 'Quality check', description: 'Audits the plan for evidence, gaps, and assumptions.' },
]

const EMPTY_PROJECT = { id: '', name: 'Campaign workspace', color: '#d0bcff', historyCount: 0 }

function getEvidenceDomain(source) {
  const publisher = String(source?.publisher ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]

  try {
    return new URL(source?.url).hostname.replace(/^www\./, '') || publisher || 'Source'
  } catch {
    return publisher || 'Source'
  }
}

function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[11px] bg-[#381e72] text-white shadow-[0_5px_14px_rgba(56,30,114,0.25)]">
      <span className="absolute -right-1 -top-2 size-5 rounded-full bg-[#b7f36b]" />
      <Sparkles className="relative size-[18px]" strokeWidth={2.2} />
    </span>
  )
}

function LoadingRing({ className = 'size-4' }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden="true">
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-25" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current" />
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
      <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Sada home">
        <BrandMark />
        <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
          Sada
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
                  <p className="truncate text-sm font-semibold text-[#201a25]">{user?.name || 'Sada user'}</p>
                  {user?.email ? <p className="mt-0.5 truncate text-xs text-[#7b7180]">{user.email}</p> : null}
                </div>
                <div className="my-1 h-px bg-[#e7dfe9]" />
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-[#514759] transition-colors hover:bg-[#f1eaf4] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094]"
                >
                  <Settings className="size-[17px]" />
                  Settings
                </Link>
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
  onEditProject,
  onDeleteProject,
  onSelectChat,
  onRenameChat,
  onNewChat,
  onDeleteChat,
  onOpenHistory,
  historyOpen,
  isOpen,
  onToggle,
}) {
  const [expandedProjectIds, setExpandedProjectIds] = useState([])
  const [collapsedProjectIds, setCollapsedProjectIds] = useState([])
  const [chatsByProjectId, setChatsByProjectId] = useState({})
  const [editingProjectId, setEditingProjectId] = useState('')
  const [editingChatId, setEditingChatId] = useState('')
  const [openProjectMenuId, setOpenProjectMenuId] = useState('')
  const [openChatMenuId, setOpenChatMenuId] = useState('')
  const [projectNameDraft, setProjectNameDraft] = useState('')
  const [chatTitleDraft, setChatTitleDraft] = useState('')
  const cancelRenameRef = useRef(false)
  const cancelChatRenameRef = useRef(false)
  const projectMenuRef = useRef(null)
  const chatMenuRef = useRef(null)

  const cacheActiveChats = () => {
    if (!activeProject) return
    setChatsByProjectId((current) => ({ ...current, [activeProject]: chats }))
  }

  const keepActiveProjectOpen = () => {
    if (!activeProject || collapsedProjectIds.includes(activeProject)) return
    setExpandedProjectIds((current) => current.includes(activeProject) ? current : [...current, activeProject])
  }

  useEffect(() => {
    if (!openProjectMenuId && !openChatMenuId) return undefined

    const closeMenu = (event) => {
      const clickedOutside = event.type === 'pointerdown'
        && !projectMenuRef.current?.contains(event.target)
        && !chatMenuRef.current?.contains(event.target)
      if (event.key === 'Escape' || clickedOutside) {
        setOpenProjectMenuId('')
        setOpenChatMenuId('')
      }
    }

    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeMenu)
    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeMenu)
    }
  }, [openProjectMenuId, openChatMenuId])

  const selectProject = (project) => {
    cacheActiveChats()
    const openActiveProject = activeProject && !collapsedProjectIds.includes(activeProject) ? [activeProject] : []
    setExpandedProjectIds((current) => [...new Set([...current, ...openActiveProject, project.id])])
    setCollapsedProjectIds((current) => current.filter((projectId) => projectId !== project.id))
    onSelect(project.id)
  }

  const toggleProject = (project) => {
    const isExpanded = expandedProjectIds.includes(project.id)
      || (project.id === activeProject && !collapsedProjectIds.includes(project.id))
    if (isExpanded) {
      setExpandedProjectIds((current) => current.filter((projectId) => projectId !== project.id))
      setCollapsedProjectIds((current) => current.includes(project.id) ? current : [...current, project.id])
    } else {
      cacheActiveChats()
      const openActiveProject = activeProject && !collapsedProjectIds.includes(activeProject) ? [activeProject] : []
      setExpandedProjectIds((current) => [...new Set([...current, ...openActiveProject, project.id])])
      setCollapsedProjectIds((current) => current.filter((projectId) => projectId !== project.id))
    }
    if (!isExpanded && project.id !== activeProject && !chatsByProjectId[project.id]) {
      onSelect(project.id)
    }
  }

  const openProjectSection = (project) => {
    if (project.id === activeProject) {
      toggleProject(project)
      return
    }
    selectProject(project)
  }

  const createProjectFromSidebar = async () => {
    cacheActiveChats()
    keepActiveProjectOpen()
    await onNewProject()
  }

  const createChatInProject = (projectId) => {
    cacheActiveChats()
    if (projectId !== activeProject) keepActiveProjectOpen()
    onNewChat(projectId)
  }

  const selectChat = (chatId, projectId) => {
    if (projectId !== activeProject) {
      cacheActiveChats()
      keepActiveProjectOpen()
    }
    onSelectChat(chatId, projectId)
  }

  const requestDeleteChat = (chat, projectId) => {
    if (projectId !== activeProject) {
      cacheActiveChats()
      keepActiveProjectOpen()
    }
    onDeleteChat(chat, projectId)
  }

  const beginRename = (project) => {
    setOpenProjectMenuId('')
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

  const beginChatRename = (chat) => {
    setOpenChatMenuId('')
    cancelChatRenameRef.current = false
    setChatTitleDraft(chat.title)
    setEditingChatId(chat.id)
  }

  const commitChatRename = async (chat, projectId) => {
    if (cancelChatRenameRef.current) {
      cancelChatRenameRef.current = false
      return
    }
    const nextTitle = chatTitleDraft.trim()
    setEditingChatId('')
    if (!nextTitle || nextTitle === chat.title) return
    const renamed = await onRenameChat(chat, nextTitle, projectId)
    if (renamed === false) {
      setEditingChatId(chat.id)
      return
    }
    setChatsByProjectId((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).map((item) => item.id === chat.id ? renamed : item),
    }))
  }

  if (!isOpen) {
    return (
      <aside className="hidden w-[52px] shrink-0 flex-col items-center border-r border-[#ecebef] bg-white pt-2 lg:flex">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Open projects sidebar"
          title="Open projects sidebar"
          className="flex size-10 items-center justify-center rounded-lg text-[#6b6577] transition-colors hover:bg-[#f4f3f6] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <PanelLeftOpen className="size-[18px]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="hidden w-[268px] shrink-0 flex-col border-r border-[#ecebef] bg-white px-2 pb-3 pt-2 lg:flex">
      <div className="flex h-10 items-center justify-end">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close projects sidebar"
          title="Close projects sidebar"
          className="flex size-10 items-center justify-center rounded-lg text-[#6b6577] transition-colors hover:bg-[#f4f3f6] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <PanelLeftClose className="size-[18px]" />
        </button>
      </div>

      <nav className="mt-1 space-y-0.5" aria-label="Workspace navigation">
        <button className="flex h-9 w-full items-center gap-2.5 rounded-lg bg-[#f4f2f7] px-2.5 text-[13px] font-semibold text-[#201a25]" type="button">
          <Folder className="size-[17px] text-[#4f378a]" /> Projects
        </button>
        <button onClick={onOpenHistory} className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors ${historyOpen ? 'bg-[#f4f2f7] font-semibold text-[#201a25]' : 'font-medium text-[#4a4453] hover:bg-[#f7f6f9]'}`} type="button">
          <History className="size-[17px] text-[#8b8494]" /> Chat history
        </button>
      </nav>

      <div className="mt-5 flex min-h-8 items-center justify-between pl-2.5 pr-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a94a3]">Your projects</p>
        <button
          type="button"
          onClick={createProjectFromSidebar}
          aria-label="Create new project"
          title="Create new project"
          className="flex size-7 items-center justify-center rounded-md text-[#6b6577] transition-colors hover:bg-[#f4f2f7] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="mt-1 min-h-0 flex-1 overflow-y-auto pb-3 pr-0.5 [scrollbar-gutter:stable]">
        {projects.map((project) => {
          const isActive = project.id === activeProject
          const isExpanded = expandedProjectIds.includes(project.id)
            || (isActive && !collapsedProjectIds.includes(project.id))
          const projectChats = isActive ? chats : (chatsByProjectId[project.id] ?? [])
          return (
            <div key={project.id} className="group/project mt-3 first:mt-0">
              <div className="relative flex min-h-8 items-center gap-0.5 rounded-md pl-2.5 pr-0.5">
                {editingProjectId === project.id ? (
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
                    className="h-8 min-w-0 flex-1 rounded-md border border-[#c8bcd8] bg-white px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#201a25] outline-none ring-2 ring-[#ece4f5] selection:bg-[#e2d6f4]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => openProjectSection(project)}
                    aria-expanded={isExpanded}
                    aria-current={isActive ? 'true' : undefined}
                    title={project.name}
                    className="flex min-w-0 flex-1 items-center gap-1.5 self-stretch rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                  >
                    <ProjectIcon iconId={project.iconId} className="size-[15px] shrink-0" style={{ color: project.color }} aria-hidden="true" />
                    <span className={`min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${isActive ? 'text-[#4f378a]' : 'text-[#9a94a3] group-hover/project:text-[#6b6577]'}`}>
                      {project.name}
                    </span>
                    <ChevronDown className={`size-3 shrink-0 text-[#b8b2c0] transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} aria-hidden="true" />
                  </button>
                )}

                {editingProjectId !== project.id ? (
                  <div className={`flex shrink-0 items-center transition-opacity ${openProjectMenuId === project.id ? 'opacity-100' : 'opacity-0 group-hover/project:opacity-100 group-focus-within/project:opacity-100'}`}>
                    <button
                      type="button"
                      onClick={() => createChatInProject(project.id)}
                      aria-label={`Create chat in ${project.name}`}
                      title="New chat"
                      className="flex size-7 items-center justify-center rounded-md text-[#6b6577] transition-colors hover:bg-[#f4f2f7] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                    >
                      <Plus className="size-3.5" />
                    </button>
                    <div ref={openProjectMenuId === project.id ? projectMenuRef : undefined} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenChatMenuId('')
                          setOpenProjectMenuId((current) => current === project.id ? '' : project.id)
                        }}
                        aria-label={`More actions for ${project.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openProjectMenuId === project.id}
                        className="flex size-7 items-center justify-center rounded-md text-[#6b6577] transition-colors hover:bg-[#f4f2f7] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                      {openProjectMenuId === project.id ? (
                        <div role="menu" aria-label={`Actions for ${project.name}`} className="absolute right-0 top-[calc(100%+4px)] z-30 w-40 overflow-hidden rounded-xl border border-[#e7e4ec] bg-white p-1 shadow-[0_10px_30px_rgba(32,26,37,0.12)]">
                          <button type="button" role="menuitem" onClick={() => beginRename(project)} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-medium text-[#4a4453] transition-colors hover:bg-[#f4f2f7] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"><Pencil className="size-3.5" /> Rename project</button>
                          <button type="button" role="menuitem" onClick={() => { setOpenProjectMenuId(''); onEditProject(project) }} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-medium text-[#4a4453] transition-colors hover:bg-[#f4f2f7] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"><Palette className="size-3.5" /> Icon &amp; colour</button>
                          <button type="button" role="menuitem" onClick={() => { setOpenProjectMenuId(''); onDeleteProject(project) }} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-medium text-[#ad3150] transition-colors hover:bg-[#fdf0f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150]"><Trash2 className="size-3.5" /> Delete project</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {isExpanded ? (
                <div className="mt-0.5 space-y-px">
                  {projectChats.map((chat) => {
                    const selected = isActive && chat.id === activeChat
                    return (
                      <div
                        key={chat.id}
                        className={`group/chat relative rounded-lg transition-colors ${selected ? 'bg-[#f1eef6]' : 'hover:bg-[#f7f6f9]'}`}
                      >
                        {editingChatId === chat.id ? (
                          <div className="flex min-h-9 items-center px-1.5">
                            <input
                              autoFocus
                              value={chatTitleDraft}
                              onChange={(event) => setChatTitleDraft(event.target.value)}
                              onFocus={(event) => event.currentTarget.select()}
                              onBlur={() => void commitChatRename(chat, project.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') event.currentTarget.blur()
                                if (event.key === 'Escape') {
                                  cancelChatRenameRef.current = true
                                  setEditingChatId('')
                                  event.currentTarget.blur()
                                }
                              }}
                              maxLength={120}
                              aria-label={`New name for ${chat.title}`}
                              className="h-8 min-w-0 flex-1 rounded-md border border-[#c8bcd8] bg-white px-2 text-[13px] font-medium text-[#201a25] outline-none ring-2 ring-[#ece4f5]"
                            />
                          </div>
                        ) : (
                          <button type="button" onClick={() => selectChat(chat.id, project.id)} aria-current={selected ? 'page' : undefined} className="flex min-h-9 w-full items-center rounded-lg pl-2.5 pr-9 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                            <span className={`min-w-0 flex-1 truncate text-[13px] ${selected ? 'font-semibold text-[#201a25]' : 'font-medium text-[#4a4453]'}`} title={chat.title}>{chat.title}</span>
                          </button>
                        )}
                        {editingChatId !== chat.id ? (
                          <div ref={openChatMenuId === chat.id ? chatMenuRef : undefined} className={`absolute right-1 top-1/2 z-20 -translate-y-1/2 transition-opacity ${openChatMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover/chat:opacity-100 group-focus-within/chat:opacity-100'}`}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenProjectMenuId('')
                                setOpenChatMenuId((current) => current === chat.id ? '' : chat.id)
                              }}
                              aria-label={`More actions for ${chat.title}`}
                              aria-haspopup="menu"
                              aria-expanded={openChatMenuId === chat.id}
                              className="flex size-7 items-center justify-center rounded-md text-[#6b6577] transition-colors hover:bg-[#eae7f0] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                            {openChatMenuId === chat.id ? (
                              <div role="menu" aria-label={`Actions for ${chat.title}`} className="absolute right-0 top-[calc(100%+4px)] z-40 w-40 overflow-hidden rounded-xl border border-[#e7e4ec] bg-white p-1 shadow-[0_10px_30px_rgba(32,26,37,0.12)]">
                                <button type="button" role="menuitem" onClick={() => beginChatRename(chat)} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-medium text-[#4a4453] transition-colors hover:bg-[#f4f2f7] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"><Pencil className="size-3.5" /> Rename chat</button>
                                <button type="button" role="menuitem" onClick={() => { setOpenChatMenuId(''); requestDeleteChat(chat, project.id) }} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-medium text-[#ad3150] transition-colors hover:bg-[#fdf0f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150]"><Trash2 className="size-3.5" /> Delete chat</button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  {projectChats.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => createChatInProject(project.id)}
                      className="flex min-h-9 w-full items-center gap-2 rounded-lg pl-2.5 pr-2 text-left text-[13px] font-medium text-[#9a94a3] transition-colors hover:bg-[#f7f6f9] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                    >
                      <Plus className="size-3.5 shrink-0" /> Start the first chat
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
        {projects.length === 0 ? (
          <div className="px-2.5 py-6 text-center">
            <Folder className="mx-auto size-5 text-[#b8b2c0]" />
            <p className="mt-2 text-xs font-medium text-[#6b6577]">No projects yet</p>
            <button type="button" onClick={createProjectFromSidebar} className="mt-1.5 text-xs font-semibold text-[#4f378a] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">Create your first project</button>
          </div>
        ) : null}
      </div>

      <div className="mt-auto border-t border-[#f0eef2] px-2.5 pt-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#201a25]">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#eee9f6] text-[#4f378a]">
            <Sparkles className="size-3" />
          </span>
          Pro workspace
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#f0eef2]">
          <div className="h-full w-[64%] rounded-full bg-[#4f378a]" />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-[#9a94a3]">6,420 of 10,000 words used</p>
        <button type="button" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#4f378a] hover:underline">
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

const CAMPAIGN_FORM_STEPS = [
  {
    id: 'basics',
    label: 'Basics',
    title: 'Tell us about the campaign',
    description: 'Start with the brand and the offer you want to bring to market.',
    isComplete: (values) => [values.brandName, values.product, values.industry, values.businessType].every((value) => value.trim()),
  },
  {
    id: 'audience',
    label: 'Audience',
    title: 'Who should this reach?',
    description: 'Set the campaign goal and describe the people you want to move.',
    isComplete: (values) => Boolean(values.campaignGoal && values.targetAudience.trim()),
  },
  {
    id: 'voice',
    label: 'Voice',
    title: 'Shape the campaign voice',
    description: 'Choose how the brand should sound and how often it should appear.',
    isComplete: (values) => Boolean(values.brandVoice.trim() && values.duration && Number(values.postsPerWeek) > 0),
  },
  {
    id: 'channels',
    label: 'Channels',
    title: 'Choose where it goes',
    description: 'Select publishing channels and add any final guidance for the team.',
    isComplete: (values) => values.platforms.length > 0,
  },
]

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

const TEST_VALUES = {
  brandName: 'Shark & Sprout',
  product: 'Playful baby t-shirts with cheerful shark illustrations, made from soft organic cotton for everyday adventures.',
  industry: 'Children’s apparel',
  businessType: 'Direct-to-consumer',
  pricing: '$28 per t-shirt or $72 for a three-pack, with free shipping over $50',
  campaignGoal: 'launch',
  targetAudience: 'Style-conscious parents and gift buyers, ages 25–40, shopping for children ages 0–5',
  brandVoice: 'playful, upbeat, reassuring',
  voicePreset: 'playful',
  platforms: ['instagram', 'tiktok', 'facebook'],
  duration: '2 weeks',
  postsPerWeek: 4,
  generateImages: true,
  keyMessagesText: 'Soft organic cotton for all-day comfort\nMade for tiny explorers and big imaginations\nEasy giftable three-packs for growing wardrobes',
  constraints: 'Avoid fear-based language and do not make unverified sustainability claims.',
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

function firstNonBlankString(...candidates) {
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() ?? ''
}

function buildContentWorkflowInput(values, strategy, projectName) {
  const strategyProduct = strategy?.product
  const campaignStrategy = strategy?.campaignStrategy

  return {
    brandName: firstNonBlankString(values?.brandName, strategyProduct?.name, projectName),
    product: firstNonBlankString(
      values?.product,
      strategyProduct?.valueProposition,
      strategyProduct?.name,
      campaignStrategy?.summary,
    ),
    targetAudience: firstNonBlankString(
      values?.targetAudience,
      campaignStrategy?.audienceStrategy?.primaryAudience,
    ),
    platforms: Array.isArray(values?.platforms) && values.platforms.length
      ? values.platforms
      : EMPTY_VALUES.platforms,
    duration: firstNonBlankString(values?.duration, EMPTY_VALUES.duration),
    postsPerWeek: Number.isInteger(values?.postsPerWeek) && values.postsPerWeek > 0
      ? values.postsPerWeek
      : EMPTY_VALUES.postsPerWeek,
    generateImages: values?.generateImages !== false,
    requireApproval: false,
  }
}

function CampaignForm({ values, setValues, errors, onGenerate, onFillTestData, isGenerating, isLocked = false, initiallyOpen = false, onRequestClose, isModal = false }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [currentStep, setCurrentStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const set = (patch) => setValues((current) => ({ ...current, ...patch }))
  const stepCompletion = CAMPAIGN_FORM_STEPS.map((step) => Boolean(step.isComplete(values)))
  const currentStepData = CAMPAIGN_FORM_STEPS[currentStep]
  const currentStepComplete = stepCompletion[currentStep]
  const isLastStep = currentStep === CAMPAIGN_FORM_STEPS.length - 1

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

  const fillWithTestData = () => {
    onFillTestData()
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
              disabled={!currentStepComplete || isGenerating}
              className="group relative flex h-12 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#381e72] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)] transition-all hover:bg-[#4f378a] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
            >
              <span className="absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-96" />
              {isLastStep ? (isGenerating ? <LoadingRing className="size-[17px] text-[#d8ff9d]" /> : <Wand2 className="size-[17px] text-[#d8ff9d]" />) : null}
              {isLastStep ? (isGenerating ? 'Building…' : 'Build strategy') : <>Next <ChevronRight className="size-4" /></>}
            </button>
          </div>
          {!currentStepComplete ? <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">Complete the required fields above to continue.</p> : <p className="mt-2.5 text-center text-[11px] text-[#8b818f]">{isLastStep ? 'Strategy first. Posts begin only after your approval.' : 'Your progress is saved as you move between steps.'}</p>}
        </div>
        </fieldset>
      </form>
    </section>
  )
}

function CampaignFormModal({ open, onClose, chatKey, ...formProps }) {
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

function PostArtwork({ gradient, imageUrl, label, brandName, platform }) {
  const canRenderImage = typeof imageUrl === 'string' && /^(https?:|data:image\/|blob:)/i.test(imageUrl)
  return (
    <div role="img" aria-label={label} className={`relative aspect-[4/3] min-h-60 overflow-hidden rounded-2xl ${canRenderImage ? '' : `bg-gradient-to-br ${gradient}`}`}>
      {canRenderImage ? (
        <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="absolute -right-8 -top-8 size-36 rounded-full border border-white/35 bg-white/10" />
      <div className="absolute bottom-[-52px] left-[-38px] size-44 rounded-full bg-[#201a25]/20 blur-sm" />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            {platform}
          </span>
          <span className="font-display text-[28px] leading-none tracking-tight text-white drop-shadow-sm">
            {brandName || 'Your brand'}
          </span>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-[#201a25]/15 backdrop-blur-md">
          <Sparkles className="size-[18px] text-white" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function PostCard({ post, index, showImage, brandName, onCaptionChange }) {
  const [copied, setCopied] = useState(false)
  const [draftCaption, setDraftCaption] = useState(post.caption ?? '')
  const captionRef = useRef(null)
  const platformLabel = PLATFORM_OPTIONS.find((option) => option.id === post.platform)?.label ?? post.platform
  const Icon = PLATFORM_ICONS[post.platform]
  const gradient = ART_GRADIENTS[index % ART_GRADIENTS.length]

  useEffect(() => {
    const textarea = captionRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [draftCaption])

  const copyPost = async () => {
    const value = [draftCaption, post.hashtags?.length ? post.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ') : '', post.cta]
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
    <article className="overflow-hidden rounded-[24px] border border-[#d8cedc] bg-[#fffaff] shadow-[0_12px_32px_rgba(46,32,51,0.06)] transition-shadow duration-200 hover:shadow-[0_18px_42px_rgba(46,32,51,0.09)]">
      <header className="flex min-h-16 items-center gap-3 border-b border-[#e5dee7] px-4 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e6fbc7] text-xs font-bold tabular-nums text-[#315016]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {platformLabel}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#807586]">
            <CalendarDays className="size-3.5" aria-hidden="true" /> {post.date || 'Schedule pending'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#f3f9e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#456321] sm:flex">
            <span className="size-1.5 rounded-full bg-[#6d9d2d]" /> Ready
          </span>
          <button
            type="button"
            onClick={copyPost}
            aria-label={`Copy post ${index + 1}`}
            className="flex h-11 items-center gap-2 rounded-xl border border-[#ded4e2] bg-white px-3.5 text-xs font-semibold text-[#554c5b] transition-colors hover:border-[#bbaac5] hover:bg-[#f8f3f8] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            <span>{copied ? 'Copied' : 'Copy post'}</span>
          </button>
        </div>
      </header>

      <div className={`grid gap-1 p-4 sm:p-5 ${showImage ? 'md:grid-cols-[minmax(260px,0.76fr)_minmax(0,1.24fr)] md:gap-5' : ''}`}>
        {showImage ? (
          <PostArtwork
            gradient={gradient}
            imageUrl={post.imageUrl}
            label={post.visualPrompt || `Campaign visual for ${brandName}`}
            brandName={brandName}
            platform={platformLabel}
          />
        ) : null}
        <div className={`${showImage ? 'pt-5 md:pt-1' : ''} min-w-0`}>
          <div className="mb-2.5 flex items-end justify-between gap-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#746a7a]" htmlFor={`post-caption-${index}`}>
              Caption
            </label>
            <span id={`post-caption-count-${index}`} className="text-[11px] tabular-nums text-[#8a7f90]">{draftCaption.length} characters</span>
          </div>
          <textarea
            ref={captionRef}
            id={`post-caption-${index}`}
            rows={3}
            value={draftCaption}
            onChange={(event) => setDraftCaption(event.target.value)}
            onBlur={() => onCaptionChange(index, draftCaption)}
            aria-describedby={`post-caption-count-${index} post-caption-help-${index}`}
            className="min-h-28 w-full resize-none overflow-hidden rounded-2xl border border-[#ddd3e1] bg-[#fbf8fb] px-4 py-3.5 text-base leading-7 text-[#423a47] outline-none transition-colors placeholder:text-[#aaa1ae] focus:border-[#6b4c9a] focus:bg-white focus:ring-3 focus:ring-[#4f378a]/10 sm:text-[15px]"
          />
          <p id={`post-caption-help-${index}`} className="mt-1.5 text-[11px] text-[#8a7f90]">Your edit saves when you leave this field.</p>

          {post.hashtags?.length ? (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#817686]"><Hash className="size-3.5" aria-hidden="true" /> Hashtags</p>
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`Hashtags for post ${index + 1}`}>
                {post.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#ded4e2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#4f378a]">#{tag.replace(/^#/, '')}</span>
                ))}
              </div>
            </div>
          ) : null}

          {post.cta ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e3d9e6] bg-[#f3edf5] p-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4f378a] shadow-sm"><MousePointerClick className="size-4" aria-hidden="true" /></span>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#817686]">Call to action</p><p className="mt-1 text-sm font-semibold text-[#4f378a]">{post.cta}</p></div>
            </div>
          ) : null}

          {showImage && post.visualPrompt ? (
            <details className="group mt-4 rounded-xl border border-[#e6dee8] bg-white">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold text-[#62566b] transition-colors hover:bg-[#faf7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] [&::-webkit-details-marker]:hidden">
                View visual direction
                <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="border-t border-[#ece4ee] px-3.5 py-3 text-xs leading-5 text-[#7b7081]">{post.visualPrompt}</p>
            </details>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function StrategySummary({ strategy }) {
  if (!strategy) return null
  const tones = strategy.tonePerPlatform ? Object.entries(strategy.tonePerPlatform) : []

  return (
    <section id="campaign-strategy" className="overflow-hidden rounded-[24px] border border-[#e6dee8] bg-[#fffaff] shadow-[0_14px_35px_rgba(46,32,51,0.05)]">
      <div className="px-6 pt-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e6fbc7] text-[#315016]">
            <Lightbulb className="size-[17px]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8090]">Campaign strategy</p>
            <h3 className="font-display text-[21px] leading-tight tracking-[-0.35px] text-[#201a25]">The idea behind the work</h3>
          </div>
        </div>
        <p className="mt-5 font-display text-[21px] leading-[1.5] tracking-[-0.2px] text-[#34283a] sm:text-[23px]">
          {strategy.coreNarrative}
        </p>
      </div>

      {Array.isArray(strategy.contentPillars) && strategy.contentPillars.length > 0 ? (
        <div className="mt-7 border-t border-[#efe9f0] px-6 py-6 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Content pillars</h4>
          <ol className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {strategy.contentPillars.map((pillar, index) => (
              <li key={`${pillar.name}-${index}`} className="flex gap-3">
                <span className="pt-px text-[12px] font-semibold tabular-nums text-[#b3a6bb]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug text-[#201a25]">{pillar.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#6f6475]">{pillar.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {tones.length > 0 ? (
        <div className="border-t border-[#efe9f0] px-6 py-6 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Voice by channel</h4>
          <dl className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {tones.map(([platform, tone]) => {
              const label = PLATFORM_OPTIONS.find((option) => option.id === platform)?.label ?? platform
              const brand = getPlatformBrandColor(platform)
              return (
                <div key={platform} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-px flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold uppercase"
                    style={{ backgroundColor: `${brand}14`, color: brand }}
                  >
                    {hasPlatformLogo(platform)
                      ? <PlatformLogo platform={platform} className="size-[15px]" />
                      : label.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[13px] font-semibold leading-snug text-[#201a25]">{label}</dt>
                    <dd className="mt-0.5 text-[13px] leading-[1.6] text-[#6f6475]">{tone}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}

      {strategy.rationale ? (
        <div className="border-t border-[#efe9f0] bg-[#faf7fb] px-6 py-5 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Why this works</h4>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-[#6f6475]">{strategy.rationale}</p>
        </div>
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
      className="strategy-agent-panel overflow-hidden rounded-[22px] border shadow-[0_12px_32px_rgba(46,32,51,0.06)]"
    >
      <div className="strategy-overview-hero relative overflow-hidden border-b px-5 py-6 sm:px-7 sm:py-7">
        <div className="strategy-hero-orb absolute -right-10 -top-20 size-64 rounded-full border blur-[1px]" />
        <div className="strategy-hero-ring absolute -bottom-28 right-24 size-52 rounded-full border" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="strategy-agent-eyebrow mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em]">
              <Sparkles className="size-3.5" /> Strategy ready for review
            </div>
            <h3 className="strategy-agent-title font-display text-[32px] leading-[1.02] tracking-[-0.8px] sm:text-[40px]">A point of view worth building from.</h3>
            <p className="strategy-agent-description mt-3 max-w-xl text-sm leading-6">{campaign.summary}</p>
          </div>
          <div className="strategy-quality-score flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm">
            <div className="strategy-score-value flex size-12 items-center justify-center rounded-full border text-lg font-bold">
              {quality.score ?? '--'}
            </div>
            <div>
              <p className="strategy-agent-description text-[10px] font-bold uppercase tracking-[0.14em]">Plan quality</p>
              <p className="strategy-agent-title mt-0.5 text-sm font-semibold capitalize">{String(quality.status ?? 'review')}</p>
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

const JOURNEY_STAGES = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'consideration', label: 'Consideration' },
  { id: 'decision', label: 'Decision' },
  { id: 'retention', label: 'Retention' },
  { id: 'advocacy', label: 'Advocacy' },
]

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

function EditableText({ label, value, onChange, multiline = false, rows = 3, helper }) {
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

function EditableList({ label, values, onChange, helper = 'One item per line', rows }) {
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

function AgentTabPanel({ eyebrow, title, description, icon: Icon = Sparkles, bodyClassName = '', children }) {
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

function StrategyFieldGroup({ title, description, icon: Icon, children }) {
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

function ExpandableEditor({ eyebrow, title, meta, icon: Icon = Pencil, defaultOpen = false, children }) {
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

function ReadOnlyList({ label, values, icon: HeaderIcon = ListChecks, itemIcon: ItemIcon = Check, tone = 'default' }) {
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

function QualityMetricCard({ icon: Icon, value, label, description, tone = 'accent', progress }) {
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

function StrategyReview({ strategy, strategyId, review, onConfirm, onRequestChanges, onRegenerateSection, onEdit, onStrategyChange, isSubmitting }) {
  const [activeTab, setActiveTab] = useState('overview')
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
  const regeneratableSection = REGENERATABLE_STRATEGY_TABS[activeTab]
  const activeTabConfig = STRATEGY_AGENT_TABS.find((tab) => tab.id === activeTab) ?? STRATEGY_AGENT_TABS[0]
  const activeTabIndex = STRATEGY_AGENT_TABS.findIndex((tab) => tab.id === activeTab)
  const qualityScoreNumber = quality.score === null || quality.score === undefined ? Number.NaN : Number(quality.score)
  const qualityScore = Number.isFinite(qualityScoreNumber) ? Math.max(0, Math.min(100, qualityScoreNumber)) : null
  const qualityIssues = Array.isArray(quality.issues) ? quality.issues : []
  const qualityAssumptions = Array.isArray(quality.assumptionRegister) ? quality.assumptionRegister : []
  const qualityNextDecisions = Array.isArray(quality.nextDecisions) ? quality.nextDecisions : []
  const qualityEvidenceSources = Array.isArray(quality.evidenceSources) ? quality.evidenceSources : []
  const qualityIssueCount = qualityIssues.length
  const qualityStatusLabel = String(quality.status ?? 'Review needed')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())

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

  const handleTabKeyDown = (event) => {
    const tabButtons = Array.from(event.currentTarget.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]') ?? [])
    const currentIndex = tabButtons.indexOf(event.currentTarget)
    if (currentIndex < 0) return

    let nextIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabButtons.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabButtons.length - 1
    else return

    event.preventDefault()
    const nextButton = tabButtons[nextIndex]
    setActiveTab(nextButton.dataset.tabId)
    nextButton.focus()
  }

  const renderTab = () => {
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

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="strategy-review strategy-review-shell overflow-hidden rounded-[24px] border border-border shadow-[0_18px_45px_rgba(46,32,51,0.09)] lg:overflow-visible">
      <div className="grid items-start lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="strategy-tab-rail border-b border-border p-3 sm:p-4 lg:sticky lg:top-4 lg:z-10 lg:m-4 lg:mr-0 lg:self-start lg:rounded-2xl lg:border lg:p-3.5 lg:shadow-[0_8px_24px_rgba(46,32,51,0.08)]">
          <div className="mb-3 hidden px-1.5 lg:block">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Strategy workspace</p>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{activeTabIndex + 1}/{STRATEGY_AGENT_TABS.length}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Review the plan in order, then approve.</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true"><span className="strategy-nav-progress block h-full rounded-full" style={{ width: `${((activeTabIndex + 1) / STRATEGY_AGENT_TABS.length) * 100}%` }} /></div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 lg:flex lg:flex-col" role="tablist" aria-label="Strategy sections">
            {STRATEGY_AGENT_TABS.map(({ id, label, shortLabel, description, icon: Icon }) => {
              const selected = activeTab === id
              return (
                <button
                  key={id}
                  id={`strategy-tab-${id}`}
                  data-tab-id={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`strategy-panel-${id}`}
                  aria-label={label}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(id)}
                  onKeyDown={handleTabKeyDown}
                  className={`strategy-tab flex min-h-[66px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center transition duration-200 lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-left ${selected ? 'is-active' : ''}`}
                >
                  <span className="strategy-tab-icon flex size-8 shrink-0 items-center justify-center rounded-lg"><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-semibold sm:text-xs lg:text-[13px]">{shortLabel}</span>
                    <span className="mt-0.5 hidden truncate text-[10px] lg:block">{description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div id={`strategy-panel-${activeTab}`} role="tabpanel" aria-labelledby={`strategy-tab-${activeTab}`} aria-label={activeTabConfig.label} className="min-w-0 p-3 sm:p-5 lg:p-6">
          {renderTab()}
        </div>
      </div>

      <footer className="strategy-review-footer border-t border-border px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="strategy-ready-icon flex size-10 shrink-0 items-center justify-center rounded-xl"><Check className="size-[18px]" aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to create the campaign?</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Approve this draft now, or add feedback for another pass.</p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onEdit} disabled={isSubmitting} className="strategy-secondary-action flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:opacity-50"><Pencil className="size-4" aria-hidden="true" />Edit brief</button>
            <button type="button" onClick={() => onConfirm(reviewNote)} disabled={isSubmitting} className="strategy-primary-action flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <LoadingRing className="size-4" /> : <Wand2 className="size-4" aria-hidden="true" />}
              {isSubmitting ? 'Starting workflow…' : 'Approve & create posts'}
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

function QANotes({ notes }) {
  const safeNotes = Array.isArray(notes) ? notes : []
  const openNotes = safeNotes.filter((note) => !note.resolved)
  const icons = { info: CircleAlert, warning: AlertTriangle, error: AlertTriangle }
  const colors = {
    info: 'text-[#4f378a] bg-[#f2eafa]',
    warning: 'text-[#b25c00] bg-[#fcefd9]',
    error: 'text-[#ad3150] bg-[#fbe2e8]',
  }
  return (
    <aside id="campaign-qa" className="self-start overflow-hidden rounded-[24px] border border-[#d8cedc] bg-[#fffaff] shadow-[0_14px_35px_rgba(46,32,51,0.06)]">
      <div className="border-b border-[#e6dee8] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#e6fbc7] text-[#315016]">
            <ShieldCheck className="size-[18px]" />
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${openNotes.length > 0 ? 'bg-[#fcefd9] text-[#8a4700]' : 'bg-[#e6fbc7] text-[#315016]'}`}>
            {openNotes.length > 0 ? `${openNotes.length} open` : 'All clear'}
          </span>
        </div>
        <div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#716777]">Quality check</p>
          <h3 className="font-display text-[22px] leading-tight tracking-[-0.35px] text-[#201a25]">Before you publish</h3>
          <p className="mt-2 text-xs leading-5 text-[#716777]">Review these final checks before scheduling the campaign.</p>
        </div>
      </div>
      {safeNotes.length > 0 ? (
      <ul className="space-y-2 p-4">
        {safeNotes.map((note, index) => {
          const Icon = icons[note.severity] ?? CircleAlert
          return (
            <li key={index} className="rounded-2xl border border-[#ebe3ed] bg-[#f8f3f8] p-3.5">
              <div className="flex items-start gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${colors[note.severity] ?? colors.info}`}>
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-[#514a56]">
                  {String(note.message)}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#84798a]">
                  {note.postId ? `${note.postId} · ` : ''}{note.severity} · {note.resolved ? 'Resolved' : 'Needs review'}
                </p>
              </div>
              </div>
            </li>
          )
        })}
      </ul>
      ) : (
        <div className="p-4">
          <div className="rounded-2xl bg-[#f3f9e9] p-4 text-sm leading-6 text-[#405625]">No quality issues were found. Your campaign is ready for a final human review.</div>
        </div>
      )}
    </aside>
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
  const completedCount = visibleSteps.filter(isStepComplete).length
  // Steps can finish out of display order (QA often completes while visuals are
  // still rendering), so the connecting line follows the leading run of finished
  // steps. Keying it to each node instead leaves purple islands between grey gaps.
  const reachedIndex = visibleSteps.reduce(
    (furthest, step, index) => furthest === index - 1 && isStepComplete(step) ? index : furthest,
    -1,
  )
  const progressPercent = visibleSteps.length ? Math.round((completedCount / visibleSteps.length) * 100) : 0

  return (
    <section className="campaign-pulse overflow-hidden rounded-[22px] border border-[#d9cfe0] bg-[#fffaff] shadow-[0_10px_28px_rgba(46,32,51,0.06)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#381e72] text-[#d8ff9d] shadow-[0_6px_16px_rgba(56,30,114,0.22)]">
              <LoadingRing />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#201a25]">{workflowKind === 'strategy' ? 'Building your strategy' : 'Creating your campaign'}</p>
              <p className="mt-1 text-xs leading-5 text-[#746b79]">
                {activeLabels.length > 0 ? `Working now: ${activeLabels.join(', ')}` : 'Preparing the workflow…'}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-sm font-bold text-[#381e72]">{progressPercent}%</p>
            <p className="mt-0.5 text-[11px] text-[#817687]">{completedCount} of {visibleSteps.length} complete</p>
          </div>
        </div>

      </div>

      {/* The steps run in sequence, so they read as one left-to-right track
          rather than a wrapping grid where step 4 sits above step 5. */}
      <ol className="flex items-start overflow-x-auto border-t border-[#efe9f0] px-5 pb-5 pt-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleSteps.map((step, index) => {
          const isComplete = isStepComplete(step)
          const isActive = isStepActive(step)
          const status = isComplete ? 'Complete' : isActive ? 'Working now' : 'Waiting'
          const isLast = index === visibleSteps.length - 1
          const isTrackFilled = index <= reachedIndex
          return (
            <li
              key={step.id}
              tabIndex={0}
              aria-label={`${step.label}: ${status}. ${step.description}`}
              title={step.description}
              className="group flex min-w-[86px] flex-1 flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            >
              <div className="flex w-full items-center" aria-hidden="true">
                <span className={`h-0.5 flex-1 rounded-full transition-colors ${index === 0 ? 'bg-transparent' : isTrackFilled ? 'bg-[#4f378a]' : 'bg-[#eae4ec]'}`} />
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors ${
                    isComplete
                      ? 'bg-[#dcefc0] text-[#315016]'
                      : isActive
                        ? 'bg-[#381e72] text-[#d8ff9d] ring-4 ring-[#4f378a]/15'
                        : 'border border-[#e4dde7] bg-white text-[#a79fac]'
                  }`}
                >
                  {isComplete ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : isActive ? (
                    <LoadingRing className="size-3.5" />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span className={`h-0.5 flex-1 rounded-full transition-colors ${isLast ? 'bg-transparent' : isTrackFilled ? 'bg-[#4f378a]' : 'bg-[#eae4ec]'}`} />
              </div>
              <span className={`mt-2.5 px-1 text-center text-[11px] leading-4 transition-colors ${
                isActive
                  ? 'font-semibold text-[#381e72]'
                  : isComplete
                    ? 'font-medium text-[#4a4453]'
                    : 'font-medium text-[#a79fac]'
              }`}>
                {step.label}
              </span>
            </li>
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
  onRequestStrategyChanges,
  onRegenerateStrategySection,
  strategyReview,
  onEditStrategy,
  onStrategyChange,
  onStartCampaign,
  canStartCampaign,
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
  const openQaNotes = campaign?.notes?.filter((note) => !note.resolved).length ?? 0

  return (
    <main className="min-w-0 flex-1 bg-[#f8f3f8] lg:max-h-[calc(100dvh-64px)] lg:overflow-y-auto" id="generated-results">
      <div className={`mx-auto px-4 py-6 transition-[max-width] duration-300 sm:px-7 lg:px-8 lg:py-8 xl:px-10 ${hasStrategyReview ? 'max-w-[1380px]' : hasResults ? 'max-w-[1240px]' : 'max-w-[960px]'}`}>
        {hasResults ? (
          <header className="mb-6 overflow-hidden rounded-[28px] bg-[#2b174f] text-white shadow-[0_24px_60px_rgba(43,23,79,0.18)]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
              <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-[#d8ff9d]/20 bg-[#d8ff9d]/10" />
              <div className="pointer-events-none absolute -bottom-32 right-1/3 size-56 rounded-full border border-white/10" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                    <span>{projectName}</span>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                    <span className="font-semibold text-[#d8ff9d]">Campaign ready</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#d8ff9d] text-[#2b174f]">
                      <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8ff9d]">Generation complete</span>
                  </div>
                  <h2 className="mt-3 font-display text-[38px] leading-[0.98] tracking-[-0.9px] sm:text-[48px]">Your campaign is ready to shape.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Review the strategy, clear any QA notes, then edit or copy each post when you are ready to publish.</p>
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
                <div><dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">Posts</dt><dd className="mt-0.5 text-sm font-semibold">{totalPosts} ready</dd></div>
              </div>
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6">
                <Camera className="size-5 text-[#d8ff9d]" aria-hidden="true" />
                <div><dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">Channels</dt><dd className="mt-0.5 text-sm font-semibold">{selectedPlatforms.length} selected</dd></div>
              </div>
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r lg:px-6">
                <CalendarDays className="size-5 text-[#d8ff9d]" aria-hidden="true" />
                <div><dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">Duration</dt><dd className="mt-0.5 text-sm font-semibold">{values.duration}</dd></div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 lg:px-6">
                <ShieldCheck className="size-5 text-[#d8ff9d]" aria-hidden="true" />
                <div><dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">QA status</dt><dd className="mt-0.5 text-sm font-semibold">{openQaNotes > 0 ? `${openQaNotes} to review` : 'All clear'}</dd></div>
              </div>
            </dl>
          </header>
        ) : (
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
        )}

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
            <StrategyReview strategy={strategy} strategyId={strategyReview?.id ?? null} review={strategyReview} onConfirm={onConfirmStrategy} onRequestChanges={onRequestStrategyChanges} onRegenerateSection={onRegenerateStrategySection} onEdit={onEditStrategy} onStrategyChange={onStrategyChange} isSubmitting={false} />
          ) : hasResults ? (
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" aria-live="polite">
              <nav aria-label="Campaign sections" className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ded4e2] bg-[#fffaff] p-2 shadow-[0_6px_18px_rgba(46,32,51,0.04)]">
                <a href="#campaign-strategy" className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#f2eafa] px-3.5 text-sm font-semibold text-[#381e72] transition-colors hover:bg-[#e9def3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                  <Lightbulb className="size-4" aria-hidden="true" /> Strategy
                </a>
                <a href="#campaign-qa" className="flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-[#625b71] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                  <ShieldCheck className="size-4" aria-hidden="true" /> QA review
                </a>
                <a href="#campaign-posts" className="flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-[#625b71] transition-colors hover:bg-[#f3edf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                  <CalendarDays className="size-4" aria-hidden="true" /> Content calendar
                </a>
              </nav>

              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.75fr)]">
                <StrategySummary strategy={campaign?.strategy} />
                <QANotes notes={campaign?.notes ?? []} />
              </div>

              <section id="campaign-posts" aria-labelledby="campaign-posts-heading" className="scroll-mt-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#716777]">Content calendar</p>
                    <h3 id="campaign-posts-heading" className="mt-1 font-display text-[30px] leading-tight tracking-[-0.55px] text-[#201a25]">Review every post</h3>
                    <p className="mt-1 text-sm leading-6 text-[#716777]">Captions are editable. Changes save to this campaign automatically when you leave the field.</p>
                  </div>
                  <span className="inline-flex h-9 shrink-0 items-center self-start rounded-full border border-[#d8cedc] bg-[#fffaff] px-3 text-xs font-semibold text-[#5d5462] sm:self-auto">
                    {totalPosts} posts · {selectedPlatforms.length} channels
                  </span>
                </div>
                <div className="space-y-4">
                  {(campaign?.calendar ?? []).map((entry, index) => (
                    <PostCard
                      key={`${entry.platform}-${entry.date ?? 'unscheduled'}-${index}-${entry.caption}`}
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
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#c8bcd0] bg-[#fffaff]/70 px-6 py-20 text-center">
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
              <p className="mt-3 max-w-md text-sm leading-6 text-[#746b79]">{canStartCampaign ? 'Open the guided brief, complete each step, and review your strategy before content is created.' : 'Create or select a campaign chat to begin.'}</p>
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
  const [projectModal, setProjectModal] = useState({ open: false, project: null, defaultName: '' })
  const [activeProject, setActiveProject] = useState(() => restoredState?.activeProject ?? '')
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(() => restoredState?.activeChat ?? '')
  const [campaign, setCampaign] = useState(() => restoredState?.campaign ?? null)
  const [strategy, setStrategy] = useState(() => restoredState?.strategy ?? null)
  const [strategyReview, setStrategyReview] = useState(() => restoredState?.strategyReview ?? null)
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
  const [canceling, setCanceling] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [briefOpen, setBriefOpen] = useState(false)
  const [mobileRenameOpen, setMobileRenameOpen] = useState(false)
  const [mobileProjectName, setMobileProjectName] = useState('')
  const [projectPendingDelete, setProjectPendingDelete] = useState(null)
  const [chatPendingDelete, setChatPendingDelete] = useState(null)
  const abortRef = useRef(null)
  const navigationEpochRef = useRef(0)
  const sseHealthyRef = useRef(false)
  const cancelMobileRenameRef = useRef(false)

  const currentProject = projects.find((project) => project.id === activeProject) ?? projects[0] ?? EMPTY_PROJECT
  const currentChat = chats.find((chat) => chat.id === activeChat) ?? chats[0] ?? { id: '', title: 'New chat', historyCount: 0 }
  const isGenerating = phase === 'strategy' || phase === 'content'
  const restoredProjectId = restoredState?.activeProject
  const restoredChatId = restoredState?.activeChat
  const closeCampaignBrief = useCallback(() => setBriefOpen(false), [])
  const openCampaignBrief = useCallback(() => {
    if (activeProject && activeChat) setBriefOpen(true)
  }, [activeChat, activeProject])

  useEffect(() => () => abortRef.current?.abort(), [])

  // Live agent progress arrives over SSE. `waitForStrategy`/`waitForContent`
  // still poll the persisted run as a reconnect-safe fallback and to retrieve
  // the full final result.
  useEffect(() => {
    if (!activeRunId || (phase !== 'strategy' && phase !== 'content')) return undefined
    sseHealthyRef.current = false
    return subscribeToWorkflow(phase, activeRunId, {
      onProgress: (progress) => {
        sseHealthyRef.current = progress.status !== 'success' && progress.status !== 'failed' && progress.status !== 'suspended' && progress.status !== 'canceled'
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
        const loadedProjects = await listProjects({ signal: controller.signal })
        if (loadedProjects.length === 0) {
          setProjects([])
          setActiveProject('')
          setChats([])
          setActiveChat('')
          setValues({ ...EMPTY_VALUES })
          setCampaign(null)
          setStrategy(null)
          setStrategyRunId('')
          setSubmittedValues(null)
          setPhase('idle')
          setRunState(null)
          setHistoryEntries([])
          return
        }
        const selectedProject = loadedProjects.find((project) => project.id === restoredProjectId) ?? loadedProjects[0]
        const loadedChats = await listChats(selectedProject.id, { signal: controller.signal })
        setProjects(loadedProjects.map((project) => project.id === selectedProject.id ? { ...project, chatCount: loadedChats.length } : project))
        setActiveProject(selectedProject.id)
        setChats(loadedChats)
        const selectedChatId = loadedChats.some((chat) => chat.id === restoredChatId) ? restoredChatId : (loadedChats[0]?.id ?? '')
        setActiveChat(selectedChatId)
        if (!selectedChatId) {
          setValues({ ...EMPTY_VALUES })
          setCampaign(null)
          setStrategy(null)
          setStrategyRunId('')
          setSubmittedValues(null)
          setPhase('idle')
          setRunState(null)
          setHistoryEntries([])
          return
        }
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
    if (!activeRunId || (phase !== 'strategy' && phase !== 'content')) return undefined

    const runId = activeRunId
    const runPhase = phase
    const navigationEpoch = navigationEpochRef.current
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller

    const monitorRun = async () => {
      try {
        const finalState = runPhase === 'strategy'
          ? await waitForStrategy(runId, { signal: controller.signal, shouldPoll: () => !sseHealthyRef.current, onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)) })
          : await waitForContent(runId, { signal: controller.signal, shouldPoll: () => !sseHealthyRef.current, onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)) })

        if (controller.signal.aborted || navigationEpochRef.current !== navigationEpoch) return
        setRunState(finalState)

        if (finalState.status === 'failed') {
          const raw = finalState.error
          setError(typeof raw === 'string' ? raw : raw?.message || 'The workflow failed to complete.')
          setPhase(runPhase === 'strategy' ? 'idle' : 'review')
        } else if (finalState.status === 'canceled') {
          setError('')
          setPhase(runPhase === 'strategy' ? 'idle' : 'review')
        } else if (finalState.result && runPhase === 'strategy') {
          const parsedResult = marketingStrategyOutputSchema.safeParse(finalState.result)
          if (!parsedResult.success) throw new Error('The restored strategy response did not match the strategy schema.')
          setStrategy(parsedResult.data)
          setStrategyReview(finalState)
          setStrategyRunId(runId)
          setPhase('review')
        } else if (finalState.result && runPhase === 'content') {
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
        setPhase(runPhase === 'strategy' ? 'idle' : 'review')
      } finally {
        if (abortRef.current === controller) abortRef.current = null
        if (navigationEpochRef.current === navigationEpoch) {
          setActiveRunId((current) => current === runId ? '' : current)
        }
      }
    }

    void monitorRun()
    return () => controller.abort()
  }, [activeProject, activeRunId, phase])

  useEffect(() => {
    try {
      window.localStorage.setItem(GENERATE_STORAGE_KEY, JSON.stringify({
        activeProject,
        activeChat,
        activeRunId,
        campaign,
        phase,
        strategy,
        strategyReview,
        strategyRunId,
        submittedValues,
        values,
      }))
    } catch {
      // Persistence is best-effort when storage is disabled or unavailable.
    }
  }, [activeChat, activeProject, activeRunId, campaign, phase, strategy, strategyReview, strategyRunId, submittedValues, values])

  const detachFromActiveRun = () => {
    navigationEpochRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    sseHealthyRef.current = false
    setActiveRunId('')
    setPhase('idle')
    setRunState(null)
    setCanceling(false)
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
    setStrategyReview(entry)
    setStrategyRunId(entry.id ?? '')
    setCampaign(null)
    setPhase('review')
    return true
  }

  function restoreChatHistory(entries) {
    const active = entries.find((entry) => entry.status === 'running' && (entry.kind === 'strategy' || entry.kind === 'content'))
    if (active?.id) {
      setCampaign(null)
      const latestStrategy = active.kind === 'content'
        ? entries.find((entry) => entry.kind === 'strategy' && entry.status === 'success' && entry.result)
        : null
      if (!latestStrategy || !restoreHistoryEntry(latestStrategy)) {
        setStrategy(null)
        setStrategyRunId('')
      }
      setPhase(active.kind)
      setActiveRunId(active.id)
      setRunState({ status: 'running', activeSteps: [], completedSteps: [] })
      return true
    }

    const latestSuccess = entries.find((entry) => entry.status === 'success' && entry.result)
    return latestSuccess ? restoreHistoryEntry(latestSuccess) : false
  }

  const handleNewProject = () => {
    setProjectModal({ open: true, project: null, defaultName: `Untitled Project ${projects.length + 1}` })
  }

  const handleEditProject = (project) => {
    setProjectModal({ open: true, project, defaultName: '' })
  }

  const handleSaveProjectAppearance = async ({ name, iconId, color }) => {
    const target = projectModal.project
    if (target) {
      if (name !== target.name) {
        const renamed = await handleRenameProject(target, name)
        if (renamed === false) return false
      }
      saveProjectAppearance(target.id, { iconId, color })
      setProjects((current) => current.map((item) => item.id === target.id ? { ...item, iconId, color } : item))
      return true
    }
    return handleCreateProject({ name, iconId, color })
  }

  const handleCreateProject = async ({ name, iconId, color }) => {
    try {
      const project = await createProject(name)
      saveProjectAppearance(project.id, { iconId, color })
      setProjects((current) => [{ ...project, iconId, color, chatCount: 0 }, ...current])
      setActiveProject(project.id)
      setChats([])
      setActiveChat('')
      setValues({ ...EMPTY_VALUES })
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setError('')
      return true
    } catch (createError) {
      setError(typeof createError?.message === 'string' ? createError.message : 'Could not create the project.')
      return false
    }
  }

  const handleSelectProject = async (projectId, preferredChatId = '') => {
    if (projectId === activeProject && !preferredChatId) return
    detachFromActiveRun()
    try {
      const projectChats = await listChats(projectId)
      setActiveProject(projectId)
      setChats(projectChats)
      setProjects((current) => current.map((project) => project.id === projectId ? { ...project, chatCount: projectChats.length } : project))
      const nextChat = projectChats.find((chat) => chat.id === preferredChatId) ?? projectChats[0]
      setActiveChat(nextChat?.id ?? '')
      setValues({ ...EMPTY_VALUES })
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setHistoryEntries([])
      setError('')
      if (nextChat) {
        const projectChatHistory = await getChatHistory(projectId, nextChat.id)
        restoreChatHistory(projectChatHistory)
      }
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

  const handleRenameChat = async (chat, nextTitle, projectId = activeProject) => {
    const title = nextTitle?.trim()
    if (!title || title === chat.title) return chat
    try {
      const updated = await renameChat(chat.id, title)
      if (projectId === activeProject) {
        setChats((current) => current.map((item) => item.id === updated.id ? updated : item))
      }
      return updated
    } catch (renameError) {
      setError(typeof renameError?.message === 'string' ? renameError.message : 'Could not rename the chat.')
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

  const handleDeleteProject = (project) => {
    if (isGenerating || !project?.id) return
    setProjectPendingDelete(project)
  }

  const handleConfirmDeleteProject = async () => {
    const project = projectPendingDelete
    if (!project?.id || isGenerating) return
    try {
      await deleteProject(project.id)
      forgetProjectAppearance(project.id)
      const remaining = await listProjects()
      if (remaining.length === 0) {
        setProjects([])
        setActiveProject('')
        setChats([])
        setActiveChat('')
        setValues({ ...EMPTY_VALUES })
        setCampaign(null)
        setStrategy(null)
        setStrategyRunId('')
        setSubmittedValues(null)
        setPhase('idle')
        setRunState(null)
        setHistoryOpen(false)
        setHistoryEntries([])
        setError('')
        return
      }
      const nextProject = remaining.find((item) => item.id === activeProject) ?? remaining[0]
      const nextChats = await listChats(nextProject.id)
      setProjects(remaining)
      setActiveProject(nextProject.id)
      setChats(nextChats)
      setActiveChat(nextChats[0]?.id ?? '')
      setValues({ ...EMPTY_VALUES })
      setCampaign(null)
      setStrategy(null)
      setStrategyRunId('')
      setSubmittedValues(null)
      setPhase('idle')
      setRunState(null)
      setHistoryOpen(false)
      setHistoryEntries([])
      setError('')
    } catch (deleteError) {
      setError(typeof deleteError?.message === 'string' ? deleteError.message : 'Could not delete the project.')
    } finally {
      setProjectPendingDelete(null)
    }
  }

  const handleNewChat = async (projectId = activeProject) => {
    if (!projectId || isGenerating) return
    try {
      const existingChats = projectId === activeProject ? chats : await listChats(projectId)
      const chat = await createChat(projectId, `Campaign chat ${existingChats.length + 1}`)
      setActiveProject(projectId)
      setChats([chat, ...existingChats])
      setProjects((current) => current.map((project) => project.id === projectId ? { ...project, chatCount: existingChats.length + 1 } : project))
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
    } catch (chatError) {
      setError(typeof chatError?.message === 'string' ? chatError.message : 'Could not create the chat.')
    }
  }

  const handleConfirmDeleteChat = async () => {
    const chat = chatPendingDelete?.chat
    const projectId = chatPendingDelete?.projectId
    if (!chat || !projectId || isGenerating) return
    try {
      await deleteChat(projectId, chat.id)
      const remainingChats = await listChats(projectId)
      const deletedActiveChat = projectId === activeProject && chat.id === activeChat
      if (projectId === activeProject) setChats(remainingChats)
      setProjects((current) => current.map((project) => project.id === projectId ? { ...project, chatCount: remainingChats.length } : project))
      if (deletedActiveChat) {
        const nextChat = remainingChats[0]
        setActiveChat(nextChat?.id ?? '')
        setValues({ ...EMPTY_VALUES })
        setCampaign(null)
        setStrategy(null)
        setStrategyRunId('')
        setSubmittedValues(null)
        setPhase('idle')
        setRunState(null)
        setHistoryOpen(false)
        setHistoryEntries([])
        if (nextChat) {
          const nextHistory = await getChatHistory(projectId, nextChat.id)
          setHistoryEntries(nextHistory)
          restoreChatHistory(nextHistory)
        }
      }
      setError('')
    } catch (chatError) {
      setError(typeof chatError?.message === 'string' ? chatError.message : 'Could not delete the chat.')
    } finally {
      setChatPendingDelete(null)
    }
  }

  const handleRequestDeleteChat = async (chat, projectId = activeProject) => {
    if (isGenerating) return
    if (projectId !== activeProject) await handleSelectProject(projectId, chat.id)
    setChatPendingDelete({ chat, projectId })
  }

  const handleSelectChat = async (chatId, projectId = activeProject) => {
    if (projectId === activeProject && chatId === activeChat) return
    if (projectId !== activeProject) {
      await handleSelectProject(projectId, chatId)
      return
    }
    detachFromActiveRun()
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

    setBriefOpen(false)
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
      if (controller.signal.aborted) return
      setActiveRunId(runId)
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong while building the strategy.')
      setPhase('idle')
    }
  }

  const handleFillTestData = () => {
    setValues({ ...TEST_VALUES, platforms: [...TEST_VALUES.platforms] })
    setErrors({})
  }

  const handleConfirmStrategy = async (note) => {
    if (!strategy || isGenerating) return

    const sourceValues = submittedValues ?? values
    if (!strategyRunId) {
      setError('The strategy did not include a campaign plan to send to the content workflow.')
      return
    }

    const parsedContentInput = contentWorkflowInputSchema.safeParse(
      buildContentWorkflowInput(sourceValues, strategy, currentProject.name),
    )
    if (!parsedContentInput.success) {
      setError(`The content brief is incomplete: ${parsedContentInput.error.issues.map((issue) => issue.message).join('; ')}`)
      setBriefOpen(true)
      return
    }
    const contentInput = parsedContentInput.data

    try {
      const reviewed = await reviewStrategy(strategyRunId, {
        action: 'APPROVED',
        note,
        output: strategy,
      })
      setStrategyReview(reviewed)
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : 'Could not save strategy approval.')
      return
    }

    setSubmittedValues({
      ...sourceValues,
      brandName: contentInput.brandName,
      product: contentInput.product,
      targetAudience: contentInput.targetAudience,
      platforms: [...contentInput.platforms],
      duration: contentInput.duration,
      postsPerWeek: contentInput.postsPerWeek,
    })

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setError('')
    setPhase('content')
    setCampaign(null)
    setRunState({ status: 'running', activeSteps: [], completedSteps: [] })

    try {
      const { runId } = await startContent(contentInput, { signal: controller.signal, chatId: activeChat, strategyId: strategyRunId })
      if (controller.signal.aborted) return
      setActiveRunId(runId)
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong while creating the posts.')
      setPhase('review')
    }
  }

  const handleRequestStrategyChanges = async (note) => {
    if (!strategyRunId || !strategy || isGenerating) return
    try {
      const reviewed = await reviewStrategy(strategyRunId, {
        action: 'CHANGES_REQUESTED',
        note,
        output: strategy,
      })
      setStrategyReview(reviewed)
      setError('Changes requested. Update the relevant section, then approve the revised strategy.')
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : 'Could not save requested changes.')
    }
  }

  const handleRegenerateStrategySection = async (section, feedback) => {
    if (!strategyRunId || !strategy || isGenerating) return
    const instructions = feedback?.trim()
    if (!instructions || instructions.length < 3) {
      setError('Add a short review note explaining what the selected section should change.')
      return
    }

    abortRef.current?.abort()
    sseHealthyRef.current = false
    const controller = new AbortController()
    abortRef.current = controller
    setError('')
    setPhase('strategy')
    setRunState({ status: 'running', activeSteps: ['regenerate-strategy-section'], completedSteps: [] })

    try {
      const { runId } = await regenerateStrategySection(
        strategyRunId,
        section,
        instructions,
        { signal: controller.signal },
      )
      if (controller.signal.aborted) return
      setActiveRunId(runId)
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(typeof err?.message === 'string' ? err.message : 'Could not regenerate the selected strategy section.')
      setPhase('review')
    }
  }

  const handleEditStrategy = () => {
    if (isGenerating) return
    setBriefOpen(true)
    window.setTimeout(() => document.querySelector('#product')?.focus(), 50)
  }

  const handleCancel = async () => {
    if (!activeRunId || canceling) return

    const runId = activeRunId
    const runPhase = phase
    const cancelEpoch = navigationEpochRef.current
    setCanceling(true)
    setError('')

    try {
      if (runPhase === 'strategy') await cancelStrategy(runId)
      else await cancelContent(runId)

      // The user may have opened another chat while the cancellation request
      // was in flight. The original run is canceled, but the new chat's view
      // and monitor must remain untouched.
      if (navigationEpochRef.current !== cancelEpoch) return

      navigationEpochRef.current += 1
      abortRef.current?.abort()
      abortRef.current = null
      sseHealthyRef.current = false
      setRunState(null)
      setPhase(runPhase === 'content' ? 'review' : 'idle')
      setActiveRunId((current) => current === runId ? '' : current)
    } catch (cancelError) {
      setError(typeof cancelError?.message === 'string' ? cancelError.message : 'Could not cancel this workflow run.')
    } finally {
      setCanceling(false)
    }
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
              <select value={activeProject} onChange={(event) => void handleSelectProject(event.target.value)} disabled={projects.length === 0} aria-label="Active project" className="min-w-0 flex-1 truncate rounded-lg border border-[#ded7e3] bg-white px-2.5 py-2 text-xs font-semibold text-[#201a25] outline-none focus:border-[#4f378a] disabled:text-[#948a98]">
                {projects.length === 0 ? <option value="">No projects yet</option> : null}
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            )}
            <button type="button" onClick={beginMobileRename} disabled={!activeProject} aria-label="Rename current project" className="flex size-9 items-center justify-center rounded-lg bg-white text-[#625b71] ring-1 ring-[#ded7e3] disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="size-3.5" /></button>
            <button type="button" onClick={() => handleDeleteProject(currentProject)} disabled={!activeProject} aria-label="Delete current project" className="flex size-9 items-center justify-center rounded-lg bg-white text-[#ad3150] ring-1 ring-[#eccfd5] disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="size-3.5" /></button>
            <button type="button" onClick={handleNewProject} aria-label="Create new project" className="flex size-9 items-center justify-center rounded-lg bg-[#381e72] text-white"><Plus className="size-3.5" /></button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {chats.map((chat) => (
              <div key={chat.id} className={`flex h-8 shrink-0 items-center overflow-hidden rounded-lg ${chat.id === activeChat ? 'bg-[#381e72] text-white' : 'bg-white text-[#625b71] ring-1 ring-[#ded7e3]'}`}>
                <button type="button" onClick={() => handleSelectChat(chat.id)} className="h-full px-2.5 text-[11px] font-semibold">{chat.title}</button>
                <button type="button" onClick={() => void handleRequestDeleteChat(chat, activeProject)} aria-label={`Delete ${chat.title}`} className={`flex h-full w-8 items-center justify-center ${chat.id === activeChat ? 'text-white/70 hover:bg-white/15 hover:text-white' : 'text-[#a45b70] hover:bg-[#fbe2e8]'}`}><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => void handleNewChat()} disabled={!activeProject} className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4f378a] ring-1 ring-[#ded7e3] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Create new chat"><Plus className="size-3.5" /></button>
            <button type="button" onClick={handleOpenHistory} disabled={!activeChat} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[11px] font-semibold text-[#4f378a] ring-1 ring-[#ded7e3] disabled:cursor-not-allowed disabled:opacity-40"><History className="size-3.5" /> History</button>
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
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onSelectChat={handleSelectChat}
          onRenameChat={handleRenameChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleRequestDeleteChat}
          onOpenHistory={handleOpenHistory}
          historyOpen={historyOpen}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((current) => !current)}
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
          onRetryError={strategy && !campaign ? () => handleConfirmStrategy() : handleGenerate}
          onConfirmStrategy={handleConfirmStrategy}
          onRequestStrategyChanges={handleRequestStrategyChanges}
          onRegenerateStrategySection={handleRegenerateStrategySection}
          strategyReview={strategyReview}
          onEditStrategy={handleEditStrategy}
          onStrategyChange={setStrategy}
          onStartCampaign={openCampaignBrief}
          canStartCampaign={Boolean(activeProject && activeChat)}
        />
      </div>
      <ProjectAppearanceModal
        open={projectModal.open}
        project={projectModal.project}
        defaultName={projectModal.defaultName}
        onClose={() => setProjectModal((current) => ({ ...current, open: false }))}
        onSubmit={handleSaveProjectAppearance}
      />
      <CampaignFormModal
        open={briefOpen && !isGenerating}
        onClose={closeCampaignBrief}
        chatKey={activeChat || 'no-campaign-chat'}
        values={values}
        setValues={setValues}
        errors={errors}
        onGenerate={handleGenerate}
        onFillTestData={handleFillTestData}
        isGenerating={isGenerating}
        isLocked={!activeProject || !activeChat}
      />
      {isGenerating ? (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#381e72] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <LoadingRing className="size-3.5 text-[#d8ff9d]" />
           {phase === 'strategy' ? 'Building strategy…' : 'Creating posts…'}
          <button type="button" onClick={() => void handleCancel()} disabled={!activeRunId || canceling} className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] hover:bg-white/25 disabled:cursor-wait disabled:opacity-60">
            {canceling ? 'Canceling…' : 'Cancel'}
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
      <AlertDialog open={Boolean(projectPendingDelete)} onOpenChange={(open) => { if (!open) setProjectPendingDelete(null) }}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive" aria-hidden="true">
              <Trash2 className="size-5" />
            </span>
            <AlertDialogTitle>Delete “{projectPendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This permanently removes the project and all of its chats, strategies, generated content, and history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-5 text-muted-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p><span className="font-semibold text-foreground">Permanent deletion.</span> Keep the project if you may need any of its work later.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 cursor-pointer border-border bg-background text-foreground hover:bg-muted">Keep project</AlertDialogCancel>
            <AlertDialogAction className="h-11 cursor-pointer gap-2" onClick={() => void handleConfirmDeleteProject()}><Trash2 className="size-4" aria-hidden="true" />Delete project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={Boolean(chatPendingDelete)} onOpenChange={(open) => { if (!open) setChatPendingDelete(null) }}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </span>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              “{chatPendingDelete?.chat?.title}” and all of its strategy and content history will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 cursor-pointer border-border bg-background text-foreground hover:bg-muted">Keep chat</AlertDialogCancel>
            <AlertDialogAction className="h-11 cursor-pointer gap-2" onClick={() => void handleConfirmDeleteChat()}><Trash2 className="size-4" aria-hidden="true" />Delete chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
