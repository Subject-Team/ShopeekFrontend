import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loginApi,
  fetchMeApi,
  sendOtpApi,
  verifyOtpApi,
  registerWithPhoneApi,
  changePassword,
} from '../api';

describe('auth API', () => {
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

  it('loginApi returns the auth token response and stores the web session id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        access_token: 'tok-1',
        token_type: 'bearer',
        user: { id: 'u-1', email: 'a@b.ir' },
        web_session_id: 'sess-1',
      })
    );
    window.fetch = fetchMock;

    const res = await loginApi({ phone: '09123456789', password: 'pw' });
    expect(res.access_token).toBe('tok-1');
    expect(localStorage.getItem('shopeek_session_id')).toBe('sess-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '09123456789', password: 'pw' }),
      })
    );
  });

  it('loginApi does not store a session id when the response omits it', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({ access_token: 'tok-1', token_type: 'bearer', user: { id: 'u-1', email: 'a@b.ir' } })
    );
    await loginApi({ phone: '09123456789', password: 'pw' });
    expect(localStorage.getItem('shopeek_session_id')).toBeNull();
  });

  it('loginApi throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(401, { detail: 'Invalid credentials' }));
    await expect(loginApi({ phone: '09123456789', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('loginApi falls back to the default message when the error body has no detail', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(loginApi({ phone: '09123456789', password: 'wrong' })).rejects.toThrow(
      'شناسه ورود یا کلمه عبور وارد شده نادرست است.'
    );
  });

  it('loginApi falls back to the generic message when the error body is not JSON', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(loginApi({ phone: '09123456789', password: 'wrong' })).rejects.toThrow(
      'خطا در ورود به حساب کاربری'
    );
  });

  it('fetchMeApi returns the current user', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson({ id: 'u-1', email: 'a@b.ir' }));
    const user = await fetchMeApi();
    expect(user.email).toBe('a@b.ir');
  });

  it('fetchMeApi throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchMeApi()).rejects.toThrow('خطا در دریافت اطلاعات کاربر');
  });

  it('sendOtpApi returns the send response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ sent: true, registered: false }));
    window.fetch = fetchMock;

    const res = await sendOtpApi({ phone: '09123456789' });
    expect(res.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/otp/send',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '09123456789' }),
      })
    );
  });

  it('sendOtpApi throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(429, { detail: 'کد تأیید قبلاً ارسال شده' }));
    await expect(sendOtpApi({ phone: '09123456789' })).rejects.toThrow('کد تأیید قبلاً ارسال شده');
  });

  it('sendOtpApi falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(sendOtpApi({ phone: '09123456789' })).rejects.toThrow(
      'خطا در ارسال کد تأیید پیامکی'
    );
  });

  it('verifyOtpApi returns the verification response and stores the web session id', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({
        phone: '09123456789',
        verified: true,
        message: 'ok',
        registered: true,
        web_session_id: 'sess-2',
      })
    );
    const res = await verifyOtpApi({ phone: '09123456789', code: '12345' });
    expect(res.verified).toBe(true);
    expect(localStorage.getItem('shopeek_session_id')).toBe('sess-2');
  });

  it('verifyOtpApi throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'کد وارد شده نادرست است' }));
    await expect(verifyOtpApi({ phone: '09123456789', code: '00000' })).rejects.toThrow(
      'کد وارد شده نادرست است'
    );
  });

  it('verifyOtpApi falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(verifyOtpApi({ phone: '09123456789', code: '00000' })).rejects.toThrow(
      'خطا در تأیید کد پیامکی'
    );
  });

  it('registerWithPhoneApi creates the account and stores the web session id', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({
        access_token: 'tok-2',
        token_type: 'bearer',
        user: { id: 'u-2', email: 'new@b.ir' },
        web_session_id: 'sess-3',
      })
    );
    const res = await registerWithPhoneApi({
      phone: '09123456789',
      code: '12345',
      email: 'new@b.ir',
      password: 'pw',
      full_name: 'کاربر جدید',
    });
    expect(res.access_token).toBe('tok-2');
    expect(localStorage.getItem('shopeek_session_id')).toBe('sess-3');
  });

  it('registerWithPhoneApi throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'شماره تلفن تکراری است' }));
    await expect(
      registerWithPhoneApi({
        phone: '09123456789',
        code: '12345',
        email: 'new@b.ir',
        password: 'pw',
        full_name: 'کاربر جدید',
      })
    ).rejects.toThrow('شماره تلفن تکراری است');
  });

  it('registerWithPhoneApi falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(
      registerWithPhoneApi({
        phone: '09123456789',
        code: '12345',
        email: 'new@b.ir',
        password: 'pw',
        full_name: 'کاربر جدید',
      })
    ).rejects.toThrow('خطا در ایجاد حساب کاربری');
  });

  it('changePassword stores rotated tokens and dispatches the token-refreshed event', async () => {
    const listener = vi.fn();
    window.addEventListener('shopeek_token_refreshed', listener);
    window.fetch = vi.fn().mockResolvedValue(
      okJson({ message: 'ok', access_token: 'new-tok', refresh_token: 'new-refresh' })
    );

    const res = await changePassword({
      current_password: 'old',
      new_password: 'new',
      confirm_new_password: 'new',
    });
    expect(res.message).toBe('ok');
    expect(localStorage.getItem('shopeek_token')).toBe('new-tok');
    expect(localStorage.getItem('shopeek_refresh_token')).toBe('new-refresh');
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('shopeek_token_refreshed', listener);
  });

  it('changePassword does not dispatch the event when no tokens are returned', async () => {
    const listener = vi.fn();
    window.addEventListener('shopeek_token_refreshed', listener);
    window.fetch = vi.fn().mockResolvedValue(okJson({ message: 'ok' }));

    await changePassword({
      current_password: 'old',
      new_password: 'new',
      confirm_new_password: 'new',
    });
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('shopeek_token_refreshed', listener);
  });

  it('changePassword throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'رمز عبور فعلی نادرست است' }));
    await expect(
      changePassword({ current_password: 'x', new_password: 'y', confirm_new_password: 'y' })
    ).rejects.toThrow('رمز عبور فعلی نادرست است');
  });

  it('changePassword falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(
      changePassword({ current_password: 'x', new_password: 'y', confirm_new_password: 'y' })
    ).rejects.toThrow('خطا در تغییر کلمه عبور');
  });
});