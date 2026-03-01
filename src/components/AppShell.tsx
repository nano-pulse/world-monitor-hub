import { useDashboardStore } from '../state/useDashboardStore';
import TopBar from './TopBar';
import MainGrid from './MainGrid';
import ArticleDrawer from './NewsPanel/ArticleDrawer';
import SourcesModal from './modals/SourcesModal';
import SettingsDrawer from './modals/SettingsDrawer';
import { useEffect, useState } from 'react';

export default function AppShell() {
  const theme = useDashboardStore(s => s.ui.theme);
  const setLoaded = useDashboardStore(s => s.setLoaded);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Apply theme class
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Simulate load delay
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
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <TopBar />
      <MainGrid />
      <ArticleDrawer />
      <SourcesModal />
      <SettingsDrawer />
    </div>
  );
}
