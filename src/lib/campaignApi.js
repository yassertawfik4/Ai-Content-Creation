// Browser client for the Nest application API. The Mastra service is reached
// by Nest workers only; it is never a browser data source.
import { getProjectAppearance } from './projectAppearance'

const DEFAULT_BASE = '/api'

export function getApiBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL
  const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_BASE
  return base.replace(/\/$/, '')
}

async function readError(res) {
  try {
    const data = await res.json()
    if (Array.isArray(data?.details)) {
      return {
        message: data.details.map((issue) => issue?.message ?? JSON.stringify(issue)).join('; '),
        data,
      }
    }
    const message = Array.isArray(data?.message)
      ? data.message.filter(Boolean).join('; ')
      : data?.message || data?.error || `Request failed with status ${res.status}`
    return { message, data }
  } catch {
    return { message: `Request failed with status ${res.status}`, data: null }
  }
}

async function workflowError(res) {
  const { message, data } = await readError(res)
  const error = new Error(message)
  error.status = res.status
  error.code = data?.code
  error.credits = data?.credits
  return error
}

async function apiFetch(path, options = {}) {
  try {
    return await fetch(`${getApiBase()}${path}`, {
      ...options,
      credentials: 'include',
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(
      `Cannot reach the application API at ${getApiBase()}. ` +
        'Check VITE_API_BASE_URL and make sure the backend is running.',
      { cause: error },
    )
  }
}

async function request(path, options = {}) {
  const res = await apiFetch(path, options)
  if (!res.ok) throw await workflowError(res)
  if (res.status === 204) return undefined
  return res.json()
}

function asChat(campaign) {
  return {
    id: campaign.id,
    title: campaign.name,
    historyCount: 0,
  }
}

function workflowState(record) {
  const statusByBackendStatus = {
    PENDING: 'running',
    RUNNING: 'running',
    SUSPENDED: 'suspended',
    CANCELED: 'canceled',
    READY: 'success',
    FAILED: 'failed',
  }
  return {
    ...record,
    billing: normalizeBilling(record.billing),
    executions: Array.isArray(record.executions) ? record.executions : [],
    status: statusByBackendStatus[record.status] ?? 'failed',
    result: record.output,
  }
}

function normalizeBilling(billing) {
  const statuses = new Set(['pending', 'ready', 'unpriced', 'unavailable'])
  if (!billing || !statuses.has(billing.status)) {
    return {
      status: 'unavailable',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: null,
    }
  }
  return {
    status: billing.status,
    inputTokens: Number.isFinite(billing.inputTokens) ? billing.inputTokens : 0,
    outputTokens: Number.isFinite(billing.outputTokens) ? billing.outputTokens : 0,
    totalTokens: Number.isFinite(billing.totalTokens) ? billing.totalTokens : 0,
    estimatedCostUsd: typeof billing.estimatedCostUsd === 'string' ? billing.estimatedCostUsd : null,
  }
}

function normalizeHistoryEntry(entry) {
  return {
    ...entry,
    billing: normalizeBilling(entry?.billing),
    executions: Array.isArray(entry?.executions) ? entry.executions : [],
  }
}

export async function listProjects({ signal } = {}) {
  const data = await request('/projects?limit=100', { headers: { Accept: 'application/json' }, signal })
  return Array.isArray(data?.items) ? data.items.map((project) => ({
    ...project,
    // The API has no icon/colour field, so appearance is resolved client-side.
    ...getProjectAppearance(project.id),
    chatCount: project._count?.campaigns ?? 0,
    historyCount: 0,
  })) : []
}

export function createProject(name, { signal } = {}) {
  return request('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    signal,
  })
}

export function renameProject(projectId, name, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    signal,
  })
}

export function updateProjectBrandProfile(projectId, brandProfile, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandProfile }),
    signal,
  })
}

export function deleteProject(projectId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE', signal })
}

export function listKnowledgeSources(projectId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources`, { headers: { Accept: 'application/json' }, signal })
}

export function addWebsiteKnowledgeSource(projectId, input, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/website`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  })
}

export function addDocumentKnowledgeSource(projectId, input, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/document`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  })
}

export function uploadDocumentKnowledgeSource(projectId, file, { signal } = {}) {
  const body = new FormData()
  body.append('file', file)
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/document-upload`, {
    method: 'POST', body, signal,
  })
}

export function addSocialKnowledgeSource(projectId, input, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/social-posts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  })
}

export function refreshKnowledgeSource(projectId, sourceId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/${encodeURIComponent(sourceId)}/refresh`, { method: 'POST', signal })
}

export function reindexProjectKnowledge(projectId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/reindex`, { method: 'POST', signal })
}

export function deleteKnowledgeSource(projectId, sourceId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/sources/${encodeURIComponent(sourceId)}`, { method: 'DELETE', signal })
}

export function askProjectKnowledge(projectId, query, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/knowledge/ask`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }), signal,
  })
}

// The UI's pre-existing "chat" terminology is now a campaign. Keeping this
// small adapter avoids a visual rewrite while moving all state to PostgreSQL.
export async function listChats(projectId, { signal } = {}) {
  const data = await request(`/projects/${encodeURIComponent(projectId)}/campaigns?limit=100`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  return Array.isArray(data?.items) ? data.items.map(asChat) : []
}

export async function createChat(projectId, title, { signal } = {}) {
  const campaign = await request(`/projects/${encodeURIComponent(projectId)}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title }),
    signal,
  })
  return asChat(campaign)
}

export async function renameChat(campaignId, title, { signal } = {}) {
  const campaign = await request(`/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title }),
    signal,
  })
  return asChat(campaign)
}

export function deleteChat(_projectId, campaignId, { signal } = {}) {
  return request(`/campaigns/${encodeURIComponent(campaignId)}`, { method: 'DELETE', signal })
}

export async function getProjectHistory(projectId, { signal } = {}) {
  const entries = await request(`/projects/${encodeURIComponent(projectId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  return Array.isArray(entries) ? entries.map(normalizeHistoryEntry) : []
}

export async function getChatHistory(_projectId, campaignId, { signal } = {}) {
  const entries = await request(`/campaigns/${encodeURIComponent(campaignId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  return Array.isArray(entries) ? entries.map(normalizeHistoryEntry) : []
}

export function reviewStrategy(strategyId, { action, note, output }, { signal } = {}) {
  return request(`/strategies/${encodeURIComponent(strategyId)}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, note, ...(output ? { output } : {}) }),
    signal,
  })
}

export function listStrategyReviews(strategyId, { signal } = {}) {
  return request(`/strategies/${encodeURIComponent(strategyId)}/reviews`, {
    headers: { Accept: 'application/json' },
    signal,
  })
}

export async function regenerateStrategySection(strategyId, section, feedback, { signal } = {}) {
  const record = await request(`/strategies/${encodeURIComponent(strategyId)}/sections/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, feedback }),
    signal,
  })
  return { runId: record.id, status: workflowState(record).status }
}

export async function startStrategy(input, { signal, chatId: campaignId } = {}) {
  if (!campaignId) throw new Error('Choose a campaign before starting a strategy.')
  const record = await request(`/campaigns/${encodeURIComponent(campaignId)}/strategy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  })
  return { runId: record.id, status: workflowState(record).status }
}

export async function startContent(input, { signal, chatId: campaignId, strategyId } = {}) {
  if (!campaignId) throw new Error('Choose a campaign before creating content.')
  if (!strategyId) throw new Error('Choose a completed strategy before creating content.')
  const record = await request(`/campaigns/${encodeURIComponent(campaignId)}/content-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, strategyId }),
    signal,
  })
  return { runId: record.id, status: workflowState(record).status }
}

export function cancelStrategy(strategyId, { signal } = {}) {
  return request(`/strategies/${encodeURIComponent(strategyId)}/cancel`, {
    method: 'POST',
    signal,
  })
}

export function cancelContent(contentRunId, { signal } = {}) {
  return request(`/content-runs/${encodeURIComponent(contentRunId)}/cancel`, {
    method: 'POST',
    signal,
  })
}

async function getWorkflow(kind, id, { signal } = {}) {
  const path = kind === 'strategy' ? `/strategies/${encodeURIComponent(id)}` : `/content-runs/${encodeURIComponent(id)}`
  return workflowState(await request(path, { headers: { Accept: 'application/json' }, signal }))
}

// SSE supplies immediate agent/step updates. The existing wait helpers remain
// the durable fallback and retrieve the final persisted output.
export function subscribeToWorkflow(kind, runId, { onProgress, onError } = {}) {
  const path = kind === 'strategy' ? `/strategies/${encodeURIComponent(runId)}/events` : `/content-runs/${encodeURIComponent(runId)}/events`
  const source = new EventSource(`${getApiBase()}${path}`, { withCredentials: true })
  source.onmessage = (event) => {
    try {
      onProgress?.(JSON.parse(event.data))
    } catch {
      // Ignore a malformed progress event; polling will still recover state.
    }
  }
  source.onerror = () => onError?.()
  return () => source.close()
}

export const TERMINAL_STATES = new Set(['success', 'failed', 'canceled'])

function abortableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function waitForWorkflow(kind, runId, options = {}) {
  const { signal, intervalMs = 1500, maxAttempts = 400, onTick, shouldPoll } = options
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    // A healthy SSE stream already has fresher progress than this fallback.
    // Keep the loop alive without issuing browser-to-backend status requests.
    if (shouldPoll?.() === false) {
      await abortableDelay(intervalMs, signal)
      continue
    }
    const state = await getWorkflow(kind, runId, { signal })
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    onTick?.(state, attempt)
    if (TERMINAL_STATES.has(state.status)) return state
    await abortableDelay(intervalMs, signal)
  }
  throw new Error(`Timed out waiting for the ${kind} workflow to finish`)
}

export function waitForStrategy(runId, options = {}) {
  return waitForWorkflow('strategy', runId, options)
}

export function waitForContent(runId, options = {}) {
  return waitForWorkflow('content', runId, options)
}

export async function waitForWorkflowBilling(
  kind,
  runId,
  { signal, intervalMs = 2000, maxAttempts = 15, onTick } = {},
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const state = await getWorkflow(kind, runId, { signal })
    onTick?.(state, attempt)
    if (state.billing.status !== 'pending') return state
    await abortableDelay(intervalMs, signal)
  }
  return getWorkflow(kind, runId, { signal })
}

export function getMetaConnectorStatus({ signal } = {}) {
  return request('/connectors/meta/status', { headers: { Accept: 'application/json' }, signal })
}

export function startMetaConnection({ signal } = {}) {
  return request('/connectors/meta/oauth/start', { method: 'POST', signal })
}

export function syncMetaConnection({ signal } = {}) {
  return request('/connectors/meta/sync', { method: 'POST', signal })
}

export function selectMetaAccount(accountId, selected, { signal } = {}) {
  return request(`/connectors/meta/accounts/${encodeURIComponent(accountId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected }),
    signal,
  })
}

export function disconnectMeta({ signal } = {}) {
  return request('/connectors/meta', { method: 'DELETE', signal })
}

export async function listCampaignContents(campaignId, { signal } = {}) {
  const data = await request(`/campaigns/${encodeURIComponent(campaignId)}/contents?status=READY&limit=100`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  return Array.isArray(data?.items) ? data.items : []
}

export function schedulePublication(contentId, socialAccountId, scheduledFor, { signal } = {}) {
  return request(`/contents/${encodeURIComponent(contentId)}/publications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socialAccountId, ...(scheduledFor ? { scheduledFor } : {}) }),
    signal,
  })
}

export async function listPublications({ status, signal } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}&limit=100` : '?limit=100'
  const data = await request(`/publications${query}`, { headers: { Accept: 'application/json' }, signal })
  return { items: Array.isArray(data?.items) ? data.items : [], meta: data?.meta }
}

export function cancelPublication(publicationId, { signal } = {}) {
  return request(`/publications/${encodeURIComponent(publicationId)}`, { method: 'DELETE', signal })
}

export function retryPublication(publicationId, { signal } = {}) {
  return request(`/publications/${encodeURIComponent(publicationId)}/retry`, { method: 'POST', signal })
}
