// Tiny client for the campaign workflow API served by ../content-creation.
// The server exposes:
//   POST /api/campaign            -> 202 { runId, status }
//   GET  /api/campaign/:runId     -> 200 { status: 'running'|'success'|'failed', result?, error? }
//
// On success, `result` is the campaignWorkflow output:
//   { strategy, calendar[], notes[] }
//   - strategy: { coreNarrative, contentPillars[], tonePerPlatform, rationale }
//   - calendar: [{ date, platform, caption, hashtags[], visualPrompt, imageUrl?, cta }]
//   - notes:    [{ postId?, severity: 'info'|'warning'|'error', message, resolved }]

const DEFAULT_BASE = 'http://localhost:3001/api'

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
    return await fetch(`${getApiBase()}${path}`, options)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(
      `Cannot reach the campaign API at ${getApiBase()}. ` +
        'Check VITE_API_BASE_URL and make sure the content-creation server is running.',
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
