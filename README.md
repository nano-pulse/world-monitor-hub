# World Monitor — Global Intelligence Dashboard

A command-center style dashboard for monitoring global events including earthquakes, wildfires, and news.

## What's Real

- **Earthquakes**: Live USGS GeoJSON data with caching, auto-refresh, and map markers
- **Wildfires**: NASA EONET client-side fetching with map layer
- **News**: RSS aggregation via Vercel Serverless Functions (allowlist-only proxy)
- **Map**: MapLibre GL JS with interactive markers and selection sync
- **Signals**: Deterministic rules engine derived from earthquake data

## What Remains Mock

- News falls back to mock data when `/api/news/digest` is unavailable (e.g., local dev without Vercel)
- AI features require a user-configured local LLM endpoint (Ollama/LM Studio)

## Architecture

### Frontend (Vite SPA)
- React 18 + TypeScript + Tailwind CSS
- Zustand for state management with localStorage persistence
- MapLibre GL JS for map rendering
- react-virtuoso for virtualized lists

### Backend (Vercel Serverless Functions)
Located in `/api/`:

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/rss?feedId=<id>` | Single-feed RSS proxy (allowlist-only) |
| `GET /api/news/digest?tab=&region=&limit=&enabled=` | Multi-feed aggregator with dedup + sort |
| `GET /api/news/debug` | Smoke test — fetches 2 reliable feeds, returns item count + failures |

### RSS Security Model
- **Allowlist-only**: The proxy only accepts `feedId` parameters that match feeds defined in `api/_lib/feeds.ts`
- **No arbitrary URLs**: The client never sends raw URLs to the proxy
- **SSRF prevention**: Feed URLs are resolved server-side from the registry

### Adding Feeds Safely
1. Add the feed to both `api/_lib/feeds.ts` and `src/data/feeds.registry.ts`
2. Use a stable kebab-case `id`
3. Set `enabledDefault` appropriately
4. Deploy — the new feed is immediately available

### Caching
- **Server**: `Cache-Control: s-maxage=300, stale-while-revalidate=600` on RSS; `s-maxage=180` on digest
- **Client**: In-memory TTL cache (90s for digest, 60–180s for quakes)
- **Stale-while-revalidate**: Shows cached data instantly, refreshes in background

## Local Development

```sh
npm install
npm run dev
```

News will use mock data in local dev. To test real RSS, deploy to Vercel.

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel — it auto-detects the Vite build + `/api/` serverless functions
3. No env vars required for RSS (all feeds are public)
4. For AI features, configure a local LLM endpoint in the Settings drawer

### Environment Variables (optional)

| Variable | Description |
|---|---|
| `DEBUG_NEWS` | Set to `1` to include debug fields in `/api/news/digest` response and add `X-WorldMonitor-Debug` header |

### Required for AI (optional)
Configure in the app's Settings drawer:
- **Base URL**: e.g., `http://localhost:1234/v1` (Ollama/LM Studio)
- **Model**: e.g., `llama3.2`

## Production Smoke Test Checklist

After deploying, verify these endpoints return valid JSON:

```
GET /api/health
→ { ok: true, ts: "...", version: "v1" }

GET /api/news/debug
→ { ok: true/false, testedFeeds: [...], items: N, failures: [...], ts: "..." }

GET /api/rss?feedId=bbc-world
→ { feed: {...}, items: [...], sourceHealth: {...}, fetchedAtISO: "..." }

GET /api/news/digest?tab=geopolitics&region=global&limit=30
→ { items: [...], sourcesHealth: [...], generatedAtISO: "...", totalBeforeLimit: N }
```

### Enabling Debug Mode
Set `DEBUG_NEWS=1` as a Vercel environment variable. The digest response will include:
```json
{
  "debug": {
    "requestedTab": "geopolitics",
    "requestedRegion": "global",
    "enabledFeedIds": [],
    "fetchedFeedCount": 6,
    "okFeedCount": 5,
    "failedFeedCount": 1,
    "totalItemsBeforeDedup": 120,
    "totalItemsAfterDedup": 95,
    "totalReturned": 30
  }
}
```

### Typical Failure Causes
- **Feed blocks server IP**: Some feeds (Reuters, FT, Bloomberg) may block datacenter IPs. These are set to `enabledDefault: false`.
- **Timeout**: Default 8s timeout. Some feeds are slow; they'll fail gracefully and other feeds still return.
- **Invalid XML**: Parser handles gracefully; feed is marked as failed in `sourcesHealth`.
- **To shrink feed set for stability**: Only enable feeds with `enabledDefault: true` — these are tested to work reliably.

## Deployment (Vercel)

This repo intentionally does **NOT** pin a Node version in `package.json` (no `engines` field, no `.nvmrc`, no `.node-version`).

**Set the Node.js version ONLY in Vercel Project Settings → General → Node.js Version.**

- If Vercel build logs mention Node 18.x compatibility issues, set it to **18.x** in settings.
- If Vercel defaults to 20.x or later and builds succeed, leave it.
- Do **NOT** add conflicting Node version files to the repo.

> **Why?** Vercel Project Settings are the single source of truth. Repo-side pinning causes flip-flop failures when Vercel's runtime and build environments disagree.

### Routing

`vercel.json` uses Vercel's `routes` array to ensure `/api/*` always hits serverless functions and is **never** rewritten to `index.html` for SPA routing.

### Quick Smoke Test (after deploy)

```
GET /api/health       → { ok: true, node: "v20.x.x", ... }
GET /api/news/debug   → { ok: true/false, items: N, ... }
GET /api/news/digest?tab=geopolitics&region=global&limit=10
```

### Build Diagnostics

Run locally to print the active Node version:
```sh
npm run diagnose:node
```

## Next Steps
- Add deck.gl layers for high-density visualization
- Move caching to edge/Redis for multi-region
- Add GDELT unrest layer
