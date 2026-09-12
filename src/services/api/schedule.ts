import type { SchedulePrefs, SchedulePrefsUpdatePayload } from '../../types';
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

export const fetchSchedulePrefs = async (): Promise<SchedulePrefs> => {
  const res = await authFetch(`${API_BASE}/settings/schedule`);
  if (!res.ok) throw await readDetail(res, 'خطا در دریافت زمان‌بندی هوشمند');
  return res.json();
};

export const updateSchedulePrefs = async (payload: SchedulePrefsUpdatePayload): Promise<SchedulePrefs> => {
  const res = await authFetch(`${API_BASE}/settings/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await readDetail(res, 'خطا در ذخیره زمان‌بندی هوشمند');
  return res.json();
};