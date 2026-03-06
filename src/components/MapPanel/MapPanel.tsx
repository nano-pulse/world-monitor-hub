import MapContainer from './MapContainer';
import LayerToggles from './LayerToggles';
import Legend from './Legend';
import { useDashboardStore } from '../../state/useDashboardStore';
import { Layers } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import type { QuakeEvent, FireEvent } from '../../data/types';

interface Props {
  quakes: QuakeEvent[];
  fires: FireEvent[];
}

export default function MapPanel({ quakes, fires }: Props) {
  const enabledLayers = useDashboardStore(s => s.enabledLayers);
  const updatedAt = useDashboardStore(s => s.quakesUpdatedAt);
  const enabledCount = Object.values(enabledLayers).filter(Boolean).length;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Map</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Layers: {enabledCount} · Updated: {updatedAt ? timeAgo(updatedAt) : '—'}
        </span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <MapContainer quakes={quakes} fires={fires} />
        <div className="absolute top-2 left-2 z-10">
          <LayerToggles />
        </div>
        <div className="absolute bottom-2 left-2 z-10">
          <Legend />
        </div>
      </div>
    </div>
  );
}
