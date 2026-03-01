import { useDashboardStore } from '../../state/useDashboardStore';
import { quakesMock } from '../../data/quakes.mock';
import { REGION_BOUNDS } from '../../data/types';
import { timeAgo, timeWindowMs } from '../../lib/time';
import { Activity } from 'lucide-react';

export default function QuakePanel() {
  const { selectedQuakeId, selectQuake, minMagnitude, setMinMagnitude, timeWindow, regionPreset } = useDashboardStore();
  const bounds = REGION_BOUNDS[regionPreset];
  const now = Date.now();
  const twMs = timeWindowMs(timeWindow);

  const filtered = quakesMock.filter(q => {
    if (q.magnitude < minMagnitude) return false;
    if (now - new Date(q.timeISO).getTime() > twMs) return false;
    if (q.lat < bounds.minLat || q.lat > bounds.maxLat || q.lon < bounds.minLon || q.lon > bounds.maxLon) return false;
    return true;
  });

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-destructive" />
          <span>Earthquakes</span>
          <span className="text-xs text-muted-foreground font-mono">({filtered.length})</span>
        </div>
      </div>
      {/* Filter */}
      <div className="px-3 py-1.5 border-b border-border flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">Min M:</span>
        <input
          type="range"
          min="4.5"
          max="7.5"
          step="0.1"
          value={minMagnitude}
          onChange={e => setMinMagnitude(parseFloat(e.target.value))}
          className="flex-1 h-1 accent-primary"
        />
        <span className="text-[10px] font-mono text-foreground w-6">{minMagnitude}</span>
      </div>
      {/* List */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">No quakes match filters</div>
        )}
        {filtered.map(q => {
          const isSelected = selectedQuakeId === q.id;
          const magColor = q.magnitude >= 6.0 ? 'text-destructive' : q.magnitude >= 5.0 ? 'text-warning' : 'text-primary';
          return (
            <button
              key={q.id}
              onClick={() => selectQuake(q.id)}
              className={`w-full text-left px-3 py-2 border-b border-border transition-colors block ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/50'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-sm ${magColor}`}>M{q.magnitude.toFixed(1)}</span>
                <span className="text-xs text-foreground truncate flex-1">{q.place}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{timeAgo(q.timeISO)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
