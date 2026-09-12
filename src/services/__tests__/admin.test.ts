import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUserDetail,
  fetchAdminUserTransactions,
  updateAdminUser,
  deleteAdminUser,
  restoreAdminUser,
  fetchAdminErrors,
  fetchAdminPlans,
  fetchAdminUserBilling,
  recordAdminPayment,
  grantAdminCredits,
  adjustAdminWallet,
} from '../api';

describe('admin API', () => {
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
  const errNonJson = (status: number) => ({
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  });

  it('fetchAdminStats returns the stats', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson({ total_users: 10, total_revenue: 100 }));
    const stats = await fetchAdminStats();
    expect(stats.total_users).toBe(10);
  });

  it('fetchAdminStats throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminStats()).rejects.toThrow('خطا در دریافت آمار کلی');
  });

  it('fetchAdminUsers builds query params and returns the page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 2, page_size: 50 }));
    window.fetch = fetchMock;

    const res = await fetchAdminUsers('ali', 2, 50);
    expect(res.page).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users?search=ali&page=2&page_size=50',
      expect.anything()
    );
  });

  it('fetchAdminUsers uses defaults when no args are given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, page_size: 20 }));
    window.fetch = fetchMock;

    await fetchAdminUsers();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/admin/users?page=1&page_size=20', expect.anything());
  });

  it('fetchAdminUsers throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminUsers()).rejects.toThrow('خطا در دریافت لیست کاربران');
  });

  it('fetchAdminUserDetail returns the user', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson({ id: 'u-1', email: 'a@b.ir' }));
    const user = await fetchAdminUserDetail('u-1');
    expect(user.id).toBe('u-1');
  });

  it('fetchAdminUserDetail throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(404, {}));
    await expect(fetchAdminUserDetail('u-1')).rejects.toThrow('خطا در دریافت جزئیات کاربر');
  });

  it('fetchAdminUserTransactions builds limit/offset params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ items: [], total: 0 }));
    window.fetch = fetchMock;

    const res = await fetchAdminUserTransactions('u-1', 10, 5);
    expect(res.total).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1/transactions?limit=10&offset=5',
      expect.anything()
    );
  });

  it('fetchAdminUserTransactions throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminUserTransactions('u-1')).rejects.toThrow('خطا در دریافت تراکنش‌های کاربر');
  });

  it('updateAdminUser PATCHes the payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 'u-1', email: 'a@b.ir' }));
    window.fetch = fetchMock;

    const user = await updateAdminUser('u-1', { role: 'Admin' });
    expect(user.id).toBe('u-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ role: 'Admin' }),
      })
    );
  });

  it('updateAdminUser throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'cannot_modify_self' }));
    await expect(updateAdminUser('u-1', { role: 'User' })).rejects.toThrow('cannot_modify_self');
  });

  it('updateAdminUser falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(updateAdminUser('u-1', { role: 'User' })).rejects.toThrow('خطا در بروزرسانی کاربر');
  });

  it('deleteAdminUser DELETEs the user and returns ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ ok: true }));
    window.fetch = fetchMock;

    const res = await deleteAdminUser('u-1');
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('deleteAdminUser throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(502, { detail: 'gotrue down' }));
    await expect(deleteAdminUser('u-1')).rejects.toThrow('gotrue down');
  });

  it('deleteAdminUser falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(deleteAdminUser('u-1')).rejects.toThrow('خطا در حذف کاربر');
  });

  it('restoreAdminUser POSTs the restore request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 'u-1', email: 'a@b.ir' }));
    window.fetch = fetchMock;

    const user = await restoreAdminUser('u-1');
    expect(user.id).toBe('u-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1/restore',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('restoreAdminUser throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'not deleted' }));
    await expect(restoreAdminUser('u-1')).rejects.toThrow('not deleted');
  });

  it('restoreAdminUser falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(restoreAdminUser('u-1')).rejects.toThrow('خطا در بازیابی کاربر');
  });

  it('fetchAdminErrors builds severity/source params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, page_size: 20 }));
    window.fetch = fetchMock;

    const res = await fetchAdminErrors(1, 20, 'error', 'ingestion');
    expect(res.total).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/errors?page=1&page_size=20&severity=error&source=ingestion',
      expect.anything()
    );
  });

  it('fetchAdminErrors omits optional params when absent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, page_size: 20 }));
    window.fetch = fetchMock;

    await fetchAdminErrors();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/admin/errors?page=1&page_size=20', expect.anything());
  });

  it('fetchAdminErrors throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminErrors()).rejects.toThrow('خطا در دریافت لیست خطاها');
  });

  it('fetchAdminPlans returns the plan list', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson([{ key: 'pro', name_fa: 'حرفه‌ای', is_active: true }]));
    const plans = await fetchAdminPlans();
    expect(plans[0].key).toBe('pro');
  });

  it('fetchAdminPlans throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminPlans()).rejects.toThrow('خطا در دریافت طرح‌ها');
  });

  it('fetchAdminUserBilling returns billing data', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson({ billing: {}, payments: [] }));
    const billing = await fetchAdminUserBilling('u-1');
    expect(billing.payments).toEqual([]);
  });

  it('fetchAdminUserBilling throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchAdminUserBilling('u-1')).rejects.toThrow('خطا در دریافت اطلاعات مالی کاربر');
  });

  it('recordAdminPayment POSTs the payment payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ id: 1 }));
    window.fetch = fetchMock;

    const res = await recordAdminPayment('u-1', { plan_key: 'pro', duration_months: 1, amount_toman: 100 });
    expect(res).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1/payments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ plan_key: 'pro', duration_months: 1, amount_toman: 100 }),
      })
    );
  });

  it('recordAdminPayment throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'invalid_plan_key' }));
    await expect(
      recordAdminPayment('u-1', { plan_key: 'nope', duration_months: 1, amount_toman: 100 })
    ).rejects.toThrow('invalid_plan_key');
  });

  it('recordAdminPayment falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(
      recordAdminPayment('u-1', { plan_key: 'pro', duration_months: 1, amount_toman: 100 })
    ).rejects.toThrow('خطا در ثبت پرداخت');
  });

  it('grantAdminCredits POSTs the grant payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ amount: 100, monthly_balance: 100, purchased_balance: 0 }));
    window.fetch = fetchMock;

    const res = await grantAdminCredits('u-1', { amount: 100 });
    expect(res.amount).toBe(100);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1/credits',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: 100 }),
      })
    );
  });

  it('grantAdminCredits throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'amount too large' }));
    await expect(grantAdminCredits('u-1', { amount: 999999 })).rejects.toThrow('amount too large');
  });

  it('grantAdminCredits falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(grantAdminCredits('u-1', { amount: 100 })).rejects.toThrow('خطا در اعطای اعتبار');
  });

  it('adjustAdminWallet POSTs the wallet payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ monthly_balance: 0, purchased_balance: -50 }));
    window.fetch = fetchMock;

    const res = await adjustAdminWallet('u-1', { monthly_balance: 0, purchased_balance: -50 });
    expect(res.purchased_balance).toBe(-50);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/users/u-1/wallet',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ monthly_balance: 0, purchased_balance: -50 }),
      })
    );
  });

  it('adjustAdminWallet throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'debt too high' }));
    await expect(adjustAdminWallet('u-1', { monthly_balance: 0, purchased_balance: -999 })).rejects.toThrow(
      'debt too high'
    );
  });

  it('adjustAdminWallet falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(adjustAdminWallet('u-1', { monthly_balance: 0, purchased_balance: 0 })).rejects.toThrow(
      'خطا در تنظیم کیف پول'
    );
  });
});