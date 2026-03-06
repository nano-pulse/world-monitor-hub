import { useEffect, useRef, useState, useCallback } from 'react';
import type { FireEvent } from '../data/types';
import { useDashboardStore } from '../state/useDashboardStore';
import { fetchWildfires } from './eonet';
import { toast } from 'sonner';

export function useWildfires() {
  const enabled = useDashboardStore(s => s.enabledLayers.wildfires);
  const autoRefresh = useDashboardStore(s => s.autoRefresh);
  const [fires, setFires] = useState<FireEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await fetchWildfires();
      if (!mountedRef.current) return;
      setFires(result.data);
      setStale(result.fromCache);
      setUpdatedAt(new Date().toISOString());
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError('Failed to load wildfire data');
      setStale(true);
      toast.error('Network error loading wildfires');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) doFetch();
    return () => { mountedRef.current = false; };
  }, [enabled, doFetch]);

  useEffect(() => {
    if (!autoRefresh || !enabled) return;
    const id = setInterval(() => doFetch(false), 300_000);
    return () => clearInterval(id);
  }, [autoRefresh, enabled, doFetch]);

  return { fires, loading, error, stale, updatedAt, refetch: doFetch };
}
