import { useRef, useEffect } from 'react';
import { useDashboardStore } from '../../state/useDashboardStore';
import { timeAgo } from '../../lib/time';
import { Flame, RefreshCw } from 'lucide-react';
import type { FireEvent } from '../../data/types';

interface Props {
  fires: FireEvent[];
  loading: boolean;
  error: string | null;
  stale: boolean;
  updatedAt: string | null;
  onRefresh: () => void;
}

export default function WildfiresPanel({ fires, loading, error, stale, updatedAt, onRefresh }: Props) {
  const { selectedFireId, selectFire } = useDashboardStore();
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (selectedFireId) {
      const el = itemRefs.current.get(selectedFireId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedFireId]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Wildfires</span>
          <span className="text-xs text-muted-foreground font-mono">({fires.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {stale && <span className="text-[10px] text-warning font-mono">⚠ may be outdated</span>}
          {updatedAt && <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(updatedAt)}</span>}
          <button
            onClick={onRefresh}
            className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh wildfires"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading && fires.length === 0 && (
          <div className="p-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 skeleton-shimmer rounded" />
            ))}
          </div>
        )}
        {!loading && error && fires.length === 0 && (
          <div className="p-4 text-center text-xs text-destructive">{error}</div>
        )}
        {!loading && !error && fires.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">No active wildfires reported</div>
        )}
        {fires.map(f => {
          const isSelected = selectedFireId === f.id;
          return (
            <button
              key={f.id}
              ref={el => { if (el) itemRefs.current.set(f.id, el); }}
              onClick={() => selectFire(f.id)}
              className={`w-full text-left px-3 py-2 border-b border-border transition-colors block ${isSelected ? 'bg-orange-500/10' : 'hover:bg-secondary/50'}`}
              aria-label={`Wildfire: ${f.title}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">{f.title}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{timeAgo(f.timeISO)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
