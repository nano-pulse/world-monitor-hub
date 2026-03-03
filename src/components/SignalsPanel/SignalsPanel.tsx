import { useMemo } from 'react';
import { useDashboardStore } from '../../state/useDashboardStore';
import { generateSignals } from '../../services/signals';
import { timeAgo } from '../../lib/time';
import { Zap } from 'lucide-react';
import type { QuakeEvent, SignalItem } from '../../data/types';

const severityColors: Record<string, string> = {
  HIGH: 'bg-destructive/20 text-destructive',
  MEDIUM: 'bg-warning/20 text-warning',
  LOW: 'bg-primary/20 text-primary',
};

interface Props {
  quakes: QuakeEvent[];
}

export default function SignalsPanel({ quakes }: Props) {
  const regionPreset = useDashboardStore(s => s.regionPreset);
  const timeWindow = useDashboardStore(s => s.timeWindow);
  const selectQuake = useDashboardStore(s => s.selectQuake);

  const signals: SignalItem[] = useMemo(
    () => generateSignals(quakes, regionPreset, timeWindow),
    [quakes, regionPreset, timeWindow]
  );

  const handleSignalClick = (signal: SignalItem) => {
    if (signal.relatedQuakeIds.length > 0) {
      selectQuake(signal.relatedQuakeIds[0]);
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-warning" />
          <span>Signals</span>
          <span className="text-xs text-muted-foreground font-mono">({signals.length})</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        {signals.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">No signals for current data</div>
        )}
        {signals.map(s => (
          <button
            key={s.id}
            onClick={() => handleSignalClick(s)}
            className="w-full text-left px-3 py-2 border-b border-border hover:bg-secondary/50 transition-colors block"
            aria-label={`${s.severity} signal: ${s.title}`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${severityColors[s.severity]}`}>{s.severity}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(s.timeISO)}</span>
            </div>
            <p className="text-xs font-medium text-foreground">{s.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
