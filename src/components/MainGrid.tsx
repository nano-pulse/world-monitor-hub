import MapPanel from './MapPanel/MapPanel';
import NewsPanel from './NewsPanel/NewsPanel';
import QuakePanel from './QuakePanel/QuakePanel';
import SignalsPanel from './SignalsPanel/SignalsPanel';
import { useIsMobile } from '../hooks/use-mobile';
import { useState } from 'react';

const TABS = ['Map', 'News', 'Quakes', 'Signals'] as const;

export default function MainGrid() {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<typeof TABS[number]>('Map');

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile tab bar */}
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
          {mobileTab === 'Map' && <MapPanel />}
          {mobileTab === 'News' && <NewsPanel />}
          {mobileTab === 'Quakes' && <QuakePanel />}
          {mobileTab === 'Signals' && <SignalsPanel />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-[1fr_360px] grid-rows-[1fr_auto] gap-1.5 p-1.5 overflow-hidden min-h-0">
      <div className="row-span-1 min-h-0 overflow-hidden">
        <MapPanel />
      </div>
      <div className="row-span-1 min-h-0 overflow-hidden">
        <NewsPanel />
      </div>
      <div className="min-h-0 overflow-hidden" style={{ maxHeight: '260px' }}>
        <SignalsPanel />
      </div>
      <div className="min-h-0 overflow-hidden" style={{ maxHeight: '260px' }}>
        <QuakePanel />
      </div>
    </div>
  );
}
