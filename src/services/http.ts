/**
 * Centralized HTTP fetch with timeout, AbortController support, and error normalization.
 */

const DEFAULT_TIMEOUT = 8000;

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

interface FetchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export async function httpGet<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT, headers } = opts;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // Combine external signal with our timeout signal
  const combinedSignal = signal
    ? combineSignals(signal, controller.signal)
    : controller.signal;

  try {
    const res = await fetch(url, {
      signal: combinedSignal,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status}: ${res.statusText}`, res.status);
    }

    return await res.json() as T;
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (err instanceof HttpError) throw err;
    throw new HttpError(err.message || 'Network error', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export async function httpPost<T>(url: string, body: unknown, opts: FetchOptions = {}): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT, headers } = opts;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const combinedSignal = signal
    ? combineSignals(signal, controller.signal)
    : controller.signal;

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: combinedSignal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status}: ${res.statusText}`, res.status);
    }

    return await res.json() as T;
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (err instanceof HttpError) throw err;
    throw new HttpError(err.message || 'Network error', 0);
  } finally {
    clearTimeout(timeout);
  }
}

function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort);
  b.addEventListener('abort', onAbort);
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}

/** Simple error tracker - logs and optionally reports */
const errorCounts: Record<string, number> = {};

export function trackError(domain: string, error: unknown) {
  const key = domain;
  errorCounts[key] = (errorCounts[key] || 0) + 1;
  console.error(`[${domain}] Error #${errorCounts[key]}:`, error);
}

export function getErrorCount(domain: string): number {
  return errorCounts[domain] || 0;
}
