import { useDashboardStore } from '../../state/useDashboardStore';
import { useNews } from '../../services/useNews';
import { REGION_TAGS } from '../../data/types';
import type { NewsTab } from '../../data/types';
import NewsListVirtual from './NewsListVirtual';
import { Newspaper, RefreshCw } from 'lucide-react';
import { timeAgo } from '../../lib/time';

const tabs: { value: NewsTab; label: string }[] = [
  { value: 'geopolitics', label: 'Geopolitics' },
  { value: 'tech', label: 'Tech' },
  { value: 'finance', label: 'Finance' },
  { value: 'local', label: 'Local' },
];

export default function NewsPanel() {
  const { newsTab, setNewsTab } = useDashboardStore();
  const { items, loading, sourcesHealth, fromProxy, updatedAt, refetch } = useNews();

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-primary" />
          <span>News</span>
          <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {fromProxy && sourcesHealth.total > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Sources: {sourcesHealth.ok}/{sourcesHealth.total}
            </span>
          )}
          {!fromProxy && (
            <span className="text-[10px] font-mono text-muted-foreground">mock</span>
          )}
          {updatedAt && (
            <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(updatedAt)}</span>
          )}
          <button
            onClick={refetch}
            className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh news"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setNewsTab(t.value)}
            className={`flex-1 text-xs font-medium py-1.5 transition-colors ${newsTab === t.value ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {loading && items.length === 0 ? (
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 skeleton-shimmer rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No headlines match your search</div>
        ) : (
          <NewsListVirtual items={items} />
        )}
      </div>
    </div>
  );
}
