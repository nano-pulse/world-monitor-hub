import { useDashboardStore } from '../../state/useDashboardStore';
import { sourcesMock } from '../../data/sources.mock';
import { feedsRegistry } from '../../data/feeds.registry';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const categories = ['major-media', 'regional', 'think-tanks', 'tech', 'finance'] as const;
const categoryLabels: Record<string, string> = {
  'major-media': 'Major Media',
  'regional': 'Regional',
  'think-tanks': 'Think Tanks',
  'tech': 'Tech',
  'finance': 'Finance',
};

// Feed categories mapped to source categories
const feedCategoryMap: Record<string, string> = {
  'geopolitics': 'major-media',
  'regional': 'regional',
  'tech': 'tech',
  'finance': 'finance',
};

export default function SourcesModal() {
  const { ui, setSourcesModalOpen, enabledNewsSources, toggleSource, setAllSources, newsProxyUrl } = useDashboardStore();

  useEffect(() => {
    if (!ui.sourcesModalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSourcesModalOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ui.sourcesModalOpen, setSourcesModalOpen]);

  if (!ui.sourcesModalOpen) return null;

  // Use feed registry if proxy is configured, otherwise use mock sources
  const usingProxy = !!newsProxyUrl;

  const enabledCount = Object.values(enabledNewsSources).filter(Boolean).length;
  const totalCount = Object.keys(enabledNewsSources).length;

  return (
    <>
      <div className="fixed inset-0 bg-background/60 z-40" onClick={() => setSourcesModalOpen(false)} />
      <div className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-card border border-border rounded-lg z-50 max-h-[70vh] flex flex-col" role="dialog" aria-label="News sources">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">News Sources</span>
            <span className="text-xs text-muted-foreground font-mono">{enabledCount}/{totalCount}</span>
            {usingProxy && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">RSS</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAllSources(true)} className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-primary/20 transition-colors">Enable all</button>
            <button onClick={() => setAllSources(false)} className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-destructive/20 transition-colors">Disable all</button>
            <button onClick={() => setSourcesModalOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground" aria-label="Close sources"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {usingProxy ? (
            // Show feeds from registry grouped by category
            <>
              {(['geopolitics', 'tech', 'finance'] as const).map(cat => {
                const catFeeds = feedsRegistry.filter(f => f.category === cat || (cat === 'geopolitics' && f.category === 'regional'));
                const catEnabled = catFeeds.filter(f => enabledNewsSources[f.id]).length;
                return (
                  <div key={cat}>
                    <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {cat === 'geopolitics' ? 'Geopolitics & Regional' : cat.charAt(0).toUpperCase() + cat.slice(1)} <span className="text-[10px] font-normal">({catEnabled}/{catFeeds.length})</span>
                    </h3>
                    <div className="space-y-1">
                      {catFeeds.map(f => (
                        <label key={f.id} className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-secondary transition-colors">
                          <input type="checkbox" checked={!!enabledNewsSources[f.id]} onChange={() => toggleSource(f.id)} className="rounded border-border accent-primary" />
                          <span>{f.name}</span>
                          {f.regionTags && f.regionTags.length > 0 && (
                            <span className="text-[9px] font-mono text-muted-foreground">{f.regionTags.join(', ')}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // Show mock sources
            categories.map(cat => {
              const catSources = sourcesMock.filter(s => s.category === cat);
              const catEnabled = catSources.filter(s => enabledNewsSources[s.id]).length;
              return (
                <div key={cat}>
                  <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {categoryLabels[cat]} <span className="text-[10px] font-normal">({catEnabled}/{catSources.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {catSources.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-secondary transition-colors">
                        <input type="checkbox" checked={!!enabledNewsSources[s.id]} onChange={() => toggleSource(s.id)} className="rounded border-border accent-primary" />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
