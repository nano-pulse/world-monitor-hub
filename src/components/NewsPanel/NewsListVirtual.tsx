import { Virtuoso } from 'react-virtuoso';
import type { NewsItem } from '../../data/types';
import { useDashboardStore } from '../../state/useDashboardStore';
import { timeAgo } from '../../lib/time';
import { Pin } from 'lucide-react';

interface Props {
  items: NewsItem[];
}

export default function NewsListVirtual({ items }: Props) {
  const { selectNews, pinnedNewsIds } = useDashboardStore();

  return (
    <Virtuoso
      data={items}
      className="scrollbar-thin"
      itemContent={(_, item) => {
        const isPinned = pinnedNewsIds.includes(item.id);
        return (
          <button
            onClick={() => selectNews(item.id)}
            className="w-full text-left px-3 py-2 border-b border-border hover:bg-secondary/50 transition-colors block"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono text-primary">{item.sourceName}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(item.publishedAtISO)}</span>
                  {isPinned && <Pin className="w-2.5 h-2.5 text-warning" />}
                </div>
                <p className="text-xs text-foreground leading-snug line-clamp-2">{item.title}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      }}
    />
  );
}
