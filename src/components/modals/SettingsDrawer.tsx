import { useDashboardStore } from '../../state/useDashboardStore';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsDrawer() {
  const { ui, setSettingsOpen, toggleTheme, toggleDensity, resetAll } = useDashboardStore();
  if (!ui.settingsOpen) return null;

  const handleReset = () => {
    resetAll();
    toast.success('Settings saved');
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-40" onClick={() => setSettingsOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-card border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-semibold">Settings</span>
          <button onClick={() => setSettingsOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 p-4 space-y-5">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Theme</span>
            <button onClick={toggleTheme} className="text-xs font-mono px-3 py-1 rounded bg-secondary text-secondary-foreground">
              {ui.theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
          {/* Density */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Density</span>
            <button onClick={toggleDensity} className="text-xs font-mono px-3 py-1 rounded bg-secondary text-secondary-foreground">
              {ui.density}
            </button>
          </div>
          {/* Auto refresh */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Auto-refresh</span>
            <span className="text-[10px] font-mono text-muted-foreground italic">Simulated</span>
          </div>
          {/* Reset */}
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
