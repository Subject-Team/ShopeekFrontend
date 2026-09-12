import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSchedulePrefs, updateSchedulePrefs } from '../api';

describe('schedule API', () => {
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
  const errNonJson = (status: number) => ({
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  });

  it('fetchSchedulePrefs returns the prefs', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({
        predefined_slots: ['09:00'],
        can_customize: true,
        max_slots: 4,
        advisory_slots: ['09:00'],
        forecast_slots: null,
      })
    );
    const res = await fetchSchedulePrefs();
    expect(res.can_customize).toBe(true);
    expect(res.advisory_slots).toEqual(['09:00']);
  });

  it('fetchSchedulePrefs throws the backend detail with the status attached', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(403, { detail: 'محدودیت طرح' }));
    const err = (await fetchSchedulePrefs().catch((e: unknown) => e)) as Error & { status?: number };
    expect(err.message).toBe('محدودیت طرح');
    expect(err.status).toBe(403);
  });

  it('fetchSchedulePrefs falls back to the default message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    const err = (await fetchSchedulePrefs().catch((e: unknown) => e)) as Error & { status?: number };
    expect(err.message).toBe('خطا در دریافت زمان‌بندی هوشمند');
    expect(err.status).toBe(500);
  });

  it('updateSchedulePrefs PUTs the payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        predefined_slots: ['09:00'],
        can_customize: true,
        max_slots: 4,
        advisory_slots: ['10:00'],
        forecast_slots: null,
      })
    );
    window.fetch = fetchMock;

    const res = await updateSchedulePrefs({ advisory_slots: ['10:00'] });
    expect(res.advisory_slots).toEqual(['10:00']);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/settings/schedule',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ advisory_slots: ['10:00'] }),
      })
    );
  });

  it('updateSchedulePrefs throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'اسلات نامعتبر' }));
    await expect(updateSchedulePrefs({ forecast_slots: ['25:00'] })).rejects.toThrow('اسلات نامعتبر');
  });

  it('updateSchedulePrefs falls back to the default message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(updateSchedulePrefs({})).rejects.toThrow('خطا در ذخیره زمان‌بندی هوشمند');
  });
});