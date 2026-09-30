// @test-type unit
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';

// [unit] Service worker routing: API bypass, navigation fallback, asset SWR.

interface StubCache {
  store: Map<string, { status: number; body: string }>;
}

function loadWorker(fetchImpl: (input: any) => Promise<any>) {
  const listeners: Record<string, Function> = {};
  const cachesByName = new Map<string, StubCache>();

  const sandbox: any = {
    location: { origin: 'https://shopeek.test' },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    addEventListener: (type: string, fn: Function) => {
      listeners[type] = fn;
    },
    caches: {
      open: async (name: string) => {
        if (!cachesByName.has(name)) {
          cachesByName.set(name, { store: new Map() });
        }
        const cache = cachesByName.get(name)!;
        return {
          addAll: async (urls: string[]) => {
            urls.forEach((url) => cache.store.set(url, { status: 200, body: `cached:${url}` }));
          },
          match: async (req: any) => {
            const key = typeof req === 'string' ? req : req.url;
            const hit = [...cache.store.entries()].find(([k]) => key.endsWith(k));
            return hit ? hit[1] : undefined;
          },
          put: async (req: any, res: any) => {
            cache.store.set(req.url, res);
          },
        };
      },
      keys: async () => [...cachesByName.keys()],
      delete: async (name: string) => cachesByName.delete(name),
      match: async (req: any) => {
        for (const cache of cachesByName.values()) {
          const key = typeof req === 'string' ? req : req.url;
          const hit = [...cache.store.entries()].find(([k]) => key.endsWith(k));
          if (hit) {
            return hit[1];
          }
        }
        return undefined;
      },
    },
    fetch: fetchImpl,
    URL,
  };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const source = readFileSync(resolve(__dirname, '../../public/sw.js'), 'utf8');
  runInNewContext(source, sandbox);

  return { listeners, sandbox };
}

function fetchEvent(url: string, mode: string = 'cors', method: string = 'GET') {
  let respondWithFn: any = null;
  return {
    request: { url, mode, method },
    respondWith: (promise: any) => {
      respondWithFn = promise;
    },
    get responded() {
      return respondWithFn !== null;
    },
    response: () => respondWithFn,
  };
}

describe('[unit] service worker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('precaches the app shell on install', async () => {
    const { listeners } = loadWorker(async () => ({ status: 200 }));
    let waited: Promise<any> = Promise.resolve();
    listeners.install({ waitUntil: (p: Promise<any>) => { waited = p; } });
    await waited;
    // No throw + shell cached: verified via subsequent navigation fallback test.
  });

  it('lets API requests bypass the cache untouched', async () => {
    const fetchMock = vi.fn(async () => ({ status: 200 }));
    const { listeners } = loadWorker(fetchMock);
    const event = fetchEvent('https://shopeek.test/api/v1/analytics/kpi-summary');
    listeners.fetch(event);
    expect(event.responded).toBe(false);
  });

  it('falls back to the cached shell for navigations when offline', async () => {
    const { listeners } = loadWorker(async () => {
      throw new Error('offline');
    });
    let waited: Promise<any> = Promise.resolve();
    listeners.install({ waitUntil: (p: Promise<any>) => { waited = p; } });
    await waited;

    const event = fetchEvent('https://shopeek.test/dashboard', 'navigate');
    listeners.fetch(event);
    expect(event.responded).toBe(true);
    const response = await event.response();
    expect(response.body).toBe('cached:/index.html');
  });

  it('serves hashed assets stale-while-revalidate', async () => {
    const fetchMock = vi.fn(async () => {
      const res = { status: 200, body: 'fresh-asset' };
      return { ...res, clone: () => ({ ...res }) };
    });
    const { listeners } = loadWorker(fetchMock);
    const url = 'https://shopeek.test/assets/index-abc123.js';

    const first = fetchEvent(url);
    listeners.fetch(first);
    expect(first.responded).toBe(true);
    await first.response();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
