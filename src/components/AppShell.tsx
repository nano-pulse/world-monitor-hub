import { useDashboardStore } from '../state/useDashboardStore';
import TopBar from './TopBar';
import MainGrid from './MainGrid';
import ArticleDrawer from './NewsPanel/ArticleDrawer';
import SourcesModal from './modals/SourcesModal';
import SettingsDrawer from './modals/SettingsDrawer';
import { useEffect, useState } from 'react';
import { decodeUrlState } from '../services/urlState';

export default function AppShell() {
  const theme = useDashboardStore(s => s.ui.theme);
  const density = useDashboardStore(s => s.ui.density);
  const setLoaded = useDashboardStore(s => s.setLoaded);
  const applyUrlState = useDashboardStore(s => s.applyUrlState);
  const [initializing, setInitializing] = useState(true);

  // Restore URL state on load
  useEffect(() => {
    const urlParams = decodeUrlState();
    if (urlParams) {
      applyUrlState({
        regionPreset: urlParams.region,
        timeWindow: urlParams.time,
        newsTab: urlParams.tab,
        enabledLayers: urlParams.layers as any,
        minMagnitude: urlParams.minMag,
        theme: urlParams.theme,
        density: urlParams.density,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const t = setTimeout(() => { setLoaded(); setInitializing(false); }, 300);
    return () => clearTimeout(t);
  }, [setLoaded]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold glow-text font-mono mb-2">WORLD MONITOR</div>
          <div className="w-48 h-1 mx-auto skeleton-shimmer rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-background text-foreground overflow-hidden ${density === 'compact' ? 'text-[13px]' : ''}`}>
      <TopBar />
      <MainGrid />
      <ArticleDrawer />
      <SourcesModal />
      <SettingsDrawer />
    </div>
  );
}
