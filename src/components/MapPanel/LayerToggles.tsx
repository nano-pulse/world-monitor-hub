import { useDashboardStore } from '../../state/useDashboardStore';
import type { EnabledLayers } from '../../data/types';

const layers: { key: keyof EnabledLayers; label: string; color: string }[] = [
  { key: 'earthquakes', label: 'Earthquakes', color: 'hsl(var(--destructive))' },
  { key: 'protests', label: 'Protests', color: 'hsl(var(--warning))' },
  { key: 'conflicts', label: 'Conflicts', color: 'hsl(0, 80%, 45%)' },
  { key: 'wildfires', label: 'Wildfires', color: 'hsl(25, 90%, 50%)' },
  { key: 'cyber', label: 'Cyber IOCs', color: 'hsl(var(--info))' },
  { key: 'markets', label: 'Markets', color: 'hsl(var(--success))' },
];

export default function LayerToggles() {
  const { enabledLayers, toggleLayer } = useDashboardStore();

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded p-1.5 space-y-0.5">
      {layers.map(l => (
        <label key={l.key} className="flex items-center gap-2 text-xs cursor-pointer px-1 py-0.5 rounded hover:bg-secondary transition-colors">
          <input
            type="checkbox"
            checked={enabledLayers[l.key]}
            onChange={() => toggleLayer(l.key)}
            className="sr-only"
          />
          <span
            className="w-2.5 h-2.5 rounded-sm border border-border transition-colors shrink-0"
            style={{ backgroundColor: enabledLayers[l.key] ? l.color : 'transparent' }}
          />
          <span className={enabledLayers[l.key] ? 'text-foreground' : 'text-muted-foreground'}>{l.label}</span>
        </label>
      ))}
    </div>
  );
}
