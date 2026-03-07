import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegionPreset, TimeWindow, NewsTab, EnabledLayers, UIState, NewsItem } from '../data/types';
import { getDefaultEnabledFeeds } from '../data/feeds.registry';
import type { AIConfig } from '../services/ai';

interface DashboardState {
  regionPreset: RegionPreset;
  timeWindow: TimeWindow;
  searchQuery: string;
  enabledLayers: EnabledLayers;
  selectedNewsId: string | null;
  selectedQuakeId: string | null;
  selectedFireId: string | null;
  pinnedNewsIds: string[];
  newsTab: NewsTab;
  ui: UIState;
  enabledNewsSources: Record<string, boolean>;
  minMagnitude: number;
  autoRefresh: boolean;
  loaded: boolean;
  quakesUpdatedAt: string | null;
  newsUpdatedAt: string | null;
  signalsUpdatedAt: string | null;
  newsProxyUrl: string;
  aiConfig: AIConfig;
  newsItems: NewsItem[];

  setRegionPreset: (r: RegionPreset) => void;
  setTimeWindow: (t: TimeWindow) => void;
  setSearchQuery: (q: string) => void;
  toggleLayer: (layer: keyof EnabledLayers) => void;
  selectNews: (id: string | null) => void;
  closeArticleDrawer: () => void;
  selectQuake: (id: string | null) => void;
  clearSelectedQuake: () => void;
  selectFire: (id: string | null) => void;
  toggleSource: (sourceId: string) => void;
  pinNews: (id: string) => void;
  unpinNews: (id: string) => void;
  toggleTheme: () => void;
  toggleDensity: () => void;
  toggleAutoRefresh: () => void;
  setSourcesModalOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setNewsTab: (tab: NewsTab) => void;
  setMinMagnitude: (m: number) => void;
  setQuakesUpdatedAt: (iso: string) => void;
  setAllSources: (enabled: boolean) => void;
  setNewsProxyUrl: (url: string) => void;
  setAIConfig: (config: Partial<AIConfig>) => void;
  setNewsItems: (items: NewsItem[]) => void;
  resetAll: () => void;
  setLoaded: () => void;
  applyUrlState: (p: Partial<{
    regionPreset: RegionPreset;
    timeWindow: TimeWindow;
    newsTab: NewsTab;
    enabledLayers: EnabledLayers;
    minMagnitude: number;
    theme: 'dark' | 'light';
    density: 'comfortable' | 'compact';
  }>) => void;
}

const defaultSources = getDefaultEnabledFeeds();

const initialState = {
  regionPreset: 'global' as RegionPreset,
  timeWindow: '24h' as TimeWindow,
  searchQuery: '',
  enabledLayers: { earthquakes: true, protests: false, conflicts: false, wildfires: false, cyber: false, markets: false } as EnabledLayers,
  selectedNewsId: null as string | null,
  selectedQuakeId: null as string | null,
  selectedFireId: null as string | null,
  pinnedNewsIds: [] as string[],
  newsTab: 'geopolitics' as NewsTab,
  ui: { theme: 'dark' as const, density: 'comfortable' as const, sourcesModalOpen: false, settingsOpen: false, articleDrawerOpen: false },
  enabledNewsSources: defaultSources,
  minMagnitude: 4.5,
  autoRefresh: false,
  loaded: false,
  quakesUpdatedAt: null as string | null,
  newsUpdatedAt: null as string | null,
  signalsUpdatedAt: null as string | null,
  newsProxyUrl: '',
  aiConfig: { enabled: false, baseUrl: '', model: '' } as AIConfig,
  newsItems: [] as NewsItem[],
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,

      setRegionPreset: (r) => set({ regionPreset: r }),
      setTimeWindow: (t) => set({ timeWindow: t }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleLayer: (layer) => set((s) => ({ enabledLayers: { ...s.enabledLayers, [layer]: !s.enabledLayers[layer] } })),
      selectNews: (id) => set((s) => ({ selectedNewsId: id, ui: { ...s.ui, articleDrawerOpen: id !== null } })),
      closeArticleDrawer: () => set((s) => ({ selectedNewsId: null, ui: { ...s.ui, articleDrawerOpen: false } })),
      selectQuake: (id) => set({ selectedQuakeId: id }),
      clearSelectedQuake: () => set({ selectedQuakeId: null }),
      selectFire: (id) => set({ selectedFireId: id }),
      toggleSource: (sourceId) => set((s) => ({ enabledNewsSources: { ...s.enabledNewsSources, [sourceId]: !s.enabledNewsSources[sourceId] } })),
      pinNews: (id) => set((s) => ({ pinnedNewsIds: s.pinnedNewsIds.includes(id) ? s.pinnedNewsIds : [...s.pinnedNewsIds, id] })),
      unpinNews: (id) => set((s) => ({ pinnedNewsIds: s.pinnedNewsIds.filter(i => i !== id) })),
      toggleTheme: () => set((s) => ({ ui: { ...s.ui, theme: s.ui.theme === 'dark' ? 'light' : 'dark' } })),
      toggleDensity: () => set((s) => ({ ui: { ...s.ui, density: s.ui.density === 'comfortable' ? 'compact' : 'comfortable' } })),
      toggleAutoRefresh: () => set((s) => ({ autoRefresh: !s.autoRefresh })),
      setSourcesModalOpen: (open) => set((s) => ({ ui: { ...s.ui, sourcesModalOpen: open } })),
      setSettingsOpen: (open) => set((s) => ({ ui: { ...s.ui, settingsOpen: open } })),
      setNewsTab: (tab) => set({ newsTab: tab }),
      setMinMagnitude: (m) => set({ minMagnitude: m }),
      setQuakesUpdatedAt: (iso) => set({ quakesUpdatedAt: iso }),
      setAllSources: (enabled) => set((s) => {
        const next: Record<string, boolean> = {};
        Object.keys(s.enabledNewsSources).forEach(k => { next[k] = enabled; });
        return { enabledNewsSources: next };
      }),
      setNewsProxyUrl: (url) => set({ newsProxyUrl: url }),
      setAIConfig: (config) => set((s) => ({ aiConfig: { ...s.aiConfig, ...config } })),
      setNewsItems: (items) => set({ newsItems: items }),
      resetAll: () => {
        localStorage.removeItem('world-monitor-state');
        set({ ...initialState, loaded: true });
      },
      setLoaded: () => set({ loaded: true }),
      applyUrlState: (p) => set((s) => ({
        ...(p.regionPreset ? { regionPreset: p.regionPreset } : {}),
        ...(p.timeWindow ? { timeWindow: p.timeWindow } : {}),
        ...(p.newsTab ? { newsTab: p.newsTab } : {}),
        ...(p.enabledLayers ? { enabledLayers: { ...s.enabledLayers, ...p.enabledLayers } } : {}),
        ...(p.minMagnitude !== undefined ? { minMagnitude: p.minMagnitude } : {}),
        ...(p.theme || p.density ? { ui: { ...s.ui, ...(p.theme ? { theme: p.theme } : {}), ...(p.density ? { density: p.density } : {}) } } : {}),
      })),
    }),
    {
      name: 'world-monitor-state',
      partialize: (state) => ({
        regionPreset: state.regionPreset,
        timeWindow: state.timeWindow,
        enabledLayers: state.enabledLayers,
        enabledNewsSources: state.enabledNewsSources,
        pinnedNewsIds: state.pinnedNewsIds,
        newsTab: state.newsTab,
        ui: { theme: state.ui.theme, density: state.ui.density },
        minMagnitude: state.minMagnitude,
        autoRefresh: state.autoRefresh,
        newsProxyUrl: state.newsProxyUrl,
        aiConfig: state.aiConfig,
      }),
    }
  )
);
