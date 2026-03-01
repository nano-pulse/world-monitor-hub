import { useDashboardStore, getShareUrl } from '../state/useDashboardStore';
import { Search, Radio, Settings, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RegionPreset, TimeWindow } from '../data/types';

const regions: { value: RegionPreset; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'europe', label: 'Europe' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'north-america', label: 'N. America' },
  { value: 'asia', label: 'Asia' },
];

const windows: TimeWindow[] = ['1h', '6h', '24h', '48h', '7d'];

export default function TopBar() {
  const { regionPreset, setRegionPreset, timeWindow, setTimeWindow, searchQuery, setSearchQuery, setSourcesModalOpen, setSettingsOpen } = useDashboardStore();

  const handleShare = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success('Copied share link');
  };

  return (
    <header className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0 flex-wrap">
      {/* Left: Title */}
      <div className="flex items-center gap-2 mr-4">
        <span className="status-dot-live" />
        <span className="font-mono font-bold text-sm glow-text tracking-wider">WORLD MONITOR</span>
      </div>

      {/* Center: Region */}
      <select
        value={regionPreset}
        onChange={e => setRegionPreset(e.target.value as RegionPreset)}
        className="bg-secondary text-secondary-foreground text-xs font-mono px-2 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {/* Center: TimeWindow */}
      <div className="flex gap-0.5 bg-secondary rounded p-0.5">
        {windows.map(w => (
          <button
            key={w}
            onClick={() => setTimeWindow(w)}
            className={`text-xs font-mono px-2 py-1 rounded transition-colors ${timeWindow === w ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Right: Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search headlines…"
          className="bg-secondary text-xs pl-7 pr-2 py-1.5 rounded border border-border w-40 focus:w-56 transition-all focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Right: Buttons */}
      <button onClick={() => setSourcesModalOpen(true)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Sources">
        <Radio className="w-4 h-4" />
      </button>
      <button onClick={handleShare} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Share View">
        <Share2 className="w-4 h-4" />
      </button>
      <button onClick={() => setSettingsOpen(true)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Settings">
        <Settings className="w-4 h-4" />
      </button>
    </header>
  );
}
