import type { CreateFeedbackPayload, UserFeedback } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const submitFeedbackApi = async (payload: CreateFeedbackPayload): Promise<UserFeedback> => {
  const res = await authFetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ارسال بازخورد' }));
    throw new Error(err.detail || 'خطا در ارسال بازخورد');
  }
  return res.json();
};

export const fetchMyFeedbackApi = async (): Promise<UserFeedback[]> => {
  const res = await authFetch(`${API_BASE}/feedback/my`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در دریافت بازخوردها' }));
    throw new Error(err.detail || 'خطا در دریافت بازخوردها');
  }
  return res.json();
};
