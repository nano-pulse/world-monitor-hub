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

### Required for AI (optional)
Configure in the app's Settings drawer:
- **Base URL**: e.g., `http://localhost:1234/v1` (Ollama/LM Studio)
- **Model**: e.g., `llama3.2`

## Next Steps
- Add real RSS via deployed proxy
- Add deck.gl layers for high-density visualization
- Move caching to edge/Redis for multi-region
- Add GDELT unrest layer
