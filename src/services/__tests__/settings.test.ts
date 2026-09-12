import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchSettings,
  deleteAccountApi,
  revokeWebSession,
  revokeAllOtherSessions,
  unlinkTelegramSession,
  fetchBusinessProfile,
  updateBusinessProfile,
} from '../api';

describe('settings API', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  const okJson = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
  const ok204 = () => ({ ok: true, status: 204 });
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

  it('fetchSettings returns settings data', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({ profile: { id: 'u-1' }, web_sessions: [], telegram_sessions: [], business_profile: null })
    );
    const res = await fetchSettings();
    expect(res.profile.id).toBe('u-1');
    expect(res.web_sessions).toEqual([]);
  });

  it('fetchSettings throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchSettings()).rejects.toThrow('خطا در دریافت تنظیمات');
  });

  it('deleteAccountApi POSTs the delete request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ message: 'ok', deleted_at: '2026-09-12', purge_at: '2026-10-12' })
    );
    window.fetch = fetchMock;

    const res = await deleteAccountApi();
    expect(res.message).toBe('ok');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/settings/delete-account',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('deleteAccountApi throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'در حال پردازش' }));
    await expect(deleteAccountApi()).rejects.toThrow('در حال پردازش');
  });

  it('deleteAccountApi falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(deleteAccountApi()).rejects.toThrow('خطا در حذف حساب کاربری');
  });

  it('revokeWebSession DELETEs with the current session header', async () => {
    localStorage.setItem('shopeek_session_id', 'current-sess');
    const fetchMock = vi.fn().mockResolvedValue(ok204());
    window.fetch = fetchMock;

    await revokeWebSession('target-sess');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/settings/web-sessions/target-sess');
    expect((init as RequestInit).method).toBe('DELETE');
    expect(((init as RequestInit).headers as Headers).get('X-Web-Session-ID')).toBe('current-sess');
  });

  it('revokeWebSession omits the header when no current session id is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok204());
    window.fetch = fetchMock;

    await revokeWebSession('target-sess');
    const [, init] = fetchMock.mock.calls[0];
    expect(((init as RequestInit).headers as Headers).get('X-Web-Session-ID')).toBeNull();
  });

  it('revokeWebSession throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(403, { detail: 'دسترسی ندارید' }));
    await expect(revokeWebSession('target-sess')).rejects.toThrow('دسترسی ندارید');
  });

  it('revokeWebSession falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(revokeWebSession('target-sess')).rejects.toThrow('خطا در خروج از دستگاه مورد نظر');
  });

  it('revokeAllOtherSessions POSTs the current session id', async () => {
    localStorage.setItem('shopeek_session_id', 'current-sess');
    const fetchMock = vi.fn().mockResolvedValue(ok204());
    window.fetch = fetchMock;

    await revokeAllOtherSessions();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/settings/web-sessions/revoke-others',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ current_session_id: 'current-sess' }),
      })
    );
  });

  it('revokeAllOtherSessions throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, { detail: 'خطای سرور' }));
    await expect(revokeAllOtherSessions()).rejects.toThrow('خطای سرور');
  });

  it('revokeAllOtherSessions falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(revokeAllOtherSessions()).rejects.toThrow('خطا در خروج از سایر دستگاه‌ها');
  });

  it('unlinkTelegramSession DELETEs the telegram session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok204());
    window.fetch = fetchMock;

    await unlinkTelegramSession('tg-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/settings/telegram-sessions/tg-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('unlinkTelegramSession throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, { detail: 'ربات در دسترس نیست' }));
    await expect(unlinkTelegramSession('tg-1')).rejects.toThrow('ربات در دسترس نیست');
  });

  it('unlinkTelegramSession falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(unlinkTelegramSession('tg-1')).rejects.toThrow('خطا در قطع اتصال ربات تلگرام');
  });

  it('fetchBusinessProfile returns the profile', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({ category: 'فروشگاه', category_other: null, monthly_orders: 10, monthly_revenue: 100, business_type: 'goods', is_b2b: false, links: [] })
    );
    const res = await fetchBusinessProfile();
    expect(res.category).toBe('فروشگاه');
  });

  it('fetchBusinessProfile throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchBusinessProfile()).rejects.toThrow('خطا در دریافت اطلاعات تکمیلی کسب‌وکار');
  });

  it('updateBusinessProfile PUTs the payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ category: 'فروشگاه', category_other: null, monthly_orders: 10, monthly_revenue: 100, business_type: 'goods', is_b2b: false, links: [] })
    );
    window.fetch = fetchMock;

    const payload = {
      category: 'فروشگاه',
      category_other: null,
      monthly_orders: 10,
      monthly_revenue: 100,
      business_type: 'goods' as const,
      is_b2b: false,
      links: [],
    };
    const res = await updateBusinessProfile(payload);
    expect(res.category).toBe('فروشگاه');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/settings/business-profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    );
  });

  it('updateBusinessProfile throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'داده نامعتبر' }));
    await expect(
      updateBusinessProfile({
        category: null,
        category_other: null,
        monthly_orders: null,
        monthly_revenue: null,
        business_type: null,
        is_b2b: false,
        links: [],
      })
    ).rejects.toThrow('داده نامعتبر');
  });

  it('updateBusinessProfile falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(
      updateBusinessProfile({
        category: null,
        category_other: null,
        monthly_orders: null,
        monthly_revenue: null,
        business_type: null,
        is_b2b: false,
        links: [],
      })
    ).rejects.toThrow('خطا در ذخیره اطلاعات تکمیلی');
  });
});