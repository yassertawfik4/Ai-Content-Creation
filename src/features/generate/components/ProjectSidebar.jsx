import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Coins, Folder, History, MoreHorizontal, Palette, PanelLeftClose, PanelLeftOpen, Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProjectIcon } from '@/lib/projectAppearance'

export function ProjectSidebar({
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
  creditUsage,
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
                    className="h-8 min-w-0 flex-1 rounded-md border border-[#c8bcd8] bg-white px-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#201a25] outline-none ring-2 ring-[#ece4f5] selection:bg-[#e2d6f4]"
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
                    <ProjectIcon iconId={project.iconId} className="size-[17px] shrink-0" style={{ color: project.color }} aria-hidden="true" />
                    <span className={`min-w-0 truncate text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${isActive ? 'text-[#4f378a]' : 'text-[#9a94a3] group-hover/project:text-[#6b6577]'}`}>
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
                          <div className="flex min-h-9 items-center pl-5 pr-1.5">
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
                              className="h-8 min-w-0 flex-1 rounded-md border border-[#c8bcd8] bg-white px-2 text-[12px] font-medium text-[#201a25] outline-none ring-2 ring-[#ece4f5]"
                            />
                          </div>
                        ) : (
                          <button type="button" onClick={() => selectChat(chat.id, project.id)} aria-current={selected ? 'page' : undefined} className="flex min-h-9 w-full items-center rounded-lg pl-5 pr-9 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                            <span className={`min-w-0 flex-1 truncate text-[12px] ${selected ? 'font-semibold text-[#201a25]' : 'font-medium text-[#4a4453]'}`} title={chat.title}>{chat.title}</span>
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
                      className="flex min-h-9 w-full items-center gap-2 rounded-lg pl-5 pr-2 text-left text-[12px] font-medium text-[#9a94a3] transition-colors hover:bg-[#f7f6f9] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
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
            <Coins className="size-3" />
          </span>
          {creditUsage?.plan?.name ? `${creditUsage.plan.name} allowance` : 'Generation credits'}
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#f0eef2]">
          <div
            className={`h-full rounded-full transition-[width] ${creditUsage?.blockedReason ? 'bg-[#ad3150]' : 'bg-[#4f378a]'}`}
            style={{ width: `${creditUsage?.limit ? Math.max(0, Math.min(100, (creditUsage.remaining / creditUsage.limit) * 100)) : 0}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-[#9a94a3]">
          {creditUsage
            ? `${creditUsage.remaining.toLocaleString()} of ${creditUsage.limit.toLocaleString()} credits left`
            : 'Checking your allowance…'}
        </p>
        <Link to="/billing" className="mt-1.5 flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[#4f378a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
          <Settings className="size-3.5" /> Manage plan
        </Link>
      </div>
    </aside>
  )
}
