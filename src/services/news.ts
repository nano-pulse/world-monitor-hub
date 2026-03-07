import type { NewsItem } from '../data/types';
import { newsMock } from '../data/news.mock';
import { cacheGet, cacheSet, cacheGetStale } from './cache';
import { simpleHash } from './hash';
import { REGION_TAGS } from '../data/types';
import type { RegionPreset, NewsTab } from '../data/types';
import { trackError } from './http';

const DIGEST_CACHE_TTL = 90_000; // 90s client TTL

interface DigestResponse {
  items: Array<{
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
  }>;
  sourcesHealth: Array<{
    feedId: string;
    ok: boolean;
    error?: string;
    itemCount?: number;
  }>;
  generatedAtISO: string;
  totalBeforeLimit: number;
}

function buildDigestUrl(opts: {
  tab: NewsTab;
  region: RegionPreset;
  enabledFeedIds: string[];
  limit: number;
}): string {
  const params = new URLSearchParams();
  params.set('tab', opts.tab);
  params.set('region', opts.region);
  params.set('limit', String(opts.limit));
  if (opts.enabledFeedIds.length > 0) {
    params.set('enabled', opts.enabledFeedIds.join(','));
  }
  return `/api/news/digest?${params.toString()}`;
}

function cacheKey(tab: string, region: string, enabledHash: string): string {
  return `newsDigest:${tab}:${region}:${enabledHash}`;
}

/**
 * Fetch news: tries /api/news/digest first, falls back to mock data.
 */
export async function fetchNews(opts: {
  proxyUrl: string; // kept for backwards compat but ignored now
  enabledFeeds: Record<string, boolean>;
  tab: NewsTab;
  region: RegionPreset;
  searchQuery: string;
  signal?: AbortSignal;
}): Promise<{ items: NewsItem[]; sourcesOk: number; sourcesTotal: number; fromProxy: boolean }> {
  const { enabledFeeds, tab, region, searchQuery, signal } = opts;

  const enabledIds = Object.keys(enabledFeeds).filter(k => enabledFeeds[k]);
  const ek = simpleHash(enabledIds.sort().join(','));
  const ck = cacheKey(tab, region, ek);

  // Try digest endpoint
  try {
    // Check client cache first
    const cached = cacheGet<DigestResponse>(ck, DIGEST_CACHE_TTL);
    if (cached) {
      const items = normalizeDigestItems(cached.items);
      const filtered = filterItems(items, searchQuery, tab, region);
      const okCount = cached.sourcesHealth.filter(s => s.ok).length;
      return { items: filtered, sourcesOk: okCount, sourcesTotal: cached.sourcesHealth.length, fromProxy: true };
    }

    // Show stale while fetching
    const stale = cacheGetStale<DigestResponse>(ck);

    const url = buildDigestUrl({ tab, region, enabledFeedIds: enabledIds, limit: 80 });
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data: DigestResponse = await res.json();
      cacheSet(ck, data);
      const items = normalizeDigestItems(data.items);
      const filtered = filterItems(items, searchQuery, tab, region);
      const okCount = data.sourcesHealth.filter(s => s.ok).length;
      return { items: filtered, sourcesOk: okCount, sourcesTotal: data.sourcesHealth.length, fromProxy: true };
    }

    // If stale data exists, use it
    if (stale) {
      const items = normalizeDigestItems(stale.items);
      const filtered = filterItems(items, searchQuery, tab, region);
      return { items: filtered, sourcesOk: 0, sourcesTotal: 0, fromProxy: true };
    }

    // Fall through to mock
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    trackError('news:digest', err);

    // Use stale if available
    const stale = cacheGetStale<DigestResponse>(ck);
    if (stale) {
      const items = normalizeDigestItems(stale.items);
      const filtered = filterItems(items, searchQuery, tab, region);
      return { items: filtered, sourcesOk: 0, sourcesTotal: 0, fromProxy: true };
    }
  }

  // Fallback to mock data
  return useMockData(enabledFeeds, tab, region, searchQuery);
}

function normalizeDigestItems(raw: DigestResponse['items']): NewsItem[] {
  return raw.map(item => ({
    id: item.id,
    title: item.title,
    url: item.url,
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    publishedAtISO: item.publishedAtISO,
    category: (item.category === 'geopolitics' || item.category === 'tech' || item.category === 'finance')
      ? item.category
      : 'geopolitics',
    tags: item.tags || [],
    summary: item.summary || '',
  }));
}

function filterItems(items: NewsItem[], searchQuery: string, tab: NewsTab, region: RegionPreset): NewsItem[] {
  return items.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tab === 'local') {
      const tags = REGION_TAGS[region];
      if (tags.length === 0) return true;
      return item.tags.some(t => tags.some(rt => t.toLowerCase().includes(rt.toLowerCase())));
    }
    return true;
  });
}

function useMockData(enabledFeeds: Record<string, boolean>, tab: NewsTab, region: RegionPreset, searchQuery: string): {
  items: NewsItem[];
  sourcesOk: number;
  sourcesTotal: number;
  fromProxy: boolean;
} {
  const filtered = newsMock.filter(item => {
    if (enabledFeeds[item.sourceId] === false) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tab === 'local') {
      const tags = REGION_TAGS[region];
      if (tags.length === 0) return true;
      return item.tags.some(t => tags.some(rt => t.toLowerCase().includes(rt.toLowerCase())));
    }
    return item.category === tab;
  });
  return { items: filtered, sourcesOk: 0, sourcesTotal: 0, fromProxy: false };
}
