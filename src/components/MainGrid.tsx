import MapPanel from './MapPanel/MapPanel';
import NewsPanel from './NewsPanel/NewsPanel';
import QuakePanel from './QuakePanel/QuakePanel';
import SignalsPanel from './SignalsPanel/SignalsPanel';
import WildfiresPanel from './WildfiresPanel/WildfiresPanel';
import { useIsMobile } from '../hooks/use-mobile';
import { useQuakes } from '../services/useQuakes';
import { useWildfires } from '../services/useWildfires';
import { useDashboardStore } from '../state/useDashboardStore';
import { useState } from 'react';

const TABS = ['Map', 'News', 'Quakes', 'Signals', 'Fires'] as const;

export default function MainGrid() {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<typeof TABS[number]>('Map');
  const { quakes, loading, error, stale } = useQuakes();
  const { fires, loading: firesLoading, error: firesError, stale: firesStale, updatedAt: firesUpdatedAt, refetch: refetchFires } = useWildfires();
  const showWildfires = useDashboardStore(s => s.enabledLayers.wildfires);

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex bg-card border-b border-border shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={`flex-1 text-xs font-mono py-2 transition-colors ${mobileTab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-2">
          {mobileTab === 'Map' && <MapPanel quakes={quakes} fires={fires} />}
          {mobileTab === 'News' && <NewsPanel />}
          {mobileTab === 'Quakes' && <QuakePanel quakes={quakes} loading={loading} error={error} stale={stale} />}
          {mobileTab === 'Signals' && <SignalsPanel quakes={quakes} />}
          {mobileTab === 'Fires' && <WildfiresPanel fires={fires} loading={firesLoading} error={firesError} stale={firesStale} updatedAt={firesUpdatedAt} onRefresh={refetchFires} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-[1fr_360px] grid-rows-[1fr_auto] gap-1.5 p-1.5 overflow-hidden min-h-0">
      <div className="row-span-1 min-h-0 overflow-hidden">
        <MapPanel quakes={quakes} fires={fires} />
      </div>
      <div className="row-span-1 min-h-0 overflow-hidden">
        <NewsPanel />
      </div>
      <div className="min-h-0 overflow-hidden flex gap-1.5" style={{ maxHeight: '260px' }}>
        <div className="flex-1 min-w-0">
          <SignalsPanel quakes={quakes} />
        </div>
        {showWildfires && (
          <div className="flex-1 min-w-0">
            <WildfiresPanel fires={fires} loading={firesLoading} error={firesError} stale={firesStale} updatedAt={firesUpdatedAt} onRefresh={refetchFires} />
          </div>
        )}
      </div>
      <div className="min-h-0 overflow-hidden" style={{ maxHeight: '260px' }}>
        <QuakePanel quakes={quakes} loading={loading} error={error} stale={stale} />
      </div>
    </div>
  );
}
