/**
 * Feed registry shared between API functions.
 * Duplicated from src/data/feeds.registry.ts to avoid bundling issues
 * in Vercel serverless functions.
 */

export type FeedCategory = 'geopolitics' | 'tech' | 'finance' | 'regional';
export type RegionPreset = 'global' | 'europe' | 'middle-east' | 'north-america' | 'asia';

export interface Feed {
  id: string;
  name: string;
  category: FeedCategory;
  url: string;
  enabledDefault: boolean;
  regionTags?: RegionPreset[];
}

export const FEEDS: Feed[] = [
  // === Geopolitics (10) ===
  { id: 'reuters-world', name: 'Reuters World', category: 'geopolitics', url: 'https://feeds.reuters.com/Reuters/worldNews', enabledDefault: true, regionTags: ['global'] },
  { id: 'bbc-world', name: 'BBC World', category: 'geopolitics', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', enabledDefault: true, regionTags: ['global'] },
  { id: 'ap-topnews', name: 'AP Top News', category: 'geopolitics', url: 'https://rsshub.app/apnews/topics/apf-topnews', enabledDefault: true, regionTags: ['global'] },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'geopolitics', url: 'https://www.aljazeera.com/xml/rss/all.xml', enabledDefault: true, regionTags: ['middle-east'] },
  { id: 'dw-world', name: 'Deutsche Welle', category: 'geopolitics', url: 'https://rss.dw.com/rdf/rss-en-world', enabledDefault: true, regionTags: ['europe'] },
  { id: 'france24', name: 'France 24', category: 'geopolitics', url: 'https://www.france24.com/en/rss', enabledDefault: true, regionTags: ['europe'] },
  { id: 'scmp', name: 'South China Morning Post', category: 'geopolitics', url: 'https://www.scmp.com/rss/91/feed', enabledDefault: true, regionTags: ['asia'] },
  { id: 'nikkei-asia', name: 'Nikkei Asia', category: 'geopolitics', url: 'https://asia.nikkei.com/rss', enabledDefault: false, regionTags: ['asia'] },
  { id: 'csis', name: 'CSIS Analysis', category: 'geopolitics', url: 'https://www.csis.org/analysis/feed', enabledDefault: false, regionTags: ['global'] },
  { id: 'cfr', name: 'CFR', category: 'geopolitics', url: 'https://www.cfr.org/rss.xml', enabledDefault: false, regionTags: ['global'] },

  // === Tech (10) ===
  { id: 'techcrunch', name: 'TechCrunch', category: 'tech', url: 'https://techcrunch.com/feed/', enabledDefault: true, regionTags: ['global'] },
  { id: 'arstechnica', name: 'Ars Technica', category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index', enabledDefault: true, regionTags: ['global'] },
  { id: 'wired', name: 'Wired', category: 'tech', url: 'https://www.wired.com/feed/rss', enabledDefault: true, regionTags: ['global'] },
  { id: 'verge', name: 'The Verge', category: 'tech', url: 'https://www.theverge.com/rss/index.xml', enabledDefault: true, regionTags: ['global'] },
  { id: 'hackernews', name: 'Hacker News', category: 'tech', url: 'https://hnrss.org/frontpage', enabledDefault: false, regionTags: ['global'] },
  { id: 'theregister', name: 'The Register', category: 'tech', url: 'https://www.theregister.com/headlines.atom', enabledDefault: false, regionTags: ['europe'] },
  { id: 'zdnet', name: 'ZDNet', category: 'tech', url: 'https://www.zdnet.com/news/rss.xml', enabledDefault: false, regionTags: ['global'] },
  { id: 'bleepingcomputer', name: 'BleepingComputer', category: 'tech', url: 'https://www.bleepingcomputer.com/feed/', enabledDefault: true, regionTags: ['global'] },
  { id: 'krebs', name: 'Krebs on Security', category: 'tech', url: 'https://krebsonsecurity.com/feed/', enabledDefault: false, regionTags: ['north-america'] },
  { id: 'mit-tech', name: 'MIT Tech Review', category: 'tech', url: 'https://www.technologyreview.com/feed/', enabledDefault: false, regionTags: ['global'] },

  // === Finance (10) ===
  { id: 'ft-world', name: 'Financial Times', category: 'finance', url: 'https://www.ft.com/rss/home', enabledDefault: true, regionTags: ['global'] },
  { id: 'bloomberg-markets', name: 'Bloomberg Markets', category: 'finance', url: 'https://feeds.bloomberg.com/markets/news.rss', enabledDefault: true, regionTags: ['global'] },
  { id: 'wsj-markets', name: 'WSJ Markets', category: 'finance', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', enabledDefault: true, regionTags: ['north-america'] },
  { id: 'cnbc', name: 'CNBC', category: 'finance', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', enabledDefault: true, regionTags: ['north-america'] },
  { id: 'economist', name: 'The Economist', category: 'finance', url: 'https://www.economist.com/finance-and-economics/rss.xml', enabledDefault: false, regionTags: ['global'] },
  { id: 'marketwatch', name: 'MarketWatch', category: 'finance', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', enabledDefault: false, regionTags: ['north-america'] },
  { id: 'investing', name: 'Investing.com', category: 'finance', url: 'https://www.investing.com/rss/news.rss', enabledDefault: false, regionTags: ['global'] },
  { id: 'yahoo-finance', name: 'Yahoo Finance', category: 'finance', url: 'https://finance.yahoo.com/news/rssindex', enabledDefault: false, regionTags: ['north-america'] },
  { id: 'reuters-biz', name: 'Reuters Business', category: 'finance', url: 'https://feeds.reuters.com/reuters/businessNews', enabledDefault: true, regionTags: ['global'] },
  { id: 'nikkei-markets', name: 'Nikkei Markets', category: 'finance', url: 'https://asia.nikkei.com/rss/feed/nar', enabledDefault: false, regionTags: ['asia'] },
];

export function getAllowedFeedById(feedId: string): Feed | undefined {
  return FEEDS.find(f => f.id === feedId);
}

export function getDefaultEnabledMap(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const f of FEEDS) map[f.id] = f.enabledDefault;
  return map;
}
