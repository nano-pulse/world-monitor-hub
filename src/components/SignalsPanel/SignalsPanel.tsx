import { signalsMock } from '../../data/signals.mock';
import { timeAgo } from '../../lib/time';
import { Zap } from 'lucide-react';

const severityColors: Record<string, string> = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-primary/20 text-primary',
};

export default function SignalsPanel() {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-warning" />
          <span>Signals</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        {signalsMock.map(s => (
          <div key={s.id} className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${severityColors[s.severity]}`}>{s.severity.toUpperCase()}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(s.timeISO)}</span>
            </div>
            <p className="text-xs font-medium text-foreground">{s.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
