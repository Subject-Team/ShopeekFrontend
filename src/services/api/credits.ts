import type { CreditAlertPrefs, CreditAlertPrefsUpdatePayload } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

const readDetail = async (res: Response, fallback: string): Promise<Error> => {
  let detail = fallback;
  try {
    const body = await res.json();
    if (body && typeof body.detail === 'string') detail = body.detail;
  } catch {
    // non-JSON error body — keep the fallback message
  }
  const err = new Error(detail) as Error & { status?: number };
  err.status = res.status;
  return err;
};

export const fetchCreditAlertPrefs = async (): Promise<CreditAlertPrefs> => {
  const res = await authFetch(`${API_BASE}/settings/credit-alerts`);
  if (!res.ok) throw await readDetail(res, 'خطا در دریافت تنظیمات هشدار اعتبار');
  return res.json();
};

export const updateCreditAlertPrefs = async (
  payload: CreditAlertPrefsUpdatePayload
): Promise<CreditAlertPrefs> => {
  const res = await authFetch(`${API_BASE}/settings/credit-alerts`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await readDetail(res, 'خطا در ذخیره تنظیمات هشدار اعتبار');
  return res.json();
};
