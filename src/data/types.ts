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
}

export interface NewsSource {
  id: string;
  name: string;
  category: 'major-media' | 'regional' | 'think-tanks' | 'tech' | 'finance';
  enabledDefault: boolean;
}

export interface Signal {
  id: string;
  type: 'cluster' | 'anomaly' | 'trend' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timeISO: string;
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

export const REGION_BOUNDS: Record<RegionPreset, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  global: { minLat: -90, maxLat: 90, minLon: -180, maxLon: 180 },
  europe: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45 },
  'middle-east': { minLat: 12, maxLat: 42, minLon: 25, maxLon: 65 },
  'north-america': { minLat: 15, maxLat: 72, minLon: -170, maxLon: -50 },
  asia: { minLat: -10, maxLat: 55, minLon: 60, maxLon: 150 },
};

export const REGION_TAGS: Record<RegionPreset, string[]> = {
  global: [],
  europe: ['Europe', 'EU', 'NATO', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Ukraine'],
  'middle-east': ['Middle East', 'Iran', 'Israel', 'Saudi Arabia', 'Syria', 'Iraq', 'Yemen'],
  'north-america': ['US', 'USA', 'Canada', 'Mexico', 'North America', 'Washington', 'Pentagon'],
  asia: ['China', 'Japan', 'India', 'Asia', 'Taiwan', 'Korea', 'ASEAN', 'Pacific'],
};
