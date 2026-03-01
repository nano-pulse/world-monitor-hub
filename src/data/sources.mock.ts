import { NewsSource } from './types';

export const sourcesMock: NewsSource[] = [
  { id: 'reuters', name: 'Reuters', category: 'major-media', enabledDefault: true },
  { id: 'ap', name: 'Associated Press', category: 'major-media', enabledDefault: true },
  { id: 'bbc', name: 'BBC World', category: 'major-media', enabledDefault: true },
  { id: 'afp', name: 'Agence France-Presse', category: 'major-media', enabledDefault: true },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'regional', enabledDefault: true },
  { id: 'scmp', name: 'South China Morning Post', category: 'regional', enabledDefault: true },
  { id: 'dw', name: 'Deutsche Welle', category: 'regional', enabledDefault: true },
  { id: 'iiss', name: 'IISS', category: 'think-tanks', enabledDefault: true },
  { id: 'csis', name: 'CSIS', category: 'think-tanks', enabledDefault: true },
  { id: 'rand', name: 'RAND Corp', category: 'think-tanks', enabledDefault: false },
  { id: 'techcrunch', name: 'TechCrunch', category: 'tech', enabledDefault: true },
  { id: 'arstechnica', name: 'Ars Technica', category: 'tech', enabledDefault: true },
  { id: 'wired', name: 'Wired', category: 'tech', enabledDefault: true },
  { id: 'ft', name: 'Financial Times', category: 'finance', enabledDefault: true },
  { id: 'bloomberg', name: 'Bloomberg', category: 'finance', enabledDefault: true },
  { id: 'wsj', name: 'Wall Street Journal', category: 'finance', enabledDefault: true },
];
