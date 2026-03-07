import type { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import { getAllowedFeedById } from './_lib/feeds';
import type { Feed } from './_lib/feeds';

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
  let publishedAtISO: string;
  const tags: string[] = [...(feed.regionTags || [])];

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

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
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

  try {
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).map(item => normalizeItem(item, feed));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({
      feed: { id: feed.id, name: feed.name, category: feed.category },
      items,
      fetchedAtISO: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'RSS fetch failed';
    return res.status(502).json({ error: message, feedId: feed.id });
  }
}
