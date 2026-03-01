import { QuakeEvent } from './types';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();

export const quakesMock: QuakeEvent[] = [
  { id: 'q1', magnitude: 6.2, place: '45km SSW of Hualien, Taiwan', timeISO: h(0.5), lat: 23.5, lon: 121.5, depthKm: 15 },
  { id: 'q2', magnitude: 5.8, place: '120km NE of Tokyo, Japan', timeISO: h(1.2), lat: 36.2, lon: 140.8, depthKm: 35 },
  { id: 'q3', magnitude: 4.7, place: '80km S of Anchorage, Alaska', timeISO: h(2), lat: 60.5, lon: -149.9, depthKm: 50 },
  { id: 'q4', magnitude: 5.1, place: '30km NW of Athens, Greece', timeISO: h(3), lat: 38.2, lon: 23.5, depthKm: 12 },
  { id: 'q5', magnitude: 7.1, place: '200km W of Santiago, Chile', timeISO: h(3.5), lat: -33.4, lon: -72.5, depthKm: 22 },
  { id: 'q6', magnitude: 4.9, place: '60km SE of Istanbul, Turkey', timeISO: h(4.5), lat: 40.7, lon: 29.5, depthKm: 10 },
  { id: 'q7', magnitude: 5.5, place: '150km SSE of Lima, Peru', timeISO: h(5), lat: -13.2, lon: -76.0, depthKm: 40 },
  { id: 'q8', magnitude: 4.6, place: '90km E of Reykjavik, Iceland', timeISO: h(6), lat: 64.1, lon: -20.5, depthKm: 5 },
  { id: 'q9', magnitude: 6.5, place: '50km N of Manila, Philippines', timeISO: h(7), lat: 15.1, lon: 121.0, depthKm: 28 },
  { id: 'q10', magnitude: 4.8, place: '100km W of Los Angeles, USA', timeISO: h(8), lat: 34.0, lon: -119.5, depthKm: 18 },
  { id: 'q11', magnitude: 5.3, place: '75km SE of Tehran, Iran', timeISO: h(9), lat: 35.2, lon: 52.0, depthKm: 15 },
  { id: 'q12', magnitude: 4.5, place: '40km N of Zagreb, Croatia', timeISO: h(10), lat: 46.1, lon: 15.9, depthKm: 8 },
  { id: 'q13', magnitude: 5.9, place: '180km E of Christchurch, NZ', timeISO: h(11), lat: -43.5, lon: 174.0, depthKm: 30 },
  { id: 'q14', magnitude: 4.7, place: '60km N of Kathmandu, Nepal', timeISO: h(12.5), lat: 28.2, lon: 85.3, depthKm: 12 },
  { id: 'q15', magnitude: 6.0, place: '100km SW of Sumatra, Indonesia', timeISO: h(14), lat: -1.5, lon: 100.0, depthKm: 45 },
  { id: 'q16', magnitude: 5.2, place: '70km E of Mexico City, Mexico', timeISO: h(16), lat: 19.4, lon: -98.5, depthKm: 20 },
  { id: 'q17', magnitude: 4.6, place: '55km S of Lisbon, Portugal', timeISO: h(18), lat: 38.3, lon: -9.1, depthKm: 25 },
  { id: 'q18', magnitude: 5.7, place: '130km NW of Port Moresby, PNG', timeISO: h(20), lat: -8.5, lon: 146.5, depthKm: 55 },
  { id: 'q19', magnitude: 4.9, place: '85km SE of Kabul, Afghanistan', timeISO: h(22), lat: 34.0, lon: 69.8, depthKm: 10 },
  { id: 'q20', magnitude: 5.4, place: '95km W of Valparaiso, Chile', timeISO: h(24), lat: -33.0, lon: -72.3, depthKm: 35 },
  { id: 'q21', magnitude: 4.5, place: '110km N of San Francisco, USA', timeISO: h(26), lat: 38.6, lon: -122.7, depthKm: 14 },
  { id: 'q22', magnitude: 6.3, place: '60km E of Sendai, Japan', timeISO: h(30), lat: 38.3, lon: 141.5, depthKm: 42 },
  { id: 'q23', magnitude: 5.0, place: '40km N of Tbilisi, Georgia', timeISO: h(33), lat: 42.0, lon: 44.8, depthKm: 8 },
  { id: 'q24', magnitude: 4.8, place: '70km SW of Wellington, NZ', timeISO: h(36), lat: -41.7, lon: 174.3, depthKm: 22 },
  { id: 'q25', magnitude: 5.6, place: '150km SE of Mindanao, Philippines', timeISO: h(40), lat: 6.5, lon: 127.0, depthKm: 60 },
];
