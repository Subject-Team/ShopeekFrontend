import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBillingOverview } from '../api';

describe('billing API', () => {
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

  it('fetchBillingOverview returns the billing overview', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({
        plan: { key: 'pro', name_fa: 'حرفه‌ای', status: 'active', is_exempt: false, remaining_days: 20, next_payment_due: null, current_period_started_at: null },
        wallet: { monthly_balance: 100, purchased_balance: 0, pending_session_charge: 0, pending_account_charge: 0 },
        usage: [],
        ledger: [],
        stats: { total_granted: 100, total_spent: 0, spend_by_feature: {} },
      })
    );
    const res = await fetchBillingOverview();
    expect(res.plan.key).toBe('pro');
    expect(res.wallet?.monthly_balance).toBe(100);
  });

  it('fetchBillingOverview throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchBillingOverview()).rejects.toThrow('خطا در دریافت اطلاعات اشتراک و اعتبار');
  });
});