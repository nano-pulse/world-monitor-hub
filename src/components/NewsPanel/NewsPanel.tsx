import { useDashboardStore } from '../../state/useDashboardStore';
import { newsMock } from '../../data/news.mock';
import { REGION_TAGS } from '../../data/types';
import type { NewsTab } from '../../data/types';
import NewsListVirtual from './NewsListVirtual';
import { Newspaper } from 'lucide-react';

const tabs: { value: NewsTab; label: string }[] = [
  { value: 'geopolitics', label: 'Geopolitics' },
  { value: 'tech', label: 'Tech' },
  { value: 'finance', label: 'Finance' },
  { value: 'local', label: 'Local' },
];

export default function NewsPanel() {
  const { newsTab, setNewsTab, searchQuery, enabledNewsSources, regionPreset } = useDashboardStore();

  const filtered = newsMock.filter(item => {
    // Source filter
    if (!enabledNewsSources[item.sourceId]) return false;
    // Search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Tab filter
    if (newsTab === 'local') {
      const regionTags = REGION_TAGS[regionPreset];
      if (regionTags.length === 0) return true; // global shows all
      return item.tags.some(t => regionTags.some(rt => t.toLowerCase().includes(rt.toLowerCase())));
    }
    return item.category === newsTab;
  });

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-primary" />
          <span>News</span>
          <span className="text-xs text-muted-foreground font-mono">({filtered.length})</span>
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
        <NewsListVirtual items={filtered} />
      </div>
    </div>
  );
}
