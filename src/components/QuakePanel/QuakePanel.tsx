import { useRef, useEffect } from 'react';
import { useDashboardStore } from '../../state/useDashboardStore';
import { REGION_BOUNDS } from '../../data/types';
import { timeAgo } from '../../lib/time';
import { Activity } from 'lucide-react';
import type { QuakeEvent } from '../../data/types';

interface Props {
  quakes: QuakeEvent[];
  loading: boolean;
  error: string | null;
  stale: boolean;
}

export default function QuakePanel({ quakes, loading, error, stale }: Props) {
  const { selectedQuakeId, selectQuake, minMagnitude, setMinMagnitude, regionPreset } = useDashboardStore();
  const bounds = REGION_BOUNDS[regionPreset];
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filtered = quakes.filter(q => {
    if (q.magnitude < minMagnitude) return false;
    if (regionPreset !== 'global') {
      if (q.lat < bounds.minLat || q.lat > bounds.maxLat || q.lon < bounds.minLon || q.lon > bounds.maxLon) return false;
    }
    return true;
  });

  // Scroll to selected quake (from map click)
  useEffect(() => {
    if (selectedQuakeId) {
      const el = itemRefs.current.get(selectedQuakeId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedQuakeId]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-destructive" />
          <span>Earthquakes</span>
          <span className="text-xs text-muted-foreground font-mono">({filtered.length})</span>
        </div>
        {stale && <span className="text-[10px] text-warning font-mono">⚠ may be outdated</span>}
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
          aria-label="Minimum magnitude filter"
        />
        <span className="text-[10px] font-mono text-foreground w-6">{minMagnitude}</span>
      </div>
      {/* List */}
      <div ref={listRef} className="flex-1 overflow-auto scrollbar-thin">
        {loading && filtered.length === 0 && (
          <div className="p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 skeleton-shimmer rounded" />
            ))}
          </div>
        )}
        {!loading && error && filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-destructive">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">No earthquakes found for current filters</div>
        )}
        {filtered.map(q => {
          const isSelected = selectedQuakeId === q.id;
          const magColor = q.magnitude >= 6.0 ? 'text-destructive' : q.magnitude >= 5.0 ? 'text-warning' : 'text-primary';
          return (
            <button
              key={q.id}
              ref={el => { if (el) itemRefs.current.set(q.id, el); }}
              onClick={() => selectQuake(q.id)}
              className={`w-full text-left px-3 py-2 border-b border-border transition-colors block ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/50'}`}
              aria-label={`Magnitude ${q.magnitude} earthquake at ${q.place}`}
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
