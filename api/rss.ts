import type { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import { getAllowedFeedById } from './_lib/feeds';
import type { Feed } from './_lib/feeds';

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
  fetchedAtISO?: string;
  itemCount?: number;
  error?: string;
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
    // Strip UTM params
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

  // Robust date parsing: try multiple fields
  const dateCandidate = raw.isoDate || raw.pubDate || (raw as Record<string, unknown>)['updated'] as string || '';
  let publishedAtISO: string;

  if (dateCandidate) {
    try {
      const d = new Date(dateCandidate);
      if (!isNaN(d.getTime())) {
        publishedAtISO = d.toISOString();
      } else {
        publishedAtISO = new Date().toISOString();
        tags.push('time_inferred');
      }
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

  const feedId = typeof req.query.feedId === 'string' ? req.query.feedId : '';
  if (!feedId) {
    return res.status(400).json({ error: 'Missing feedId parameter' });
  }

  const feed = getAllowedFeedById(feedId);
  if (!feed) {
    return res.status(400).json({ error: `Unknown feedId: ${feedId}` });
  }

  const health: SourceHealth = {
    feedId: feed.id,
    ok: false,
  };

  try {
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).map(item => normalizeItem(item, feed));

    health.ok = true;
    health.fetchedAtISO = new Date().toISOString();
    health.itemCount = items.length;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({
      feed: { id: feed.id, name: feed.name, category: feed.category },
      items,
      sourceHealth: health,
      fetchedAtISO: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'RSS fetch failed';
    health.error = message;

    return res.status(502).json({
      error: message,
      feedId: feed.id,
      sourceHealth: health,
      hint: 'This feed may be temporarily unavailable, blocking requests, or returning invalid XML.',
    });
  }
}
