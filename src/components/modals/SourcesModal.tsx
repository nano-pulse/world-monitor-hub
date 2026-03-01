import { useDashboardStore } from '../../state/useDashboardStore';
import { sourcesMock } from '../../data/sources.mock';
import { X } from 'lucide-react';

const categories = ['major-media', 'regional', 'think-tanks', 'tech', 'finance'] as const;
const categoryLabels: Record<string, string> = {
  'major-media': 'Major Media',
  'regional': 'Regional',
  'think-tanks': 'Think Tanks',
  'tech': 'Tech',
  'finance': 'Finance',
};

export default function SourcesModal() {
  const { ui, setSourcesModalOpen, enabledNewsSources, toggleSource } = useDashboardStore();
  if (!ui.sourcesModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/60 z-40" onClick={() => setSourcesModalOpen(false)} />
      <div className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-card border border-border rounded-lg z-50 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-semibold">News Sources</span>
          <button onClick={() => setSourcesModalOpen(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">{categoryLabels[cat]}</h3>
              <div className="space-y-1">
                {sourcesMock.filter(s => s.category === cat).map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-secondary transition-colors">
                    <input
                      type="checkbox"
                      checked={!!enabledNewsSources[s.id]}
                      onChange={() => toggleSource(s.id)}
                      className="rounded border-border"
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
