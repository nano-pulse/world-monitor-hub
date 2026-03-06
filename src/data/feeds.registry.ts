export interface Feed {
  id: string;
  name: string;
  category: 'geopolitics' | 'tech' | 'finance' | 'regional';
  url: string;
  enabledDefault: boolean;
  regionTags?: string[];
}

export const feedsRegistry: Feed[] = [
  // === Geopolitics (10) ===
  { id: 'reuters-world', name: 'Reuters World', category: 'geopolitics', url: 'https://feeds.reuters.com/Reuters/worldNews', enabledDefault: true, regionTags: [] },
  { id: 'bbc-world', name: 'BBC World', category: 'geopolitics', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', enabledDefault: true, regionTags: [] },
  { id: 'ap-topnews', name: 'AP Top News', category: 'geopolitics', url: 'https://rsshub.app/apnews/topics/apf-topnews', enabledDefault: true, regionTags: [] },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'geopolitics', url: 'https://www.aljazeera.com/xml/rss/all.xml', enabledDefault: true, regionTags: ['Middle East'] },
  { id: 'dw-world', name: 'Deutsche Welle', category: 'geopolitics', url: 'https://rss.dw.com/rdf/rss-en-world', enabledDefault: true, regionTags: ['Europe'] },
  { id: 'france24', name: 'France 24', category: 'geopolitics', url: 'https://www.france24.com/en/rss', enabledDefault: true, regionTags: ['Europe'] },
  { id: 'scmp', name: 'South China Morning Post', category: 'geopolitics', url: 'https://www.scmp.com/rss/91/feed', enabledDefault: true, regionTags: ['Asia', 'China'] },
  { id: 'nikkei-asia', name: 'Nikkei Asia', category: 'geopolitics', url: 'https://asia.nikkei.com/rss', enabledDefault: false, regionTags: ['Asia', 'Japan'] },
  { id: 'csis', name: 'CSIS Analysis', category: 'geopolitics', url: 'https://www.csis.org/analysis/feed', enabledDefault: false, regionTags: [] },
  { id: 'cfr', name: 'CFR', category: 'geopolitics', url: 'https://www.cfr.org/rss.xml', enabledDefault: false, regionTags: [] },

  // === Tech (10) ===
  { id: 'techcrunch', name: 'TechCrunch', category: 'tech', url: 'https://techcrunch.com/feed/', enabledDefault: true, regionTags: [] },
  { id: 'arstechnica', name: 'Ars Technica', category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index', enabledDefault: true, regionTags: [] },
  { id: 'wired', name: 'Wired', category: 'tech', url: 'https://www.wired.com/feed/rss', enabledDefault: true, regionTags: [] },
  { id: 'verge', name: 'The Verge', category: 'tech', url: 'https://www.theverge.com/rss/index.xml', enabledDefault: true, regionTags: [] },
  { id: 'hackernews', name: 'Hacker News', category: 'tech', url: 'https://hnrss.org/frontpage', enabledDefault: false, regionTags: [] },
  { id: 'theregister', name: 'The Register', category: 'tech', url: 'https://www.theregister.com/headlines.atom', enabledDefault: false, regionTags: ['Europe', 'UK'] },
  { id: 'zdnet', name: 'ZDNet', category: 'tech', url: 'https://www.zdnet.com/news/rss.xml', enabledDefault: false, regionTags: [] },
  { id: 'bleepingcomputer', name: 'BleepingComputer', category: 'tech', url: 'https://www.bleepingcomputer.com/feed/', enabledDefault: true, regionTags: [] },
  { id: 'krebs', name: 'Krebs on Security', category: 'tech', url: 'https://krebsonsecurity.com/feed/', enabledDefault: false, regionTags: [] },
  { id: 'mit-tech', name: 'MIT Tech Review', category: 'tech', url: 'https://www.technologyreview.com/feed/', enabledDefault: false, regionTags: [] },

  // === Finance (10) ===
  { id: 'ft-world', name: 'Financial Times', category: 'finance', url: 'https://www.ft.com/rss/home', enabledDefault: true, regionTags: [] },
  { id: 'bloomberg-markets', name: 'Bloomberg Markets', category: 'finance', url: 'https://feeds.bloomberg.com/markets/news.rss', enabledDefault: true, regionTags: [] },
  { id: 'wsj-markets', name: 'WSJ Markets', category: 'finance', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', enabledDefault: true, regionTags: ['US', 'North America'] },
  { id: 'cnbc', name: 'CNBC', category: 'finance', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', enabledDefault: true, regionTags: ['US'] },
  { id: 'economist', name: 'The Economist', category: 'finance', url: 'https://www.economist.com/finance-and-economics/rss.xml', enabledDefault: false, regionTags: [] },
  { id: 'marketwatch', name: 'MarketWatch', category: 'finance', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', enabledDefault: false, regionTags: ['US'] },
  { id: 'investing', name: 'Investing.com', category: 'finance', url: 'https://www.investing.com/rss/news.rss', enabledDefault: false, regionTags: [] },
  { id: 'yahoo-finance', name: 'Yahoo Finance', category: 'finance', url: 'https://finance.yahoo.com/news/rssindex', enabledDefault: false, regionTags: ['US'] },
  { id: 'reuters-biz', name: 'Reuters Business', category: 'finance', url: 'https://feeds.reuters.com/reuters/businessNews', enabledDefault: true, regionTags: [] },
  { id: 'nikkei-markets', name: 'Nikkei Markets', category: 'finance', url: 'https://asia.nikkei.com/rss/feed/nar', enabledDefault: false, regionTags: ['Asia', 'Japan'] },
];

/** Get feed IDs by category */
export function getFeedsByCategory(category: Feed['category']): Feed[] {
  return feedsRegistry.filter(f => f.category === category);
}

/** Check if a URL is in the allowlist */
export function isAllowlistedUrl(url: string): boolean {
  return feedsRegistry.some(f => f.url === url);
}

/** Default enabled sources map */
export function getDefaultEnabledFeeds(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  feedsRegistry.forEach(f => { map[f.id] = f.enabledDefault; });
  return map;
}
