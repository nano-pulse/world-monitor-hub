import { useEffect, useRef, useState, useCallback } from 'react';
import type { NewsItem } from '../data/types';
import { useDashboardStore } from '../state/useDashboardStore';
import { fetchNews } from './news';
import { toast } from 'sonner';

export function useNews() {
  const newsTab = useDashboardStore(s => s.newsTab);
  const regionPreset = useDashboardStore(s => s.regionPreset);
  const searchQuery = useDashboardStore(s => s.searchQuery);
  const enabledNewsSources = useDashboardStore(s => s.enabledNewsSources);
  const proxyUrl = useDashboardStore(s => s.newsProxyUrl);
  const setNewsItems = useDashboardStore(s => s.setNewsItems);

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourcesHealth, setSourcesHealth] = useState({ ok: 0, total: 0 });
  const [fromProxy, setFromProxy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(async (showLoading = true) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (showLoading) setLoading(true);
    try {
      const result = await fetchNews({
        proxyUrl,
        enabledFeeds: enabledNewsSources,
        tab: newsTab,
        region: regionPreset,
        searchQuery,
        signal: controller.signal,
      });
      if (!mountedRef.current) return;
      setItems(result.items);
      setNewsItems(result.items);
      setSourcesHealth({ ok: result.sourcesOk, total: result.sourcesTotal });
      setFromProxy(result.fromProxy);
      setUpdatedAt(new Date().toISOString());
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!mountedRef.current) return;
      toast.error('Failed to load news');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [proxyUrl, enabledNewsSources, newsTab, regionPreset, searchQuery, setNewsItems]);

  useEffect(() => {
    mountedRef.current = true;
    const delay = setTimeout(() => doFetch(), 200);
    return () => {
      mountedRef.current = false;
      clearTimeout(delay);
      abortRef.current?.abort();
    };
  }, [doFetch]);

  return { items, loading, sourcesHealth, fromProxy, updatedAt, refetch: () => doFetch(false) };
}
