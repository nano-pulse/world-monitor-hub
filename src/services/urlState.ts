import type { RegionPreset, TimeWindow, NewsTab, EnabledLayers, Density, Theme } from '../data/types';

const LAYER_KEYS: (keyof EnabledLayers)[] = ['earthquakes', 'protests', 'conflicts', 'wildfires', 'cyber', 'markets'];
const SHORT: Record<keyof EnabledLayers, string> = { earthquakes: 'eq', protests: 'pr', conflicts: 'cf', wildfires: 'wf', cyber: 'cy', markets: 'mk' };
const SHORT_REV: Record<string, keyof EnabledLayers> = Object.fromEntries(Object.entries(SHORT).map(([k, v]) => [v, k as keyof EnabledLayers]));

export interface UrlStateParams {
  region?: RegionPreset;
  time?: TimeWindow;
  tab?: NewsTab;
  layers?: Partial<EnabledLayers>;
  density?: Density;
  theme?: Theme;
  minMag?: number;
}

export function encodeUrlState(p: UrlStateParams): string {
  const params = new URLSearchParams();
  if (p.region) params.set('region', p.region);
  if (p.time) params.set('time', p.time);
  if (p.tab) params.set('tab', p.tab);
  if (p.density) params.set('density', p.density);
  if (p.theme) params.set('theme', p.theme);
  if (p.minMag !== undefined) params.set('minMag', p.minMag.toFixed(1));
  if (p.layers) {
    const layerStr = LAYER_KEYS.map(k => `${SHORT[k]}=${p.layers![k] ? 1 : 0}`).join(' ');
    params.set('layers', layerStr);
  }
  return `${window.location.origin}${window.location.pathname}?${params}`;
}

export function decodeUrlState(): UrlStateParams | null {
  const params = new URLSearchParams(window.location.search);
  if (params.toString().length === 0) return null;

  const result: UrlStateParams = {};

  const region = params.get('region');
  if (region && ['global', 'europe', 'middle-east', 'north-america', 'asia'].includes(region)) {
    result.region = region as RegionPreset;
  }

  const time = params.get('time');
  if (time && ['1h', '6h', '24h', '48h', '7d'].includes(time)) {
    result.time = time as TimeWindow;
  }

  const tab = params.get('tab');
  if (tab && ['geopolitics', 'tech', 'finance', 'local'].includes(tab)) {
    result.tab = tab as NewsTab;
  }

  const density = params.get('density');
  if (density && ['comfortable', 'compact'].includes(density)) {
    result.density = density as Density;
  }

  const theme = params.get('theme');
  if (theme && ['dark', 'light'].includes(theme)) {
    result.theme = theme as Theme;
  }

  const minMag = params.get('minMag');
  if (minMag) {
    const v = parseFloat(minMag);
    if (!isNaN(v) && v >= 4.5 && v <= 7.5) result.minMag = v;
  }

  const layersStr = params.get('layers');
  if (layersStr) {
    const layers: Partial<EnabledLayers> = {};
    layersStr.split(' ').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && SHORT_REV[k]) layers[SHORT_REV[k]] = v === '1';
    });
    if (Object.keys(layers).length > 0) result.layers = layers;
  }

  return Object.keys(result).length > 0 ? result : null;
}
