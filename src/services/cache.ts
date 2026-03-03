interface CacheEntry<T> {
  fetchedAt: number;
  data: T;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string, ttlMs: number): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > ttlMs) return null;
  return entry.data;
}

export function cacheGetStale<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry ? entry.data : null;
}

export function cacheSet<T>(key: string, data: T): void {
  store.set(key, { fetchedAt: Date.now(), data });
}

export function getTtlForWindow(tw: string): number {
  if (tw === '1h' || tw === '6h') return 60_000;
  if (tw === '24h') return 120_000;
  return 180_000;
}

export function getRefreshIntervalForWindow(tw: string): number {
  if (tw === '1h' || tw === '6h') return 60_000;
  if (tw === '24h') return 120_000;
  return 180_000;
}
