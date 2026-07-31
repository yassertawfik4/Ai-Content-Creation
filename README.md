# AetherFlow AI frontend

React/Vite frontend for the campaign workflow in the sibling
`../content-creation` Mastra service.

## Run the connected generate flow

Start the campaign API:

```bash
cd ../content-creation
npm run server
```

Then start this frontend:

```bash
cp .env.example .env
npm run dev
```

Open `/generate`. The default environment value connects to:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Replace that value in `.env` when the campaign API is deployed elsewhere. Vite
environment values are bundled into the browser, so do not place private API
keys in this frontend file.

The form sends every campaign-brief field to `POST /api/campaign`, polls the run
endpoint until a terminal state, displays live workflow steps, and renders the
strategy, QA notes, and scheduled posts. The visual-generation switch can be
turned off when the configured image provider is unavailable or rate-limited.

## Checks

```bash
npm run lint
npm run build
```
