import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPublicPlans } from '../api';

describe('plans API', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  const okJson = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
  const errJson = (status: number, body: unknown) => ({
    ok: false,
    status,
    json: async () => body,
  });

  it('fetchPublicPlans returns the public catalog', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson([
        {
          key: 'pro',
          name_fa: 'حرفه‌ای',
          sort_order: 1,
          monthly_credit_grant: 500,
          prices: [{ duration_months: 1, price_toman: 100000 }],
          features: [],
        },
      ])
    );
    const plans = await fetchPublicPlans();
    expect(plans[0].key).toBe('pro');
    expect(plans[0].prices[0].price_toman).toBe(100000);
  });

  it('fetchPublicPlans throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchPublicPlans()).rejects.toThrow('خطا در دریافت طرح‌ها');
  });
});