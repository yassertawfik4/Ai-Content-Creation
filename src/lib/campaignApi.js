// Browser client for the Nest application API. The Mastra service is reached
// by Nest workers only; it is never a browser data source.
const DEFAULT_BASE = '/api'

export function getApiBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL
  const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_BASE
  return base.replace(/\/$/, '')
}

async function readError(res) {
  try {
    const data = await res.json()
    if (Array.isArray(data?.message)) return data.message.join('; ')
    if (typeof data?.message === 'string') return data.message
    if (typeof data?.error === 'string') return data.error
  } catch {
    // Keep the status fallback below for non-JSON responses.
  }
  return `Request failed with status ${res.status}`
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
  if (!res.ok) throw new Error(await readError(res))
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
    READY: 'success',
    FAILED: 'failed',
  }
  return {
    ...record,
    status: statusByBackendStatus[record.status] ?? 'failed',
    result: record.output,
  }
}

export async function listProjects({ signal } = {}) {
  const data = await request('/projects?limit=100', { headers: { Accept: 'application/json' }, signal })
  return Array.isArray(data?.items) ? data.items.map((project) => ({
    ...project,
    color: '#d0bcff',
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

export function deleteProject(projectId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE', signal })
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

export function deleteChat(_projectId, campaignId, { signal } = {}) {
  return request(`/campaigns/${encodeURIComponent(campaignId)}`, { method: 'DELETE', signal })
}

export async function getProjectHistory(projectId, { signal } = {}) {
  return request(`/projects/${encodeURIComponent(projectId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
}

export function getChatHistory(_projectId, campaignId, { signal } = {}) {
  return request(`/campaigns/${encodeURIComponent(campaignId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
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

export const TERMINAL_STATES = new Set(['success', 'failed'])

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
