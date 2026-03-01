export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function timeWindowMs(tw: string): number {
  const map: Record<string, number> = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '48h': 172800000, '7d': 604800000 };
  return map[tw] || 86400000;
}
