# AetherFlow AI frontend

React/Vite frontend for the marketing strategy and content workflows in the
sibling `../marketing-workflow-demo` Mastra service.

## Run the connected generate flow

Start the marketing workflow API:

```bash
cd ../marketing-workflow-demo
npm run server
```

Then start this frontend:

```bash
cp .env.example .env
npm run dev
```

Open `/generate`. The default environment value connects to:

```env
VITE_API_BASE_URL=http://localhost:4112/api
```

Replace that value in `.env` when the campaign API is deployed elsewhere. Vite
environment values are bundled into the browser, so do not place private API
keys in this frontend file.

## Authentication

Authentication uses the Better Auth session cookie exposed by the backend on
`/api/auth`. The frontend never stores the session token in browser storage.
For local development, Vite proxies `/api` to `http://localhost:3000`:

```env
VITE_AUTH_API_BASE_URL=/api
```

The frontend includes password signup with email verification, password login,
email OTP login, session restoration, and logout. If the auth backend is hosted
on another origin in production, set `VITE_AUTH_API_BASE_URL` to its `/api`
base and configure backend CORS to allow credentials.

The form sends the brief to `POST /api/strategy`, polls the marketing strategy
workflow, and shows the structured plan for approval. Only after approval does
the frontend send the strategy to `POST /api/content` to generate posts, visual
prompts, hashtags, QA notes, and the final calendar. The visual-generation
switch can be turned off when the configured image provider is unavailable or
rate-limited. The current brief, reviewed strategy, and completed campaign are
persisted locally so a browser refresh does not clear the workspace.

## Checks

```bash
npm run lint
npm run build
```
