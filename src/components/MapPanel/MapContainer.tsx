import { useDashboardStore } from '../../state/useDashboardStore';
import { quakesMock } from '../../data/quakes.mock';
import { REGION_BOUNDS } from '../../data/types';

export default function MapContainer() {
  const { enabledLayers, selectedQuakeId, selectQuake, regionPreset } = useDashboardStore();
  const bounds = REGION_BOUNDS[regionPreset];

  // Normalize lat/lon to percentage positions within the container
  const normalize = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  const visibleQuakes = enabledLayers.earthquakes
    ? quakesMock.filter(q => q.lat >= bounds.minLat && q.lat <= bounds.maxLat && q.lon >= bounds.minLon && q.lon <= bounds.maxLon)
    : [];

  return (
    <div className="w-full h-full bg-secondary relative overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }}>
      {/* Grid label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-muted-foreground/30 font-mono text-sm">MapLibre · deck.gl — pending integration</span>
      </div>

      {/* Quake dots */}
      {visibleQuakes.map(q => {
        const pos = normalize(q.lat, q.lon);
        const isSelected = selectedQuakeId === q.id;
        const size = q.magnitude >= 6.0 ? 14 : q.magnitude >= 5.0 ? 10 : 7;
        const color = q.magnitude >= 6.0 ? 'hsl(0, 65%, 50%)' : q.magnitude >= 5.0 ? 'hsl(38, 90%, 50%)' : 'hsl(175, 70%, 45%)';

        return (
          <button
            key={q.id}
            onClick={() => selectQuake(q.id)}
            className="absolute rounded-full transition-all cursor-pointer hover:scale-150"
            title={`M${q.magnitude} — ${q.place}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: size,
              height: size,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
              boxShadow: isSelected
                ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${color}, 0 0 12px ${color}`
                : `0 0 4px ${color}`,
              zIndex: isSelected ? 20 : 10,
            }}
          />
        );
      })}
    </div>
  );
}
