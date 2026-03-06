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

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourcesHealth, setSourcesHealth] = useState({ ok: 0, total: 0 });
  const [fromProxy, setFromProxy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await fetchNews({
        proxyUrl,
        enabledFeeds: enabledNewsSources,
        tab: newsTab,
        region: regionPreset,
        searchQuery,
      });
      if (!mountedRef.current) return;
      setItems(result.items);
      setSourcesHealth({ ok: result.sourcesOk, total: result.sourcesTotal });
      setFromProxy(result.fromProxy);
      setUpdatedAt(new Date().toISOString());
    } catch (err: any) {
      if (!mountedRef.current) return;
      toast.error('Failed to load news');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [proxyUrl, enabledNewsSources, newsTab, regionPreset, searchQuery]);

  useEffect(() => {
    mountedRef.current = true;
    // Simulate small delay for mock data
    const delay = setTimeout(() => doFetch(), 200);
    return () => { mountedRef.current = false; clearTimeout(delay); };
  }, [doFetch]);

  return { items, loading, sourcesHealth, fromProxy, updatedAt, refetch: () => doFetch(false) };
}
