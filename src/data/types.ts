export interface NewsItem {
  id: string;
  category: 'geopolitics' | 'tech' | 'finance';
  title: string;
  sourceId: string;
  sourceName: string;
  url: string;
  publishedAtISO: string;
  tags: string[];
  summary: string;
}

export interface QuakeEvent {
  id: string;
  magnitude: number;
  place: string;
  timeISO: string;
  lat: number;
  lon: number;
  depthKm: number;
  url?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  category: 'major-media' | 'regional' | 'think-tanks' | 'tech' | 'finance';
  enabledDefault: boolean;
}

export type SignalSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type SignalKind = 'seismic-cluster' | 'major-quake' | 'elevated-activity' | 'regional-concentration';

export interface SignalItem {
  id: string;
  severity: SignalSeverity;
  kind: SignalKind;
  timeISO: string;
  title: string;
  description: string;
  relatedQuakeIds: string[];
}

export type RegionPreset = 'global' | 'europe' | 'middle-east' | 'north-america' | 'asia';
export type TimeWindow = '1h' | '6h' | '24h' | '48h' | '7d';
export type NewsTab = 'geopolitics' | 'tech' | 'finance' | 'local';
export type Theme = 'dark' | 'light';
export type Density = 'comfortable' | 'compact';

export interface EnabledLayers {
  earthquakes: boolean;
  protests: boolean;
  conflicts: boolean;
  wildfires: boolean;
  cyber: boolean;
  markets: boolean;
}

export interface UIState {
  theme: Theme;
  density: Density;
  sourcesModalOpen: boolean;
  settingsOpen: boolean;
  articleDrawerOpen: boolean;
}

export const REGION_BOUNDS: Record<RegionPreset, { minLat: number; maxLat: number; minLon: number; maxLon: number; center: [number, number]; zoom: number }> = {
  global: { minLat: -90, maxLat: 90, minLon: -180, maxLon: 180, center: [0, 20], zoom: 1.5 },
  europe: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45, center: [10, 50], zoom: 3.5 },
  'middle-east': { minLat: 12, maxLat: 42, minLon: 25, maxLon: 65, center: [45, 28], zoom: 4 },
  'north-america': { minLat: 15, maxLat: 72, minLon: -170, maxLon: -50, center: [-100, 45], zoom: 3 },
  asia: { minLat: -10, maxLat: 55, minLon: 60, maxLon: 150, center: [105, 25], zoom: 3 },
};

export const REGION_TAGS: Record<RegionPreset, string[]> = {
  global: [],
  europe: ['Europe', 'EU', 'NATO', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Ukraine'],
  'middle-east': ['Middle East', 'Iran', 'Israel', 'Saudi Arabia', 'Syria', 'Iraq', 'Yemen'],
  'north-america': ['US', 'USA', 'Canada', 'Mexico', 'North America', 'Washington', 'Pentagon'],
  asia: ['China', 'Japan', 'India', 'Asia', 'Taiwan', 'Korea', 'ASEAN', 'Pacific'],
};
