import type { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import { FEEDS, getAllowedFeedById } from '../_lib/feeds';
import type { Feed, FeedCategory, RegionPreset } from '../_lib/feeds';

const parser = new RSSParser({ timeout: 8000 });

interface NormalizedItem {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAtISO: string;
  category: string;
  regionTags: string[];
  tags: string[];
  summary?: string;
}

interface SourceHealth {
  feedId: string;
  ok: boolean;
  status?: number;
  error?: string;
  fetchedAtISO?: string;
  itemCount?: number;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function normalizeItem(raw: RSSParser.Item, feed: Feed): NormalizedItem {
  const url = raw.link || '';
  const title = sanitize(raw.title || 'Untitled');
  const pubDate = raw.isoDate || raw.pubDate || '';
  const tags: string[] = [...(feed.regionTags || [])];
  let publishedAtISO: string;

  try {
    publishedAtISO = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    if (!pubDate) tags.push('inferred-date');
  } catch {
    publishedAtISO = new Date().toISOString();
    tags.push('inferred-date');
  }

  const snippet = sanitize(raw.contentSnippet || raw.content || '').slice(0, 500);

  return {
    id: simpleHash(url || `${title}:${publishedAtISO}`),
    title,
    url,
    sourceId: feed.id,
    sourceName: feed.name,
    publishedAtISO,
    category: feed.category === 'regional' ? 'geopolitics' : feed.category,
    regionTags: feed.regionTags || [],
    tags,
    summary: snippet || undefined,
  };
}

function selectFeeds(
  tab: string,
  region: string,
  enabledIds: string[] | null
): Feed[] {
  let pool = FEEDS;

  // Filter by enabled IDs if provided, otherwise use defaults
  if (enabledIds && enabledIds.length > 0) {
    const validIds = new Set(enabledIds.filter(id => getAllowedFeedById(id)));
    pool = pool.filter(f => validIds.has(f.id));
  } else {
    pool = pool.filter(f => f.enabledDefault);
  }

  // Filter by tab/category
  if (tab === 'local') {
    // For local, include feeds with matching regionTags
    const validRegion = region as RegionPreset;
    if (validRegion && validRegion !== 'global') {
      pool = pool.filter(f =>
        (f.regionTags || []).includes(validRegion) ||
        (f.regionTags || []).includes('global' as RegionPreset)
      );
    }
  } else {
    const validCategories: Record<string, FeedCategory[]> = {
      geopolitics: ['geopolitics', 'regional'],
      tech: ['tech'],
      finance: ['finance'],
    };
    const cats = validCategories[tab] || ['geopolitics'];
    pool = pool.filter(f => cats.includes(f.category));
  }

  return pool;
}

// Concurrency limiter
async function fetchWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      try {
        const value = await tasks[i]();
        results[i] = { status: 'fulfilled', value };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
    return res.status(204).end();
  }
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);

  const tab = (typeof req.query.tab === 'string' ? req.query.tab : 'geopolitics');
  const region = (typeof req.query.region === 'string' ? req.query.region : 'global');
  const limitRaw = parseInt(typeof req.query.limit === 'string' ? req.query.limit : '60', 10);
  const limit = Math.max(1, Math.min(isNaN(limitRaw) ? 60 : limitRaw, 120));
  const enabledParam = typeof req.query.enabled === 'string' ? req.query.enabled : '';
  const enabledIds = enabledParam ? enabledParam.split(',').filter(Boolean) : null;

  const feeds = selectFeeds(tab, region, enabledIds);

  if (feeds.length === 0) {
    return res.status(200).json({
      items: [],
      sourcesHealth: [],
      generatedAtISO: new Date().toISOString(),
      totalBeforeLimit: 0,
    });
  }

  const sourcesHealth: SourceHealth[] = [];
  const allItems: NormalizedItem[] = [];

  const tasks = feeds.map(feed => async () => {
    const parsed = await parser.parseURL(feed.url);
    return { feed, parsed };
  });

  const results = await fetchWithConcurrency(tasks, 6);

  for (let i = 0; i < results.length; i++) {
    const feed = feeds[i];
    const result = results[i];

    if (result.status === 'fulfilled') {
      const items = (result.value.parsed.items || []).map(item =>
        normalizeItem(item, feed)
      );
      allItems.push(...items);
      sourcesHealth.push({
        feedId: feed.id,
        ok: true,
        fetchedAtISO: new Date().toISOString(),
        itemCount: items.length,
      });
    } else {
      const errMsg = result.reason instanceof Error ? result.reason.message : 'Unknown error';
      sourcesHealth.push({
        feedId: feed.id,
        ok: false,
        error: errMsg,
      });
    }
  }

  // Dedup by URL hash, then title hash
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    const key = simpleHash(item.url || item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date desc
  deduped.sort((a, b) =>
    new Date(b.publishedAtISO).getTime() - new Date(a.publishedAtISO).getTime()
  );

  const totalBeforeLimit = deduped.length;
  const items = deduped.slice(0, limit);

  const okCount = sourcesHealth.filter(s => s.ok).length;
  if (okCount === 0 && feeds.length > 0) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      error: 'All feeds failed',
      sourcesHealth,
    });
  }

  res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=600');
  return res.json({
    items,
    sourcesHealth,
    generatedAtISO: new Date().toISOString(),
    totalBeforeLimit,
  });
}
