import { useDashboardStore } from '../../state/useDashboardStore';
import { FEEDS } from '../../data/feeds.registry';
import type { FeedCategory } from '../../data/feeds.registry';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const CATEGORY_ORDER: FeedCategory[] = ['geopolitics', 'tech', 'finance'];
const CATEGORY_LABELS: Record<FeedCategory, string> = {
  geopolitics: 'Geopolitics',
  tech: 'Tech',
  finance: 'Finance',
  regional: 'Regional',
};

export default function SourcesModal() {
  const { ui, setSourcesModalOpen, enabledNewsSources, toggleSource, setAllSources } = useDashboardStore();

  useEffect(() => {
    if (!ui.sourcesModalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSourcesModalOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ui.sourcesModalOpen, setSourcesModalOpen]);

  if (!ui.sourcesModalOpen) return null;

  const enabledCount = Object.values(enabledNewsSources).filter(Boolean).length;
  const totalCount = FEEDS.length;

  return (
    <>
      <div className="fixed inset-0 bg-background/60 z-40" onClick={() => setSourcesModalOpen(false)} />
      <div className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-card border border-border rounded-lg z-50 max-h-[70vh] flex flex-col" role="dialog" aria-label="News sources">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">News Sources</span>
            <span className="text-xs text-muted-foreground font-mono">{enabledCount}/{totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAllSources(true)} className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-primary/20 transition-colors">Enable all</button>
            <button onClick={() => setAllSources(false)} className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-destructive/20 transition-colors">Disable all</button>
            <button onClick={() => setSourcesModalOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground" aria-label="Close sources"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {CATEGORY_ORDER.map(cat => {
            const catFeeds = FEEDS.filter(f => f.category === cat);
            const catEnabled = catFeeds.filter(f => enabledNewsSources[f.id]).length;
            return (
              <div key={cat}>
                <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[cat]} <span className="text-[10px] font-normal">({catEnabled}/{catFeeds.length})</span>
                </h3>
                <div className="space-y-1">
                  {catFeeds.map(f => (
                    <label key={f.id} className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-secondary transition-colors">
                      <input
                        type="checkbox"
                        checked={!!enabledNewsSources[f.id]}
                        onChange={() => toggleSource(f.id)}
                        className="rounded border-border accent-primary"
                      />
                      <span>{f.name}</span>
                      {f.regionTags && f.regionTags.length > 0 && f.regionTags[0] !== 'global' && (
                        <span className="text-[9px] font-mono text-muted-foreground">{f.regionTags.join(', ')}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
