import type { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import { FEEDS, getAllowedFeedById } from '../_lib/feeds';
import type { Feed, FeedCategory, RegionPreset } from '../_lib/feeds';

const parser = new RSSParser({
  timeout: 8000,
  headers: {
    'User-Agent': 'WorldMonitor/1.0 (RSS Aggregator; +https://github.com/worldmonitor)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  requestOptions: {
    redirect: 'follow',
  },
});

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

function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  try {
    const u = new URL(trimmed);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(p => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return trimmed;
  }
}

function normalizeItem(raw: RSSParser.Item, feed: Feed): NormalizedItem {
  const url = normalizeUrl(raw.link || '');
  const title = sanitize(raw.title || 'Untitled');
  const tags: string[] = [...(feed.regionTags || [])];

  const dateCandidate = raw.isoDate || raw.pubDate || (raw as Record<string, unknown>)['updated'] as string || '';
  let publishedAtISO: string;

  if (dateCandidate) {
    try {
      const d = new Date(dateCandidate);
      publishedAtISO = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
      if (isNaN(d.getTime())) tags.push('time_inferred');
    } catch {
      publishedAtISO = new Date().toISOString();
      tags.push('time_inferred');
    }
  } else {
    publishedAtISO = new Date().toISOString();
    tags.push('time_inferred');
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

function selectFeeds(tab: string, region: string, enabledIds: string[] | null): Feed[] {
  let pool = FEEDS;

  if (enabledIds && enabledIds.length > 0) {
    const validIds = new Set(enabledIds.filter(id => getAllowedFeedById(id)));
    if (validIds.size > 0) {
      pool = pool.filter(f => validIds.has(f.id));
    } else {
      pool = pool.filter(f => f.enabledDefault);
    }
  } else {
    pool = pool.filter(f => f.enabledDefault);
  }

  if (tab === 'local') {
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

async function fetchFeedWithRetry(feed: Feed, retries = 1): Promise<{ feed: Feed; items: NormalizedItem[] }> {
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).map(item => normalizeItem(item, feed));
      return { feed, items };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  throw lastErr;
}

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

  const tab = typeof req.query.tab === 'string' ? req.query.tab : 'geopolitics';
  const region = typeof req.query.region === 'string' ? req.query.region : 'global';
  const limitRaw = parseInt(typeof req.query.limit === 'string' ? req.query.limit : '60', 10);
  const limit = Math.max(1, Math.min(isNaN(limitRaw) ? 60 : limitRaw, 120));
  const enabledParam = typeof req.query.enabled === 'string' ? req.query.enabled : '';
  const enabledIds = enabledParam ? enabledParam.split(',').filter(Boolean) : null;

  const feeds = selectFeeds(tab, region, enabledIds);
  const isDebug = process.env.DEBUG_NEWS === '1';

  if (isDebug) {
    res.setHeader('X-WorldMonitor-Debug', '1');
  }

  if (feeds.length === 0) {
    const body: Record<string, unknown> = {
      items: [],
      sourcesHealth: [],
      generatedAtISO: new Date().toISOString(),
      totalBeforeLimit: 0,
      totalAfterDedup: 0,
    };
    if (isDebug) {
      body.debug = {
        requestedTab: tab,
        requestedRegion: region,
        enabledFeedIds: enabledIds || [],
        fetchedFeedCount: 0,
        okFeedCount: 0,
        failedFeedCount: 0,
        totalItemsBeforeDedup: 0,
        totalItemsAfterDedup: 0,
        totalItemsAfterSort: 0,
        totalReturned: 0,
      };
    }
    return res.status(200).json(body);
  }

  const sourcesHealth: SourceHealth[] = [];
  const allItems: NormalizedItem[] = [];

  const tasks = feeds.map(feed => () => fetchFeedWithRetry(feed, 1));
  const results = await fetchWithConcurrency(tasks, 5);

  for (let i = 0; i < results.length; i++) {
    const feed = feeds[i];
    const result = results[i];

    if (result.status === 'fulfilled') {
      allItems.push(...result.value.items);
      sourcesHealth.push({
        feedId: feed.id,
        ok: true,
        fetchedAtISO: new Date().toISOString(),
        itemCount: result.value.items.length,
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

  const totalItemsBeforeDedup = allItems.length;

  // Dedup: primary by normalized URL, fallback by title hash
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    const urlKey = item.url ? simpleHash(item.url) : null;
    const titleKey = simpleHash(item.title + ':' + item.publishedAtISO.slice(0, 10));
    const key = urlKey || titleKey;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) =>
    new Date(b.publishedAtISO).getTime() - new Date(a.publishedAtISO).getTime()
  );

  const totalAfterDedup = deduped.length;
  const items = deduped.slice(0, limit);

  const okCount = sourcesHealth.filter(s => s.ok).length;
  const failedCount = sourcesHealth.filter(s => !s.ok).length;

  if (okCount === 0 && feeds.length > 0) {
    res.setHeader('Cache-Control', 'no-store');
    const body: Record<string, unknown> = {
      error: 'All feeds failed',
      items: [],
      sourcesHealth,
      generatedAtISO: new Date().toISOString(),
      totalBeforeLimit: 0,
      totalAfterDedup: 0,
    };
    if (isDebug) {
      body.debug = {
        requestedTab: tab,
        requestedRegion: region,
        enabledFeedIds: enabledIds || [],
        fetchedFeedCount: feeds.length,
        okFeedCount: 0,
        failedFeedCount: failedCount,
        totalItemsBeforeDedup: 0,
        totalItemsAfterDedup: 0,
        totalItemsAfterSort: 0,
        totalReturned: 0,
      };
    }
    return res.status(502).json(body);
  }

  res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=600');

  const body: Record<string, unknown> = {
    items,
    sourcesHealth,
    generatedAtISO: new Date().toISOString(),
    totalBeforeLimit: totalAfterDedup,
    totalAfterDedup,
  };

  if (isDebug) {
    body.debug = {
      requestedTab: tab,
      requestedRegion: region,
      enabledFeedIds: enabledIds || [],
      fetchedFeedCount: feeds.length,
      okFeedCount: okCount,
      failedFeedCount: failedCount,
      totalItemsBeforeDedup,
      totalItemsAfterDedup: totalAfterDedup,
      totalItemsAfterSort: totalAfterDedup,
      totalReturned: items.length,
    };
  }

  return res.json(body);
}
