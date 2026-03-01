import MapContainer from './MapContainer';
import LayerToggles from './LayerToggles';
import Legend from './Legend';
import { useDashboardStore } from '../../state/useDashboardStore';
import { Layers } from 'lucide-react';

export default function MapPanel() {
  const enabledLayers = useDashboardStore(s => s.enabledLayers);
  const enabledCount = Object.values(enabledLayers).filter(Boolean).length;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Map</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Layers: {enabledCount} enabled · Updated: 2m ago
        </span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <MapContainer />
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
