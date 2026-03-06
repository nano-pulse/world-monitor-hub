import type { FireEvent } from '../data/types';
import { cacheGet, cacheGetStale, cacheSet } from './cache';
import { httpGet, trackError } from './http';

const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events';
const CACHE_KEY = 'wildfires:eonet';
const CACHE_TTL = 300_000; // 5 minutes

interface EONETResponse {
  events: Array<{
    id: string;
    title: string;
    geometry: Array<{ date: string; coordinates: [number, number] }>;
    sources: Array<{ url: string }>;
  }>;
}

function parseEvents(data: EONETResponse): FireEvent[] {
  if (!data?.events) return [];
  return data.events
    .filter(e => e.geometry?.length > 0)
    .map(e => {
      const latest = e.geometry[e.geometry.length - 1];
      return {
        id: e.id,
        title: e.title,
        timeISO: latest.date,
        lon: latest.coordinates[0],
        lat: latest.coordinates[1],
        sourceUrl: e.sources?.[0]?.url || '',
      };
    });
}

let activeController: AbortController | null = null;

export async function fetchWildfires(): Promise<{ data: FireEvent[]; fromCache: boolean }> {
  const cached = cacheGet<FireEvent[]>(CACHE_KEY, CACHE_TTL);
  if (cached) return { data: cached, fromCache: true };

  if (activeController) activeController.abort();
  activeController = new AbortController();

  try {
    const url = `${EONET_URL}?category=wildfires&days=7&status=open`;
    const json = await httpGet<EONETResponse>(url, { signal: activeController.signal });
    const fires = parseEvents(json);
    cacheSet(CACHE_KEY, fires);
    return { data: fires, fromCache: false };
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    trackError('eonet', err);
    const stale = cacheGetStale<FireEvent[]>(CACHE_KEY);
    if (stale) return { data: stale, fromCache: true };
    throw err;
  } finally {
    activeController = null;
  }
}
