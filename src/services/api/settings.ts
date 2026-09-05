import type { SettingsData } from '../../types';
import { authFetch, getWebSessionId } from './client';

const API_BASE = '/api/v1';

// --- SETTINGS & SESSION MANAGEMENT API METHODS ---

export const fetchSettings = async (): Promise<SettingsData> => {
  const res = await authFetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('خطا در دریافت تنظیمات');
  return res.json();
};

export const revokeWebSession = async (sessionId: string): Promise<void> => {
  const headers = new Headers();
  const current = getWebSessionId();
  if (current) headers.set('X-Web-Session-ID', current);
  const res = await authFetch(`${API_BASE}/settings/web-sessions/${sessionId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'خطا در خروج از دستگاه مورد نظر' }));
    throw new Error(err.detail || 'خطا در خروج از دستگاه مورد نظر');
  }
};

export const revokeAllOtherSessions = async (): Promise<void> => {
  const current = getWebSessionId();
  const res = await authFetch(`${API_BASE}/settings/web-sessions/revoke-others`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_session_id: current }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'خطا در خروج از سایر دستگاه‌ها' }));
    throw new Error(err.detail || 'خطا در خروج از سایر دستگاه‌ها');
  }
};

export const unlinkTelegramSession = async (sessionId: string): Promise<void> => {
  const res = await authFetch(`${API_BASE}/settings/telegram-sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'خطا در قطع اتصال ربات تلگرام' }));
    throw new Error(err.detail || 'خطا در قطع اتصال ربات تلگرام');
  }
};
