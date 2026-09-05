import type { KPISummary, RevenuePoint } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

// --- ANALYTICS & DASHBOARD API METHODS ---

export const fetchKPISummary = async (
  days: number = 7,
  startDate?: string,
  endDate?: string
): Promise<KPISummary> => {
  let url = `${API_BASE}/analytics/kpi-summary?days=${days}`;
  if (startDate && endDate) {
    url += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  const res = await authFetch(url);
  if (!res.ok) throw new Error('خطا در دریافت خلاصه آمار و شاخص‌ها');
  return res.json();
};

export const fetchRevenueTrend = async (
  days: number = 7,
  startDate?: string,
  endDate?: string
): Promise<RevenuePoint[]> => {
  let url = `${API_BASE}/analytics/revenue-trend?days=${days}`;
  if (startDate && endDate) {
    url += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  const res = await authFetch(url);
  if (!res.ok) throw new Error('خطا در دریافت نمودار روند فروش');
  return res.json();
};
