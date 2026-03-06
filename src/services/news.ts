import type { NewsItem } from '../data/types';
import { newsMock } from '../data/news.mock';
import { feedsRegistry } from '../data/feeds.registry';
import { cacheGet, cacheSet } from './cache';
import { httpGet, trackError } from './http';
import { simpleHash } from './hash';
import { REGION_TAGS } from '../data/types';
import type { RegionPreset, NewsTab } from '../data/types';

const NEWS_CACHE_TTL = 300_000; // 5 min

interface ProxyResponse {
  items: Array<{
    title: string;
    link: string;
    pubDate?: string;
    isoDate?: string;
    contentSnippet?: string;
    content?: string;
    categories?: string[];
  }>;
}

/**
 * Fetch news from configured proxy. Falls back to mock data if proxy unavailable.
 */
export async function fetchNews(opts: {
  proxyUrl: string;
  enabledFeeds: Record<string, boolean>;
  tab: NewsTab;
  region: RegionPreset;
  searchQuery: string;
}): Promise<{ items: NewsItem[]; sourcesOk: number; sourcesTotal: number; fromProxy: boolean }> {
  const { proxyUrl, enabledFeeds, tab, region, searchQuery } = opts;

  // Determine which feeds to fetch
  const feedsToFetch = feedsRegistry.filter(f => {
    if (!enabledFeeds[f.id]) return false;
    if (tab === 'local') return true; // filter by region after
    if (tab === 'geopolitics') return f.category === 'geopolitics' || f.category === 'regional';
    return f.category === tab;
  });

  // If no proxy URL configured, use mock data
  if (!proxyUrl) {
    return useMockData(enabledFeeds, tab, region, searchQuery);
  }

  const cacheKey = `news:${tab}:${region}:${simpleHash(JSON.stringify(Object.keys(enabledFeeds).filter(k => enabledFeeds[k])))}`;
  const cached = cacheGet<NewsItem[]>(cacheKey, NEWS_CACHE_TTL);
  if (cached) {
    const filtered = filterItems(cached, searchQuery, tab, region);
    return { items: filtered, sourcesOk: feedsToFetch.length, sourcesTotal: feedsToFetch.length, fromProxy: true };
  }

  let allItems: NewsItem[] = [];
  let sourcesOk = 0;

  // Fetch each feed through proxy
  const results = await Promise.allSettled(
    feedsToFetch.map(async (feed) => {
      try {
        const url = `${proxyUrl}?url=${encodeURIComponent(feed.url)}`;
        const data = await httpGet<ProxyResponse>(url, { timeoutMs: 8000 });
        sourcesOk++;
        return (data.items || []).map(item => normalizeItem(item, feed));
      } catch (err) {
        trackError(`news:${feed.id}`, err);
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value);
  }

  // Dedup by URL hash
  allItems = dedup(allItems);
  allItems.sort((a, b) => new Date(b.publishedAtISO).getTime() - new Date(a.publishedAtISO).getTime());

  if (allItems.length > 0) {
    cacheSet(cacheKey, allItems);
  }

  const filtered = filterItems(allItems, searchQuery, tab, region);
  return { items: filtered, sourcesOk, sourcesTotal: feedsToFetch.length, fromProxy: true };
}

function normalizeItem(raw: any, feed: typeof feedsRegistry[0]): NewsItem {
  const url = raw.link || raw.url || '';
  return {
    id: simpleHash(url || raw.title || String(Math.random())),
    title: sanitizeText(raw.title || 'Untitled'),
    url,
    sourceId: feed.id,
    sourceName: feed.name,
    publishedAtISO: raw.isoDate || raw.pubDate || new Date().toISOString(),
    category: feed.category === 'regional' ? 'geopolitics' : feed.category,
    tags: (raw.categories || feed.regionTags || []).slice(0, 5),
    summary: sanitizeText(raw.contentSnippet || raw.content || '').slice(0, 500),
  };
}

function sanitizeText(text: string): string {
  // Strip HTML tags
  return text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function dedup(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = simpleHash(item.url || item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    if (!enabledFeeds[item.sourceId] && enabledFeeds[item.sourceId] !== undefined) return false;
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
