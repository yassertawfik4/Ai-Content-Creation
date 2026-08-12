import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDocumentKnowledgeSource,
  addSocialKnowledgeSource,
  addWebsiteKnowledgeSource,
  askProjectKnowledge,
  deleteKnowledgeSource,
  listKnowledgeSources,
  listProjects,
  refreshKnowledgeSource,
  reindexProjectKnowledge,
  updateProjectBrandProfile,
} from '@/lib/campaignApi'
import { getErrorMessage } from '@/lib/errors'

const EMPTY_PROFILE = {
  voice: '',
  preferredTerms: '',
  prohibitedTerms: '',
  writingRules: '',
  ctaGuidance: '',
  languageGuidance: '',
}

const toLines = (value) => value.split(/\n+/).map((item) => item.trim()).filter(Boolean)

function profileFor(project) {
  const profile = project?.brandProfile
  return {
    voice: profile?.voice ?? '',
    preferredTerms: (profile?.preferredTerms ?? []).join('\n'),
    prohibitedTerms: (profile?.prohibitedTerms ?? []).join('\n'),
    writingRules: (profile?.writingRules ?? []).join('\n'),
    ctaGuidance: profile?.ctaGuidance ?? '',
    languageGuidance: profile?.languageGuidance ?? '',
  }
}

export function useKnowledgeWorkspace() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [sources, setSources] = useState([])
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [chat, setChat] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')

  const loadSources = useCallback(async (id) => {
    if (!id) {
      setSources([])
      return
    }
    setSources(await listKnowledgeSources(id))
  }, [])

  useEffect(() => {
    let active = true

    const initialise = async () => {
      try {
        const items = await listProjects()
        if (!active) return
        const firstProject = items[0]
        setProjects(items)
        setProjectId(firstProject?.id ?? '')
        setProfile(profileFor(firstProject))
        if (firstProject?.id) await loadSources(firstProject.id)
      } catch (cause) {
        if (active) setError(getErrorMessage(cause, 'Could not load the knowledge workspace.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void initialise()
    return () => { active = false }
  }, [loadSources])

  const execute = async (operation) => {
    if (!projectId || busy) return false
    setBusy(true)
    setError('')
    try {
      await operation()
      await loadSources(projectId)
      return true
    } catch (cause) {
      setError(getErrorMessage(cause))
      return false
    } finally {
      setBusy(false)
    }
  }

  const selectProject = async (id) => {
    if (busy || asking) return
    const project = projects.find((item) => item.id === id)
    setProjectId(id)
    setProfile(profileFor(project))
    setChat([])
    setError('')
    try {
      await loadSources(id)
    } catch (cause) {
      setError(getErrorMessage(cause, 'Could not load this project’s knowledge sources.'))
    }
  }

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const saveProfile = (event) => {
    event.preventDefault()
    void execute(async () => {
      const brandProfile = {
        voice: profile.voice.trim(),
        preferredTerms: toLines(profile.preferredTerms),
        prohibitedTerms: toLines(profile.prohibitedTerms),
        writingRules: toLines(profile.writingRules),
        ...(profile.ctaGuidance.trim() ? { ctaGuidance: profile.ctaGuidance.trim() } : {}),
        ...(profile.languageGuidance.trim() ? { languageGuidance: profile.languageGuidance.trim() } : {}),
      }
      await updateProjectBrandProfile(projectId, brandProfile)
      setProjects((items) => items.map((project) => project.id === projectId ? { ...project, brandProfile } : project))
    })
  }

  const ask = async (event) => {
    event.preventDefault()
    const text = question.trim()
    if (!projectId || !text || asking) return
    setAsking(true)
    setError('')
    setQuestion('')
    try {
      const result = await askProjectKnowledge(projectId, text)
      setChat((items) => [...items, { question: text, ...result }])
    } catch (cause) {
      setError(getErrorMessage(cause, 'Could not answer that question.'))
    } finally {
      setAsking(false)
    }
  }

  const readyCount = useMemo(() => sources.filter((source) => source.status === 'READY').length, [sources])

  return {
    addDocument: (input) => execute(() => addDocumentKnowledgeSource(projectId, input)),
    addSocial: (input) => execute(() => addSocialKnowledgeSource(projectId, { platform: 'instagram', ...input })),
    addWebsite: (url) => execute(() => addWebsiteKnowledgeSource(projectId, { url })),
    ask,
    asking,
    busy,
    chat,
    deleteSource: (sourceId) => execute(() => deleteKnowledgeSource(projectId, sourceId)),
    error,
    loading,
    profile,
    projectId,
    projects,
    question,
    readyCount,
    refreshSource: (sourceId) => execute(() => refreshKnowledgeSource(projectId, sourceId)),
    reindex: () => execute(() => reindexProjectKnowledge(projectId)),
    saveProfile,
    selectProject,
    setQuestion,
    sources,
    updateProfileField,
  }
}
