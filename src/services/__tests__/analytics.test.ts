import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchKPISummary, fetchRevenueTrend } from '../api';

describe('analytics API', () => {
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

  it('fetchKPISummary appends start/end dates when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        total_revenue: 100,
        revenue_change_percentage: 0,
        revenue_change_absolute: 0,
        order_count: 1,
        order_count_change_percentage: 0,
        average_order_value: 100,
        aov_change_percentage: 0,
        total_customers: 1,
        customer_count_change_percentage: 0,
      })
    );
    window.fetch = fetchMock;

    const res = await fetchKPISummary(30, '2026-08-01', '2026-08-31');
    expect(res.total_revenue).toBe(100);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/analytics/kpi-summary?days=30&start_date=2026-08-01&end_date=2026-08-31',
      expect.anything()
    );
  });

  it('fetchKPISummary throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchKPISummary(7)).rejects.toThrow('خطا در دریافت خلاصه آمار و شاخص‌ها');
  });

  it('fetchRevenueTrend appends start/end dates when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson([{ date: '2026-08-01', revenue: 10, orders: 1 }]));
    window.fetch = fetchMock;

    const res = await fetchRevenueTrend(30, '2026-08-01', '2026-08-31');
    expect(res[0].revenue).toBe(10);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/analytics/revenue-trend?days=30&start_date=2026-08-01&end_date=2026-08-31',
      expect.anything()
    );
  });

  it('fetchRevenueTrend throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchRevenueTrend(7)).rejects.toThrow('خطا در دریافت نمودار روند فروش');
  });
});