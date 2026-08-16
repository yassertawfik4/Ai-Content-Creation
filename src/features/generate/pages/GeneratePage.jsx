import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CircleAlert,
  History,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
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
} from '../schema/campaignSchema'
import {
  cancelContent,
  cancelStrategy,
  createChat,
  createProject,
  deleteChat,
  deleteProject,
  getChatHistory,
  generateChatTitle,
  listChats,
  listProjects,
  renameChat,
  renameProject,
  regenerateStrategySection,
  reviewStrategy,
  startContent,
  startStrategy,
  subscribeToWorkflow,
  waitForContent,
  waitForStrategy,
  waitForWorkflowBilling,
} from '@/lib/campaignApi'
import { forgetProjectAppearance, saveProjectAppearance } from '@/lib/projectAppearance'
import ProjectAppearanceModal from '../components/ProjectAppearanceModal'
import { getCreditUsage } from '@/lib/billingApi'
import { getErrorMessage } from '@/lib/errors'
import { AppHeader, LoadingRing } from '../components/AppHeader'
import { CampaignFormModal } from '../components/CampaignForm'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { ProjectHistoryDrawer } from '../components/workflow-results/ProjectHistoryDrawer'
import { ResultsPanel } from '../components/workflow-results/ResultsPanel'
import { EMPTY_PROJECT, EMPTY_VALUES, GENERATE_STORAGE_KEY, TEST_VALUES, buildContentWorkflowInput, buildStrategyBrief, hasBriefContent, mergeStoredValues, readGenerateState, valuesFromStrategy } from '../model/generateConfig'
import { clampCampaignValues, durationInWeeks, getCampaignPlanLimits } from '../model/campaignPlanLimits'

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
    createdAt: next.createdAt ?? current?.createdAt,
    // Polling returns durable status/result but no Mastra step graph. Retain
    // the SSE snapshot until a newer SSE event advances it.
    activeSteps: next.activeSteps?.length ? next.activeSteps : (current?.activeSteps ?? []),
    completedSteps: next.completedSteps?.length ? next.completedSteps : (current?.completedSteps ?? []),
  }
}

function isUntitledChat(title) {
  return /^(?:New chat|Campaign chat \d+)$/i.test(title?.trim() ?? '')
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
  const [runState, setRunState] = useState(() => (
    restoredState?.activeRunId && restoredState?.runStartedAt
      ? { status: 'running', activeSteps: [], completedSteps: [], createdAt: restoredState.runStartedAt }
      : null
  ))
  const [activeRunId, setActiveRunId] = useState(() => restoredState?.activeRunId ?? '')
  const [canceling, setCanceling] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [creditUsage, setCreditUsage] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [briefOpen, setBriefOpen] = useState(false)
  const [mobileRenameOpen, setMobileRenameOpen] = useState(false)
  const [mobileProjectName, setMobileProjectName] = useState('')
  const [projectPendingDelete, setProjectPendingDelete] = useState(null)
  const [chatPendingDelete, setChatPendingDelete] = useState(null)
  const abortRef = useRef(null)
  const titleAbortRef = useRef(null)
  const navigationEpochRef = useRef(0)
  const billingAbortRef = useRef(null)
  const sseHealthyRef = useRef(false)
  const cancelMobileRenameRef = useRef(false)

  const currentProject = projects.find((project) => project.id === activeProject) ?? projects[0] ?? EMPTY_PROJECT
  const currentChat = chats.find((chat) => chat.id === activeChat) ?? chats[0] ?? { id: '', title: 'New chat', historyCount: 0 }
  const isGenerating = phase === 'strategy' || phase === 'content'
  const campaignLimits = getCampaignPlanLimits(creditUsage)
  const restoredProjectId = restoredState?.activeProject
  const restoredChatId = restoredState?.activeChat
  const closeCampaignBrief = useCallback(() => setBriefOpen(false), [])
  const openCampaignBrief = useCallback(() => {
    if (activeProject && activeChat) setBriefOpen(true)
  }, [activeChat, activeProject])

  const refreshCreditUsage = useCallback(async () => {
    try {
      const usage = await getCreditUsage()
      setCreditUsage(usage ?? null)
      return usage
    } catch {
      // Workflow endpoints still enforce the allowance if this status request fails.
      return null
    }
  }, [])

  useEffect(() => () => {
    abortRef.current?.abort()
    titleAbortRef.current?.abort()
    billingAbortRef.current?.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getCreditUsage({ signal: controller.signal })
      .then((usage) => setCreditUsage(usage ?? null))
      .catch((usageError) => {
        if (usageError?.name !== 'AbortError') setCreditUsage(null)
      })
    return () => controller.abort()
  }, [])

  const refreshRunBilling = useCallback((kind, runId) => {
    billingAbortRef.current?.abort()
    const controller = new AbortController()
    billingAbortRef.current = controller
    void waitForWorkflowBilling(kind, runId, {
      signal: controller.signal,
      onTick: (state) => setRunState((current) => mergeWorkflowStatus(current, state)),
    }).catch((billingError) => {
      if (billingError?.name !== 'AbortError') {
        // Accounting is best-effort and never changes the workflow result.
      }
    })
  }, [])

  // Live agent progress arrives over SSE. `waitForStrategy`/`waitForContent`
  // still poll the persisted run as a reconnect-safe fallback and to retrieve
  // the full final result.
  useEffect(() => {
    if (!activeRunId || (phase !== 'strategy' && phase !== 'content')) return undefined
    sseHealthyRef.current = false
    return subscribeToWorkflow(phase, activeRunId, {
      onProgress: (progress) => {
        sseHealthyRef.current = progress.status !== 'success' && progress.status !== 'failed' && progress.status !== 'suspended' && progress.status !== 'canceled'
        setRunState((current) => mergeWorkflowStatus(current, progress))
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
          setError(getErrorMessage(loadError, 'Could not load projects from the backend.'))
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
        refreshRunBilling(runPhase, runId)
        void refreshCreditUsage()

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
        if (error?.credits) setCreditUsage(error.credits)
        setError(getErrorMessage(error, 'The workflow could not be restored after refresh.'))
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
  }, [activeProject, activeRunId, phase, refreshCreditUsage, refreshRunBilling])

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
        runStartedAt: runState?.createdAt ?? null,
        submittedValues,
        values,
      }))
    } catch {
      // Persistence is best-effort when storage is disabled or unavailable.
    }
  }, [activeChat, activeProject, activeRunId, campaign, phase, runState?.createdAt, strategy, strategyReview, strategyRunId, submittedValues, values])

  const detachFromActiveRun = () => {
    navigationEpochRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    titleAbortRef.current?.abort()
    titleAbortRef.current = null
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
      setRunState(entry)
      return true
    }
    const parsed = marketingStrategyOutputSchema.safeParse(entry.result)
    if (!parsed.success) return false
    setStrategy(parsed.data)
    setStrategyReview(entry)
    setStrategyRunId(entry.id ?? '')
    setCampaign(null)
    setPhase('review')
    setRunState(entry)
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
      setRunState({ ...active, status: 'running', activeSteps: [], completedSteps: [] })
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
      const { initialChat, ...project } = await createProject(name)
      saveProjectAppearance(project.id, { iconId, color })
      setProjects((current) => [{ ...project, iconId, color, chatCount: initialChat ? 1 : 0 }, ...current])
      setActiveProject(project.id)
      setChats(initialChat ? [initialChat] : [])
      setActiveChat(initialChat?.id ?? '')
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
      setError(getErrorMessage(createError, 'Could not create the project.'))
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
      setError(getErrorMessage(selectError, 'Could not open the project.'))
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
      setError(getErrorMessage(renameError, 'Could not rename the project.'))
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
      setError(getErrorMessage(renameError, 'Could not rename the chat.'))
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
      setError(getErrorMessage(deleteError, 'Could not delete the project.'))
    } finally {
      setProjectPendingDelete(null)
    }
  }

  const handleNewChat = async (projectId = activeProject) => {
    if (!projectId || isGenerating) return
    try {
      const existingChats = projectId === activeProject ? chats : await listChats(projectId)
      const chat = await createChat(projectId, 'New chat')
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
      setError(getErrorMessage(chatError, 'Could not create the chat.'))
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
      setError(getErrorMessage(chatError, 'Could not delete the chat.'))
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
      setError(getErrorMessage(chatError, 'Could not load the chat.'))
    }
  }

  const handleOpenHistory = async () => {
    if (!activeProject || !activeChat) return
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      setHistoryEntries(await getChatHistory(activeProject, activeChat))
    } catch (historyError) {
      setError(getErrorMessage(historyError, 'Could not load project history.'))
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

    if (creditUsage?.canGenerate === false) {
      setError(creditUsage.blockedReason === 'payment_required'
        ? 'Your subscription needs attention before another generation can start.'
        : 'You have used all generation credits for this period. Upgrade your plan or wait for the reset.')
      return
    }

    setError('')
    setErrors({})

    const requiredFormErrors = {}
    if (!values.brandName.trim()) requiredFormErrors.brandName = 'Brand name is required'
    if (!values.targetAudience.trim()) requiredFormErrors.targetAudience = 'Audience is required'
    if (!values.campaignGoal) requiredFormErrors.campaignGoal = 'Pick a campaign goal'
    if (!values.platforms.length) requiredFormErrors.platforms = 'Select at least one platform'
    if (!values.duration) requiredFormErrors.duration = 'Duration is required'
    else if (durationInWeeks(values.duration) > campaignLimits.maxCampaignWeeks) {
      requiredFormErrors.duration = `${campaignLimits.name} supports campaigns up to ${campaignLimits.maxCampaignWeeks} ${campaignLimits.maxCampaignWeeks === 1 ? 'week' : 'weeks'}`
    }
    if (!Number.isInteger(values.postsPerWeek) || values.postsPerWeek < 1 || values.postsPerWeek > campaignLimits.maxPostsPerWeek) {
      requiredFormErrors.postsPerWeek = `Posts per week must be between 1 and ${campaignLimits.maxPostsPerWeek}`
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
      createdAt: new Date().toISOString(),
    })

    if (isUntitledChat(currentChat.title)) {
      titleAbortRef.current?.abort()
      const titleController = new AbortController()
      titleAbortRef.current = titleController
      const titleBrief = {
        brandName: values.brandName.trim(),
        product: values.product.trim(),
        industry: values.industry.trim(),
        businessType: values.businessType.trim(),
        campaignGoal: values.campaignGoal,
        targetAudience: values.targetAudience.trim(),
      }

      void generateChatTitle(activeChat, titleBrief, { signal: titleController.signal })
        .then((updated) => {
          if (titleController.signal.aborted) return
          setChats((current) => current.map((chat) => chat.id === updated.id ? updated : chat))
        })
        .catch(() => {
          // Title generation is non-blocking; the strategy request remains authoritative.
        })
        .finally(() => {
          if (titleAbortRef.current === titleController) titleAbortRef.current = null
        })
    }

    try {
      const { runId } = await startStrategy(parsed.data, { signal: controller.signal, projectId: activeProject, chatId: activeChat })
      if (controller.signal.aborted) return
      setActiveRunId(runId)
      void refreshCreditUsage()
    } catch (err) {
      if (err?.name === 'AbortError') return
      if (err?.credits) setCreditUsage(err.credits)
      setError(getErrorMessage(err, 'Something went wrong while building the strategy.'))
      setPhase('idle')
    }
  }

  const handleFillTestData = (limits = campaignLimits) => {
    setValues(clampCampaignValues({ ...TEST_VALUES, platforms: [...TEST_VALUES.platforms] }, limits))
    setErrors({})
  }

  const handleConfirmStrategy = async (note) => {
    if (!strategy || isGenerating) return

    if (creditUsage?.canGenerate === false) {
      setError(creditUsage.blockedReason === 'payment_required'
        ? 'Your subscription needs attention before content can be created.'
        : 'You have used all generation credits for this period. Upgrade your plan or wait for the reset.')
      return
    }

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
      setError(getErrorMessage(err, 'Could not save strategy approval.'))
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
    setRunState({ status: 'running', activeSteps: [], completedSteps: [], createdAt: new Date().toISOString() })

    try {
      const { runId } = await startContent(contentInput, { signal: controller.signal, chatId: activeChat, strategyId: strategyRunId })
      if (controller.signal.aborted) return
      setActiveRunId(runId)
      void refreshCreditUsage()
    } catch (err) {
      if (err?.name === 'AbortError') return
      if (err?.credits) setCreditUsage(err.credits)
      setError(getErrorMessage(err, 'Something went wrong while creating the posts.'))
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
      setError(getErrorMessage(err, 'Could not save requested changes.'))
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
    setRunState({ status: 'running', activeSteps: ['regenerate-strategy-section'], completedSteps: [], createdAt: new Date().toISOString() })

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
      setError(getErrorMessage(err, 'Could not regenerate the selected strategy section.'))
      setPhase('review')
    }
  }

  const handleEditStrategy = () => {
    if (isGenerating) return

    // The brief that produced this strategy is the best source, then whatever is
    // already typed in the form. Only when both are empty — a chat reopened from
    // history — is the brief rebuilt from the strategy output itself.
    const briefValues = hasBriefContent(submittedValues)
      ? submittedValues
      : hasBriefContent(values)
        ? values
        : strategy
          ? valuesFromStrategy(strategy, currentProject.name)
          : null

    if (briefValues) {
      setValues({ ...briefValues, platforms: [...briefValues.platforms] })
      setErrors({})
    }

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
      setError(getErrorMessage(cancelError, 'Could not cancel this workflow run.'))
    } finally {
      setCanceling(false)
      void refreshCreditUsage()
    }
  }

  const effectiveError = error
  const resultValues = submittedValues ?? values

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f3f8] text-[#201a25]">
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
          creditUsage={creditUsage}
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
          creditUsage={creditUsage}
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
        creditUsage={creditUsage}
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
