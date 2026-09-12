import type { PublicPlan } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const fetchPublicPlans = async (): Promise<PublicPlan[]> => {
  const res = await authFetch(`${API_BASE}/plans/public`);
  if (!res.ok) throw new Error('خطا در دریافت طرح‌ها');
  return res.json();
};
