import { Signal } from './types';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();

export const signalsMock: Signal[] = [
  { id: 's1', type: 'cluster', title: 'Seismic cluster detected', description: '3 earthquakes M4.5+ within 6h near Taiwan Strait region', severity: 'high', timeISO: h(0.5) },
  { id: 's2', type: 'anomaly', title: 'Unusual naval activity', description: 'AIS tracking shows 12 military vessels repositioned in South China Sea in 24h', severity: 'high', timeISO: h(2) },
  { id: 's3', type: 'trend', title: 'Cyber threat escalation', description: 'Ransomware incidents up 340% in healthcare sector over past 7 days', severity: 'medium', timeISO: h(4) },
  { id: 's4', type: 'alert', title: 'Energy infrastructure alert', description: 'Coordinated attacks on 3 European power substations in 48h', severity: 'high', timeISO: h(8) },
  { id: 's5', type: 'trend', title: 'Defense spending surge', description: '4 NATO nations announced military budget increases exceeding 15% this week', severity: 'low', timeISO: h(12) },
  { id: 's6', type: 'anomaly', title: 'Commodity price divergence', description: 'Gold-copper ratio at 10-year extreme, potential recession indicator', severity: 'medium', timeISO: h(18) },
  { id: 's7', type: 'cluster', title: 'Diplomatic activity spike', description: '5 unscheduled bilateral summits in Middle East within 72h', severity: 'medium', timeISO: h(24) },
  { id: 's8', type: 'alert', title: 'Supply chain disruption', description: 'Red Sea shipping diversions adding 12-18 days to Asia-Europe routes', severity: 'high', timeISO: h(30) },
];
