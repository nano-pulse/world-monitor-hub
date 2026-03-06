import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDashboardStore } from '../../state/useDashboardStore';
import type { QuakeEvent, FireEvent } from '../../data/types';
import { REGION_BOUNDS } from '../../data/types';

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

function quakesToGeoJSON(quakes: QuakeEvent[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: quakes.map(q => ({
      type: 'Feature' as const,
      id: q.id,
      properties: { id: q.id, magnitude: q.magnitude, place: q.place, timeISO: q.timeISO, depthKm: q.depthKm },
      geometry: { type: 'Point' as const, coordinates: [q.lon, q.lat] },
    })),
  };
}

function firesToGeoJSON(fires: FireEvent[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fires.map(f => ({
      type: 'Feature' as const,
      id: f.id,
      properties: { id: f.id, title: f.title, timeISO: f.timeISO },
      geometry: { type: 'Point' as const, coordinates: [f.lon, f.lat] },
    })),
  };
}

interface Props {
  quakes: QuakeEvent[];
  fires: FireEvent[];
}

export default function MapContainer({ quakes, fires }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const fireDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { enabledLayers, selectedQuakeId, selectQuake, selectedFireId, selectFire, regionPreset } = useDashboardStore();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const bounds = REGION_BOUNDS[regionPreset];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: bounds.center,
      zoom: bounds.zoom,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      // === Quakes layers ===
      map.addSource('quakes', { type: 'geojson', data: quakesToGeoJSON([]) });
      map.addLayer({
        id: 'quakes-circle',
        type: 'circle',
        source: 'quakes',
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'magnitude'], 6.0], 'hsl(0, 65%, 50%)',
            ['>=', ['get', 'magnitude'], 5.0], 'hsl(38, 90%, 50%)',
            'hsl(175, 70%, 45%)'
          ],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            4.5, 4, 5.0, 6, 6.0, 9, 7.0, 13
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      });
      map.addLayer({
        id: 'quakes-highlight',
        type: 'circle',
        source: 'quakes',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            4.5, 10, 5.0, 13, 6.0, 17, 7.0, 22
          ],
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
          'circle-opacity': 1,
        },
      });
      map.on('click', 'quakes-circle', (e) => {
        if (e.features?.[0]) selectQuake(e.features[0].properties.id);
      });
      map.on('mouseenter', 'quakes-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'quakes-circle', () => { map.getCanvas().style.cursor = ''; });

      // === Wildfires layers ===
      map.addSource('fires', { type: 'geojson', data: firesToGeoJSON([]) });
      map.addLayer({
        id: 'fires-glow',
        type: 'circle',
        source: 'fires',
        paint: {
          'circle-color': 'hsl(25, 90%, 50%)',
          'circle-radius': 12,
          'circle-opacity': 0.2,
          'circle-blur': 1,
        },
      });
      map.addLayer({
        id: 'fires-circle',
        type: 'circle',
        source: 'fires',
        paint: {
          'circle-color': 'hsl(25, 90%, 50%)',
          'circle-radius': 5,
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'hsl(0, 80%, 45%)',
        },
      });
      map.addLayer({
        id: 'fires-highlight',
        type: 'circle',
        source: 'fires',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-radius': 16,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': 'hsl(25, 90%, 70%)',
        },
      });
      map.on('click', 'fires-circle', (e) => {
        if (e.features?.[0]) selectFire(e.features[0].properties.id);
      });
      map.on('mouseenter', 'fires-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'fires-circle', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to region
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = REGION_BOUNDS[regionPreset];
    map.flyTo({ center: bounds.center, zoom: bounds.zoom, duration: 1200 });
  }, [regionPreset]);

  // Update quake data (debounced)
  const updateQuakeSource = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('quakes') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const visible = enabledLayers.earthquakes ? quakes : [];
    src.setData(quakesToGeoJSON(visible));
    map.setLayoutProperty('quakes-circle', 'visibility', enabledLayers.earthquakes ? 'visible' : 'none');
    map.setLayoutProperty('quakes-highlight', 'visibility', enabledLayers.earthquakes ? 'visible' : 'none');
  }, [quakes, enabledLayers.earthquakes]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(updateQuakeSource, 150);
    return () => clearTimeout(debounceRef.current);
  }, [updateQuakeSource]);

  // Update fire data (debounced)
  const updateFireSource = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('fires') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const visible = enabledLayers.wildfires ? fires : [];
    src.setData(firesToGeoJSON(visible));
    const vis = enabledLayers.wildfires ? 'visible' : 'none';
    map.setLayoutProperty('fires-circle', 'visibility', vis);
    map.setLayoutProperty('fires-glow', 'visibility', vis);
    map.setLayoutProperty('fires-highlight', 'visibility', vis);
  }, [fires, enabledLayers.wildfires]);

  useEffect(() => {
    clearTimeout(fireDebounceRef.current);
    fireDebounceRef.current = setTimeout(updateFireSource, 150);
    return () => clearTimeout(fireDebounceRef.current);
  }, [updateFireSource]);

  // Highlight selected quake + fly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (selectedQuakeId) {
      map.setFilter('quakes-highlight', ['==', ['get', 'id'], selectedQuakeId]);
      const q = quakes.find(q => q.id === selectedQuakeId);
      if (q) map.flyTo({ center: [q.lon, q.lat], zoom: Math.max(map.getZoom(), 5), duration: 800 });
    } else {
      map.setFilter('quakes-highlight', ['==', ['get', 'id'], '']);
    }
  }, [selectedQuakeId, quakes]);

  // Highlight selected fire + fly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (selectedFireId) {
      map.setFilter('fires-highlight', ['==', ['get', 'id'], selectedFireId]);
      const f = fires.find(f => f.id === selectedFireId);
      if (f) map.flyTo({ center: [f.lon, f.lat], zoom: Math.max(map.getZoom(), 5), duration: 800 });
    } else {
      map.setFilter('fires-highlight', ['==', ['get', 'id'], '']);
    }
  }, [selectedFireId, fires]);

  return <div ref={containerRef} className="w-full h-full" />;
}
