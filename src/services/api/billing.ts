import type { BillingOverview } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const fetchBillingOverview = async (): Promise<BillingOverview> => {
  const res = await authFetch(`${API_BASE}/settings/billing`);
  if (!res.ok) throw new Error('خطا در دریافت اطلاعات اشتراک و اعتبار');
  return res.json();
};
