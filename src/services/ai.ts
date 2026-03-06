import { httpPost } from './http';
import { simpleHash } from './hash';

export interface AIConfig {
  enabled: boolean;
  baseUrl: string;
  model: string;
}

interface ChatCompletion {
  choices: Array<{
    message: { content: string };
  }>;
  usage?: { total_tokens: number };
}

// ==================== localStorage TTL Cache ====================

interface CachedAI {
  result: string;
  timestamp: number;
}

const SUMMARY_TTL = 24 * 3600_000; // 24h
const TRANSLATE_TTL = 7 * 24 * 3600_000; // 7d
const CLASSIFY_TTL = 7 * 24 * 3600_000; // 7d

function getCachedAI(key: string, ttl: number): string | null {
  try {
    const raw = localStorage.getItem(`ai:${key}`);
    if (!raw) return null;
    const parsed: CachedAI = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > ttl) {
      localStorage.removeItem(`ai:${key}`);
      return null;
    }
    return parsed.result;
  } catch { return null; }
}

function setCachedAI(key: string, result: string) {
  try {
    localStorage.setItem(`ai:${key}`, JSON.stringify({ result, timestamp: Date.now() }));
  } catch { /* storage full */ }
}

// ==================== Rate Limiting ====================

const RATE_LIMIT = 20; // per hour
const RATE_WINDOW = 3600_000;

function checkRateLimit(): boolean {
  try {
    const raw = localStorage.getItem('ai:rate');
    const data: { count: number; resetAt: number } = raw ? JSON.parse(raw) : { count: 0, resetAt: Date.now() + RATE_WINDOW };
    if (Date.now() > data.resetAt) {
      localStorage.setItem('ai:rate', JSON.stringify({ count: 1, resetAt: Date.now() + RATE_WINDOW }));
      return true;
    }
    if (data.count >= RATE_LIMIT) return false;
    data.count++;
    localStorage.setItem('ai:rate', JSON.stringify(data));
    return true;
  } catch { return true; }
}

// ==================== API Calls ====================

async function callLLM(config: AIConfig, systemPrompt: string, userPrompt: string): Promise<{ text: string; tokens?: number }> {
  if (!config.enabled || !config.baseUrl) throw new Error('AI not configured');
  if (!checkRateLimit()) throw new Error('Rate limit exceeded (20/hour). Try again later.');

  // Truncate input to safe limit
  const truncatedPrompt = userPrompt.slice(0, 8000);

  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const body = {
    model: config.model || 'default',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: truncatedPrompt },
    ],
    max_tokens: 500,
    temperature: 0.3,
  };

  const data = await httpPost<ChatCompletion>(url, body, { timeoutMs: 15000 });
  const text = data.choices?.[0]?.message?.content || '';
  return { text, tokens: data.usage?.total_tokens };
}

// ==================== Public API ====================

export interface AISummaryResult {
  summary: string;
  cached: boolean;
  tokens?: number;
}

export async function aiSummarize(config: AIConfig, text: string, mode: 'bullet' | 'short' | 'detailed'): Promise<AISummaryResult> {
  const key = simpleHash(`sum:${text}:${mode}`);
  const cached = getCachedAI(key, SUMMARY_TTL);
  if (cached) return { summary: cached, cached: true };

  const prompts: Record<string, string> = {
    bullet: 'Summarize the following article as 3-5 bullet points. Be concise.',
    short: 'Summarize the following article in 2-3 sentences.',
    detailed: 'Provide a detailed summary of the following article in 4-6 sentences, covering key facts and implications.',
  };

  const result = await callLLM(config, prompts[mode], text);
  setCachedAI(key, result.text);
  return { summary: result.text, cached: false, tokens: result.tokens };
}

export interface AITranslateResult {
  translation: string;
  cached: boolean;
  tokens?: number;
}

export async function aiTranslate(config: AIConfig, text: string, to: string): Promise<AITranslateResult> {
  const key = simpleHash(`tr:${text}:${to}`);
  const cached = getCachedAI(key, TRANSLATE_TTL);
  if (cached) return { translation: cached, cached: true };

  const result = await callLLM(config, `Translate the following text to ${to}. Only output the translation, nothing else.`, text);
  setCachedAI(key, result.text);
  return { translation: result.text, cached: false, tokens: result.tokens };
}

export interface AIClassifyResult {
  category: string;
  confidence: number;
  tags: string[];
  cached: boolean;
  tokens?: number;
}

export async function aiClassify(config: AIConfig, title: string, snippet?: string): Promise<AIClassifyResult> {
  const input = `${title}\n${snippet || ''}`;
  const key = simpleHash(`cl:${input}`);
  const cached = getCachedAI(key, CLASSIFY_TTL);
  if (cached) {
    try { return { ...JSON.parse(cached), cached: true }; } catch {}
  }

  const prompt = `Classify the following headline+snippet. Return ONLY valid JSON: {"category":"conflict|economy|disaster|cyber|politics|technology|other","confidence":0.0-1.0,"tags":["tag1","tag2"]}`;
  const result = await callLLM(config, prompt, input);

  try {
    const parsed = JSON.parse(result.text);
    const classResult = {
      category: parsed.category || 'other',
      confidence: parsed.confidence || 0,
      tags: parsed.tags || [],
      cached: false,
      tokens: result.tokens,
    };
    setCachedAI(key, JSON.stringify(classResult));
    return classResult;
  } catch {
    return { category: 'other', confidence: 0, tags: [], cached: false, tokens: result.tokens };
  }
}
