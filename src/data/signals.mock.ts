import type { SignalItem } from './types';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();

// Legacy mock signals kept as fallback reference only
export const signalsMock: SignalItem[] = [
  { id: 's1', kind: 'seismic-cluster', title: 'Seismic cluster detected', description: '3 earthquakes M4.5+ within 6h near Taiwan Strait region', severity: 'HIGH', timeISO: h(0.5), relatedQuakeIds: ['q1', 'q2'] },
  { id: 's2', kind: 'major-quake', title: 'Major earthquake M7.1', description: 'M7.1 earthquake 200km W of Santiago, Chile, depth 22km', severity: 'HIGH', timeISO: h(3.5), relatedQuakeIds: ['q5'] },
];
