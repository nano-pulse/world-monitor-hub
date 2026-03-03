import type { QuakeEvent, TimeWindow } from '../data/types';
import { cacheGet, cacheGetStale, cacheSet, getTtlForWindow } from './cache';

const USGS_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

function getStartTime(tw: TimeWindow): string {
  const ms: Record<TimeWindow, number> = {
    '1h': 3_600_000,
    '6h': 21_600_000,
    '24h': 86_400_000,
    '48h': 172_800_000,
    '7d': 604_800_000,
  };
  return new Date(Date.now() - ms[tw]).toISOString();
}

export function buildUsgsUrl(tw: TimeWindow, minMag: number): string {
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: getStartTime(tw),
    minmagnitude: minMag.toFixed(1),
    orderby: 'time',
    limit: '500',
  });
  return `${USGS_BASE}?${params}`;
}

function parseFeatures(geojson: any): QuakeEvent[] {
  if (!geojson?.features) return [];
  return geojson.features.map((f: any) => ({
    id: f.id || f.properties?.code || String(Math.random()),
    magnitude: f.properties.mag,
    place: f.properties.place || 'Unknown',
    timeISO: new Date(f.properties.time).toISOString(),
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    depthKm: f.geometry.coordinates[2] || 0,
    url: f.properties.url || undefined,
  }));
}

let activeController: AbortController | null = null;

export async function fetchEarthquakes(tw: TimeWindow, minMag: number): Promise<{ data: QuakeEvent[]; fromCache: boolean }> {
  const roundedMag = Math.round(minMag * 10) / 10;
  const cacheKey = `quakes:${tw}:${roundedMag}`;
  const ttl = getTtlForWindow(tw);

  // Check fresh cache
  const cached = cacheGet<QuakeEvent[]>(cacheKey, ttl);
  if (cached) return { data: cached, fromCache: true };

  // Cancel previous in-flight request
  if (activeController) activeController.abort();
  activeController = new AbortController();

  try {
    const url = buildUsgsUrl(tw, roundedMag);
    const res = await fetch(url, { signal: activeController.signal });
    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const json = await res.json();
    const quakes = parseFeatures(json);
    cacheSet(cacheKey, quakes);
    return { data: quakes, fromCache: false };
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    // Return stale cache if available
    const stale = cacheGetStale<QuakeEvent[]>(cacheKey);
    if (stale) return { data: stale, fromCache: true };
    throw err;
  } finally {
    activeController = null;
  }
}
