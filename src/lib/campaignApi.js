// Tiny client for the marketing workflow API served by ../marketing-workflow-demo.
// The server exposes:
//   POST /api/strategy            -> 202 { runId, status }
//   GET  /api/strategy/:runId     -> 200 { status, result?, error? }
//   POST /api/content             -> 202 { runId, status }
//   GET  /api/content/:runId      -> 200 { status, result?, error? }
//
// On content success, `result` is the content workflow output:
//   - strategy: { coreNarrative, contentPillars[], tonePerPlatform, rationale }
//   - calendar: [{ date, platform, caption, hashtags[], visualPrompt, imageUrl?, cta }]
//   - notes:    [{ postId?, severity: 'info'|'warning'|'error', message, resolved }]

const DEFAULT_BASE = 'http://localhost:4112/api'

export function getApiBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL
  const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_BASE
  return base.replace(/\/$/, '')
}

async function readError(res) {
  try {
    const data = await res.json()
    if (Array.isArray(data?.details)) {
      return data.details.map((issue) => issue?.message ?? JSON.stringify(issue)).join('; ')
    }
    if (data?.error) return data.error
    return `Request failed with status ${res.status}`
  } catch {
    return `Request failed with status ${res.status}`
  }
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
      `Cannot reach the workflow API at ${getApiBase()}. ` +
        'Check VITE_API_BASE_URL and make sure the marketing workflow server is running.',
      { cause: error },
    )
  }
}

export async function startCampaign(brief, { signal } = {}) {
  const res = await apiFetch('/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brief),
    signal,
  })

  if (!res.ok) {
    throw new Error(await readError(res))
  }

  const data = await res.json()
  if (!data?.runId) {
    throw new Error('Server responded without a runId')
  }
  return { runId: data.runId, status: data.status }
}

async function startWorkflow(kind, input, { signal, projectId, chatId } = {}) {
  const res = await apiFetch(`/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectId ? { ...input, projectId, ...(chatId ? { chatId } : {}) } : input),
    signal,
  })

  if (!res.ok) throw new Error(await readError(res))

  const data = await res.json()
  if (!data?.runId) throw new Error(`Server responded without a ${kind} run id`)
  return { runId: data.runId, status: data.status }
}

export function startStrategy(input, options = {}) {
  return startWorkflow('strategy', input, options)
}

export function startContent(input, options = {}) {
  return startWorkflow('content', input, options)
}

export async function listProjects({ signal } = {}) {
  const res = await apiFetch('/projects', { headers: { Accept: 'application/json' }, signal })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return Array.isArray(data?.projects) ? data.projects : []
}

export async function createProject(name, { signal } = {}) {
  const res = await apiFetch('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  if (!data?.project) throw new Error('Server responded without a project')
  return data.project
}

export async function renameProject(projectId, name, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  if (!data?.project) throw new Error('Server responded without a project')
  return data.project
}

export async function deleteProject(projectId, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE', signal })
  if (!res.ok) throw new Error(await readError(res))
}

export async function listChats(projectId, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/chats`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return Array.isArray(data?.chats) ? data.chats : []
}

export async function createChat(projectId, title, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  if (!data?.chat) throw new Error('Server responded without a chat')
  return data.chat
}

export async function deleteChat(projectId, chatId, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/chats/${encodeURIComponent(chatId)}`, {
    method: 'DELETE',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
}

export async function getProjectHistory(projectId, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return Array.isArray(data?.history) ? data.history : []
}

export async function getChatHistory(projectId, chatId, { signal } = {}) {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}/chats/${encodeURIComponent(chatId)}/history`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return Array.isArray(data?.history) ? data.history : []
}

export async function getCampaign(runId, { signal } = {}) {
  const res = await apiFetch(`/campaign/${encodeURIComponent(runId)}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return res.json()
}

export async function cancelCampaign(runId, { signal } = {}) {
  const res = await apiFetch(`/campaign/${encodeURIComponent(runId)}/cancel`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return res.json()
}

async function getWorkflow(kind, runId, { signal } = {}) {
  const res = await apiFetch(`/${kind}/${encodeURIComponent(runId)}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

async function cancelWorkflow(kind, runId, { signal } = {}) {
  const res = await apiFetch(`/${kind}/${encodeURIComponent(runId)}/cancel`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export function getStrategy(runId, options = {}) {
  return getWorkflow('strategy', runId, options)
}

export function getContent(runId, options = {}) {
  return getWorkflow('content', runId, options)
}

export function cancelStrategy(runId, options = {}) {
  return cancelWorkflow('strategy', runId, options)
}

export function cancelContent(runId, options = {}) {
  return cancelWorkflow('content', runId, options)
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

// Polls the run until it reaches a terminal state. Aborts cleanly when the
// provided AbortController signals. Returns the final run state.
export async function waitForCampaign(runId, options = {}) {
  const {
    signal,
    intervalMs = 1500,
    maxAttempts = 400,
    onTick,
  } = options

  let attempt = 0
  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    attempt += 1
    if (attempt > maxAttempts) {
      throw new Error('Timed out waiting for the campaign to finish')
    }

    const state = await getCampaign(runId, { signal })
    onTick?.(state, attempt)

    if (TERMINAL_STATES.has(state.status)) {
      return state
    }

    await abortableDelay(intervalMs, signal)
  }
}

async function waitForWorkflow(kind, runId, options = {}) {
  const {
    signal,
    intervalMs = 1500,
    maxAttempts = 400,
    onTick,
  } = options

  let attempt = 0
  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    attempt += 1
    if (attempt > maxAttempts) throw new Error(`Timed out waiting for the ${kind} workflow to finish`)

    const state = await getWorkflow(kind, runId, { signal })
    onTick?.(state, attempt)
    if (TERMINAL_STATES.has(state.status)) return state
    await abortableDelay(intervalMs, signal)
  }
}

export function waitForStrategy(runId, options = {}) {
  return waitForWorkflow('strategy', runId, options)
}

export function waitForContent(runId, options = {}) {
  return waitForWorkflow('content', runId, options)
}
