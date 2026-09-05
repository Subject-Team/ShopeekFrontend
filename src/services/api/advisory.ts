import type { AIAdvisory, AdvisoryTriggerResult } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const fetchLatestAdvisory = async (): Promise<AIAdvisory | null> => {
  const res = await authFetch(`${API_BASE}/advisory/latest`);
  if (!res.ok) throw new Error('خطا در دریافت پیشنهادات هوشمند');
  return res.json();
};

export const fetchAdvisoryHistory = async (): Promise<AIAdvisory[]> => {
  const res = await authFetch(`${API_BASE}/advisory/history`);
  if (!res.ok) throw new Error('خطا در دریافت تاریخچه پیشنهادات');
  return res.json();
};

export const triggerManualAdvisory = async (): Promise<AdvisoryTriggerResult> => {
  const res = await authFetch(`${API_BASE}/advisory/generate`, { method: 'POST' });
  if (!res.ok) throw new Error('سرویس مشاوره هوشمند در دسترس نیست.');
  return res.json();
};
