import { useEffect, useRef, useState, useCallback } from 'react';
import type { QuakeEvent } from '../data/types';
import { useDashboardStore } from '../state/useDashboardStore';
import { fetchEarthquakes } from './usgs';
import { getRefreshIntervalForWindow } from './cache';
import { toast } from 'sonner';

export function useQuakes() {
  const timeWindow = useDashboardStore(s => s.timeWindow);
  const minMagnitude = useDashboardStore(s => s.minMagnitude);
  const autoRefresh = useDashboardStore(s => s.autoRefresh);
  const setQuakesUpdatedAt = useDashboardStore(s => s.setQuakesUpdatedAt);

  const [quakes, setQuakes] = useState<QuakeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await fetchEarthquakes(timeWindow, minMagnitude);
      if (!mountedRef.current) return;
      setQuakes(result.data);
      setStale(result.fromCache);
      setQuakesUpdatedAt(new Date().toISOString());
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError('Failed to load earthquake data');
      setStale(true);
      toast.error('Network error loading earthquakes');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [timeWindow, minMagnitude, setQuakesUpdatedAt]);

  // Initial + filter-change fetch
  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    return () => { mountedRef.current = false; };
  }, [doFetch]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = getRefreshIntervalForWindow(timeWindow);
    const id = setInterval(() => doFetch(false), interval);
    return () => clearInterval(id);
  }, [autoRefresh, timeWindow, doFetch]);

  return { quakes, loading, error, stale, refetch: doFetch };
}
