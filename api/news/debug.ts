import type { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import { FEEDS } from '../_lib/feeds';

const parser = new RSSParser({
  timeout: 8000,
  headers: {
    'User-Agent': 'WorldMonitor/1.0 (RSS Aggregator; +https://github.com/worldmonitor)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
});

// Pick 2 known-reliable feeds for smoke testing
const TEST_FEED_IDS = ['bbc-world', 'hackernews'];

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const testFeeds = FEEDS.filter(f => TEST_FEED_IDS.includes(f.id));
  const failures: Array<{ feedId: string; error: string }> = [];
  let totalItems = 0;

  for (const feed of testFeeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      totalItems += (parsed.items || []).length;
    } catch (err: unknown) {
      failures.push({
        feedId: feed.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return res.json({
    ok: failures.length === 0,
    testedFeeds: testFeeds.map(f => f.id),
    items: totalItems,
    failures,
    ts: new Date().toISOString(),
  });
}
