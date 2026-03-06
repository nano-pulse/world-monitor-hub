import { useDashboardStore } from '../../state/useDashboardStore';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function SettingsDrawer() {
  const { ui, autoRefresh, aiConfig, newsProxyUrl, setSettingsOpen, toggleTheme, toggleDensity, toggleAutoRefresh, setAIConfig, setNewsProxyUrl, resetAll } = useDashboardStore();
  
  useEffect(() => {
    if (!ui.settingsOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSettingsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ui.settingsOpen, setSettingsOpen]);

  if (!ui.settingsOpen) return null;

  const handleReset = () => {
    resetAll();
    toast.success('Settings reset');
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-40" onClick={() => setSettingsOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-card border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200" role="dialog" aria-label="Settings">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-semibold">Settings</span>
          <button onClick={() => setSettingsOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground" aria-label="Close settings"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-5">
          {/* General */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs">Theme</span>
              <button onClick={toggleTheme} className="text-xs font-mono px-3 py-1 rounded bg-secondary text-secondary-foreground">
                {ui.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Density</span>
              <button onClick={toggleDensity} className="text-xs font-mono px-3 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                {ui.density}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Auto-refresh</span>
              <button
                onClick={toggleAutoRefresh}
                className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${autoRefresh ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border'}`}
              >
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* News Proxy */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">News Proxy</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Proxy URL (leave empty for mock data)</label>
              <input
                value={newsProxyUrl}
                onChange={e => setNewsProxyUrl(e.target.value)}
                placeholder="https://your-proxy.vercel.app/api/rss"
                className="w-full bg-secondary text-xs px-2 py-1.5 rounded border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* AI Configuration */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">AI (Local LLM)</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs">Enable AI</span>
              <button
                onClick={() => setAIConfig({ enabled: !aiConfig.enabled })}
                className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${aiConfig.enabled ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border'}`}
              >
                {aiConfig.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
            {aiConfig.enabled && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Base URL</label>
                  <input
                    value={aiConfig.baseUrl}
                    onChange={e => setAIConfig({ baseUrl: e.target.value })}
                    placeholder="http://localhost:1234/v1"
                    className="w-full bg-secondary text-xs px-2 py-1.5 rounded border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Model name</label>
                  <input
                    value={aiConfig.model}
                    onChange={e => setAIConfig({ model: e.target.value })}
                    placeholder="local-model"
                    className="w-full bg-secondary text-xs px-2 py-1.5 rounded border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">AI is on-demand only. Max 20 calls/hour. Cached results reused when available.</p>
              </>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full text-xs px-3 py-2 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
          >
            Reset layout & settings
          </button>
        </div>
      </div>
    </>
  );
}
