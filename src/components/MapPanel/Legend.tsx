import { useDashboardStore } from '../../state/useDashboardStore';

const levels = [
  { label: 'M4.5–5.0', color: 'hsl(175, 70%, 45%)', size: 7 },
  { label: 'M5.0–6.0', color: 'hsl(38, 90%, 50%)', size: 10 },
  { label: 'M6.0+', color: 'hsl(0, 65%, 50%)', size: 14 },
];

const fireLegend = [
  { label: 'Active Fire', color: 'hsl(25, 90%, 50%)', size: 8 },
];

export default function Legend() {
  const showQuakes = useDashboardStore(s => s.enabledLayers.earthquakes);
  const showFires = useDashboardStore(s => s.enabledLayers.wildfires);

  if (!showQuakes && !showFires) return null;

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1.5 flex items-center gap-3 flex-wrap">
      {showQuakes && levels.map(l => (
        <div key={l.label} className="flex items-center gap-1.5">
          <span className="rounded-full shrink-0" style={{ width: l.size, height: l.size, backgroundColor: l.color, boxShadow: `0 0 4px ${l.color}` }} />
          <span className="text-[10px] font-mono text-muted-foreground">{l.label}</span>
        </div>
      ))}
      {showFires && fireLegend.map(l => (
        <div key={l.label} className="flex items-center gap-1.5">
          <span className="rounded-full shrink-0" style={{ width: l.size, height: l.size, backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
          <span className="text-[10px] font-mono text-muted-foreground">{l.label}</span>
        </div>
      ))}
    </div>
  );
}
