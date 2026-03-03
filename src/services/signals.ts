import type { QuakeEvent, SignalItem, RegionPreset, TimeWindow } from '../data/types';
import { REGION_BOUNDS } from '../data/types';

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInRegion(lat: number, lon: number, region: RegionPreset): boolean {
  const b = REGION_BOUNDS[region];
  return lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon;
}

export function generateSignals(quakes: QuakeEvent[], regionPreset: RegionPreset, _timeWindow: TimeWindow): SignalItem[] {
  const signals: SignalItem[] = [];
  const now = Date.now();
  let sigId = 0;

  // A) Seismic cluster: >=3 quakes M4.5+ within 6h and 300km
  const recent6h = quakes.filter(q => now - new Date(q.timeISO).getTime() < 6 * 3600_000 && q.magnitude >= 4.5);
  const clustered = new Set<string>();
  for (let i = 0; i < recent6h.length; i++) {
    const cluster = [recent6h[i]];
    for (let j = i + 1; j < recent6h.length; j++) {
      if (distanceKm(recent6h[i].lat, recent6h[i].lon, recent6h[j].lat, recent6h[j].lon) <= 300) {
        cluster.push(recent6h[j]);
      }
    }
    if (cluster.length >= 3 && !clustered.has(recent6h[i].id)) {
      cluster.forEach(q => clustered.add(q.id));
      signals.push({
        id: `sig-${sigId++}`,
        severity: 'HIGH',
        kind: 'seismic-cluster',
        timeISO: cluster[0].timeISO,
        title: 'Seismic cluster detected',
        description: `${cluster.length} earthquakes M4.5+ within 6h and 300km near ${cluster[0].place}`,
        relatedQuakeIds: cluster.map(q => q.id),
      });
    }
  }

  // B) Major quake: any M6.5+
  for (const q of quakes) {
    if (q.magnitude >= 6.5) {
      signals.push({
        id: `sig-${sigId++}`,
        severity: 'HIGH',
        kind: 'major-quake',
        timeISO: q.timeISO,
        title: `Major earthquake M${q.magnitude.toFixed(1)}`,
        description: `M${q.magnitude.toFixed(1)} earthquake at ${q.place}, depth ${q.depthKm}km`,
        relatedQuakeIds: [q.id],
      });
    }
  }

  // C) Elevated activity: >=10 quakes in window
  if (quakes.length >= 10) {
    signals.push({
      id: `sig-${sigId++}`,
      severity: 'MEDIUM',
      kind: 'elevated-activity',
      timeISO: new Date().toISOString(),
      title: 'Elevated seismic activity',
      description: `${quakes.length} earthquakes detected in current time window`,
      relatedQuakeIds: quakes.slice(0, 5).map(q => q.id),
    });
  }

  // D) Regional concentration: >50% in one region
  if (regionPreset === 'global' && quakes.length >= 4) {
    const regions: RegionPreset[] = ['europe', 'middle-east', 'north-america', 'asia'];
    for (const r of regions) {
      const inRegion = quakes.filter(q => isInRegion(q.lat, q.lon, r));
      if (inRegion.length > quakes.length * 0.5) {
        signals.push({
          id: `sig-${sigId++}`,
          severity: 'MEDIUM',
          kind: 'regional-concentration',
          timeISO: new Date().toISOString(),
          title: `Regional concentration: ${r}`,
          description: `${inRegion.length} of ${quakes.length} quakes (${Math.round(inRegion.length / quakes.length * 100)}%) concentrated in ${r}`,
          relatedQuakeIds: inRegion.slice(0, 3).map(q => q.id),
        });
        break;
      }
    }
  }

  // Sort by severity then time
  const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  signals.sort((a, b) => order[a.severity] - order[b.severity] || new Date(b.timeISO).getTime() - new Date(a.timeISO).getTime());

  return signals;
}
