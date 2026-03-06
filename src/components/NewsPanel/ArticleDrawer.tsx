import { useDashboardStore } from '../../state/useDashboardStore';
import { newsMock } from '../../data/news.mock';
import { X, Pin, ExternalLink, Sparkles, Languages, Tags, Loader2 } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { aiSummarize, aiTranslate, aiClassify } from '../../services/ai';
import type { AISummaryResult, AITranslateResult, AIClassifyResult } from '../../services/ai';

type SummaryMode = 'bullet' | 'short' | 'detailed';
const LANGUAGES = [
  { code: 'English', label: 'EN' },
  { code: 'Swedish', label: 'SV' },
  { code: 'Arabic', label: 'AR' },
  { code: 'French', label: 'FR' },
  { code: 'German', label: 'DE' },
];

export default function ArticleDrawer() {
  const { selectedNewsId, closeArticleDrawer, pinNews, unpinNews, pinnedNewsIds, ui, aiConfig } = useDashboardStore();

  const [summaryResult, setSummaryResult] = useState<AISummaryResult | null>(null);
  const [translationResult, setTranslationResult] = useState<AITranslateResult | null>(null);
  const [classifyResult, setClassifyResult] = useState<AIClassifyResult | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showSummaryMenu, setShowSummaryMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  // Reset AI state on article change
  useEffect(() => {
    setSummaryResult(null);
    setTranslationResult(null);
    setClassifyResult(null);
    setAiLoading(null);
    setShowSummaryMenu(false);
    setShowTranslateMenu(false);
  }, [selectedNewsId]);

  useEffect(() => {
    if (!ui.articleDrawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeArticleDrawer(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ui.articleDrawerOpen, closeArticleDrawer]);

  if (!ui.articleDrawerOpen || !selectedNewsId) return null;

  const article = newsMock.find(n => n.id === selectedNewsId);
  if (!article) return null;

  const isPinned = pinnedNewsIds.includes(article.id);
  const handlePin = () => {
    if (isPinned) { unpinNews(article.id); }
    else { pinNews(article.id); toast.success('Pinned article'); }
  };

  const handleSummarize = async (mode: SummaryMode) => {
    setShowSummaryMenu(false);
    if (!aiConfig.enabled) { toast.error('AI not configured. Enable in Settings.'); return; }
    setAiLoading('summary');
    try {
      const result = await aiSummarize(aiConfig, `${article.title}\n\n${article.summary}`, mode);
      setSummaryResult(result);
    } catch (err: any) {
      toast.error(err.message || 'AI summarization failed');
    } finally {
      setAiLoading(null);
    }
  };

  const handleTranslate = async (lang: string) => {
    setShowTranslateMenu(false);
    if (!aiConfig.enabled) { toast.error('AI not configured. Enable in Settings.'); return; }
    setAiLoading('translate');
    try {
      const result = await aiTranslate(aiConfig, `${article.title}\n\n${article.summary}`, lang);
      setTranslationResult(result);
    } catch (err: any) {
      toast.error(err.message || 'AI translation failed');
    } finally {
      setAiLoading(null);
    }
  };

  const handleClassify = async () => {
    if (!aiConfig.enabled) { toast.error('AI not configured. Enable in Settings.'); return; }
    setAiLoading('classify');
    try {
      const result = await aiClassify(aiConfig, article.title, article.summary);
      setClassifyResult(result);
    } catch (err: any) {
      toast.error(err.message || 'AI classification failed');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-40" onClick={closeArticleDrawer} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200" role="dialog" aria-label="Article detail">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-semibold">Article</span>
          <button onClick={closeArticleDrawer} className="p-1 rounded hover:bg-secondary text-muted-foreground" aria-label="Close article"><X className="w-4 h-4" /></button>
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
            {classifyResult && (
              <>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">{classifyResult.category}</span>
                {classifyResult.tags.map(t => (
                  <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">{t}</span>
                ))}
              </>
            )}
          </div>
          <p className="text-sm text-secondary-foreground leading-relaxed">{article.summary}</p>

          {/* AI Results */}
          {aiLoading && (
            <div className="flex items-center gap-2 p-3 rounded bg-muted/50">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">AI processing…</span>
            </div>
          )}

          {summaryResult && (
            <div className="p-3 rounded bg-muted/50 space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-primary font-semibold">AI SUMMARY</span>
                {summaryResult.cached && <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">Cached</span>}
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{summaryResult.summary}</p>
            </div>
          )}

          {translationResult && (
            <div className="p-3 rounded bg-muted/50 space-y-1">
              <div className="flex items-center gap-2">
                <Languages className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-primary font-semibold">TRANSLATION</span>
                {translationResult.cached && <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">Cached</span>}
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{translationResult.translation}</p>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-border space-y-2">
          {/* AI Buttons row */}
          <div className="flex gap-1.5 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowSummaryMenu(!showSummaryMenu)}
                disabled={!!aiLoading}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" /> Summary
              </button>
              {showSummaryMenu && (
                <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded shadow-lg z-10">
                  {(['bullet', 'short', 'detailed'] as SummaryMode[]).map(m => (
                    <button key={m} onClick={() => handleSummarize(m)} className="block w-full text-left text-[10px] font-mono px-3 py-1.5 hover:bg-secondary transition-colors capitalize">{m}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                disabled={!!aiLoading}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                <Languages className="w-3 h-3" /> Translate
              </button>
              {showTranslateMenu && (
                <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded shadow-lg z-10">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => handleTranslate(l.code)} className="block w-full text-left text-[10px] font-mono px-3 py-1.5 hover:bg-secondary transition-colors">{l.label}</button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleClassify}
              disabled={!!aiLoading}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
            >
              <Tags className="w-3 h-3" /> Classify
            </button>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePin}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${isPinned ? 'border-warning text-warning' : 'border-border text-muted-foreground hover:text-foreground'}`}
              aria-label={isPinned ? 'Unpin article' : 'Pin article'}
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
      </div>
    </>
  );
}
