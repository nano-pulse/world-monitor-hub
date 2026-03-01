import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegionPreset, TimeWindow, NewsTab, EnabledLayers, UIState } from '../data/types';
import { sourcesMock } from '../data/sources.mock';

interface DashboardState {
  regionPreset: RegionPreset;
  timeWindow: TimeWindow;
  searchQuery: string;
  enabledLayers: EnabledLayers;
  selectedNewsId: string | null;
  selectedQuakeId: string | null;
  pinnedNewsIds: string[];
  newsTab: NewsTab;
  ui: UIState;
  enabledNewsSources: Record<string, boolean>;
  minMagnitude: number;
  loaded: boolean;

  setRegionPreset: (r: RegionPreset) => void;
  setTimeWindow: (t: TimeWindow) => void;
  setSearchQuery: (q: string) => void;
  toggleLayer: (layer: keyof EnabledLayers) => void;
  selectNews: (id: string | null) => void;
  closeArticleDrawer: () => void;
  selectQuake: (id: string | null) => void;
  toggleSource: (sourceId: string) => void;
  pinNews: (id: string) => void;
  unpinNews: (id: string) => void;
  toggleTheme: () => void;
  toggleDensity: () => void;
  setSourcesModalOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setNewsTab: (tab: NewsTab) => void;
  setMinMagnitude: (m: number) => void;
  resetAll: () => void;
  setLoaded: () => void;
}

const defaultSources: Record<string, boolean> = {};
sourcesMock.forEach(s => { defaultSources[s.id] = s.enabledDefault; });

const initialState = {
  regionPreset: 'global' as RegionPreset,
  timeWindow: '24h' as TimeWindow,
  searchQuery: '',
  enabledLayers: { earthquakes: true, protests: false, conflicts: false, wildfires: false, cyber: false, markets: false },
  selectedNewsId: null,
  selectedQuakeId: null,
  pinnedNewsIds: [] as string[],
  newsTab: 'geopolitics' as NewsTab,
  ui: { theme: 'dark' as const, density: 'comfortable' as const, sourcesModalOpen: false, settingsOpen: false, articleDrawerOpen: false },
  enabledNewsSources: defaultSources,
  minMagnitude: 4.5,
  loaded: false,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,

      setRegionPreset: (r) => set({ regionPreset: r }),
      setTimeWindow: (t) => set({ timeWindow: t }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleLayer: (layer) => set((s) => ({ enabledLayers: { ...s.enabledLayers, [layer]: !s.enabledLayers[layer] } })),
      selectNews: (id) => set({ selectedNewsId: id, ui: { ...initialState.ui, articleDrawerOpen: id !== null } }),
      closeArticleDrawer: () => set((s) => ({ selectedNewsId: null, ui: { ...s.ui, articleDrawerOpen: false } })),
      selectQuake: (id) => set({ selectedQuakeId: id }),
      toggleSource: (sourceId) => set((s) => ({ enabledNewsSources: { ...s.enabledNewsSources, [sourceId]: !s.enabledNewsSources[sourceId] } })),
      pinNews: (id) => set((s) => ({ pinnedNewsIds: s.pinnedNewsIds.includes(id) ? s.pinnedNewsIds : [...s.pinnedNewsIds, id] })),
      unpinNews: (id) => set((s) => ({ pinnedNewsIds: s.pinnedNewsIds.filter(i => i !== id) })),
      toggleTheme: () => set((s) => ({ ui: { ...s.ui, theme: s.ui.theme === 'dark' ? 'light' : 'dark' } })),
      toggleDensity: () => set((s) => ({ ui: { ...s.ui, density: s.ui.density === 'comfortable' ? 'compact' : 'comfortable' } })),
      setSourcesModalOpen: (open) => set((s) => ({ ui: { ...s.ui, sourcesModalOpen: open } })),
      setSettingsOpen: (open) => set((s) => ({ ui: { ...s.ui, settingsOpen: open } })),
      setNewsTab: (tab) => set({ newsTab: tab }),
      setMinMagnitude: (m) => set({ minMagnitude: m }),
      resetAll: () => {
        localStorage.removeItem('world-monitor-state');
        set({ ...initialState, loaded: true });
      },
      setLoaded: () => set({ loaded: true }),
    }),
    {
      name: 'world-monitor-state',
      partialize: (state) => ({
        regionPreset: state.regionPreset,
        timeWindow: state.timeWindow,
        enabledLayers: state.enabledLayers,
        enabledNewsSources: state.enabledNewsSources,
        pinnedNewsIds: state.pinnedNewsIds,
        ui: { theme: state.ui.theme, density: state.ui.density },
        minMagnitude: state.minMagnitude,
      }),
    }
  )
);

export function getShareUrl(): string {
  const s = useDashboardStore.getState();
  const params = new URLSearchParams();
  params.set('region', s.regionPreset);
  params.set('time', s.timeWindow);
  params.set('tab', s.newsTab);
  const layers = Object.entries(s.enabledLayers).filter(([, v]) => v).map(([k]) => k).join(',');
  params.set('layers', layers);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
