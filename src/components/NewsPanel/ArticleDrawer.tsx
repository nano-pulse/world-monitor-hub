import { useDashboardStore } from '../../state/useDashboardStore';
import { newsMock } from '../../data/news.mock';
import { X, Pin, ExternalLink } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import { toast } from 'sonner';

export default function ArticleDrawer() {
  const { selectedNewsId, closeArticleDrawer, pinNews, unpinNews, pinnedNewsIds, ui } = useDashboardStore();
  if (!ui.articleDrawerOpen || !selectedNewsId) return null;

  const article = newsMock.find(n => n.id === selectedNewsId);
  if (!article) return null;

  const isPinned = pinnedNewsIds.includes(article.id);
  const handlePin = () => {
    if (isPinned) { unpinNews(article.id); }
    else { pinNews(article.id); toast.success('Pinned article'); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-40" onClick={closeArticleDrawer} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-semibold">Article</span>
          <button onClick={closeArticleDrawer} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="text-primary">{article.sourceName}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAtISO)}</span>
            <span>·</span>
            <span>{new Date(article.publishedAtISO).toLocaleString()}</span>
          </div>
          <h2 className="text-lg font-semibold leading-tight">{article.title}</h2>
          <div className="flex gap-1.5 flex-wrap">
            {article.tags.map(t => (
              <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>
          <p className="text-sm text-secondary-foreground leading-relaxed">{article.summary}</p>
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <button
            onClick={handlePin}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${isPinned ? 'border-warning text-warning' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Pin className="w-3 h-3" />
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open original
          </a>
        </div>
      </div>
    </>
  );
}
