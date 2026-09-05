import type {
  AuthTokenResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  OtpSendPayload,
  OtpSendResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  RegisterWithPhonePayload,
  User,
} from '../../types';
import { authFetch, setWebSessionId } from './client';

const API_BASE = '/api/v1';

// --- AUTH API METHODS ---

export const loginApi = async (payload: LoginPayload): Promise<AuthTokenResponse> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ورود به حساب کاربری' }));
    throw new Error(err.detail || 'شناسه ورود یا کلمه عبور وارد شده نادرست است.');
  }
  const data = (await res.json()) as AuthTokenResponse;
  if (data.web_session_id) setWebSessionId(data.web_session_id);
  return data;
};

export const fetchMeApi = async (): Promise<User> => {
  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('خطا در دریافت اطلاعات کاربر');
  return res.json();
};

// --- OTP (SMS VERIFICATION) API METHODS ---

export const sendOtpApi = async (payload: OtpSendPayload): Promise<OtpSendResponse> => {
  const res = await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      detail: 'خطا در ارسال کد تأیید پیامکی',
    }));
    throw new Error(err.detail || 'خطا در ارسال کد تأیید پیامکی');
  }
  return res.json();
};

export const verifyOtpApi = async (payload: OtpVerifyPayload): Promise<OtpVerifyResponse> => {
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      detail: 'خطا در تأیید کد پیامکی',
    }));
    throw new Error(err.detail || 'خطا در تأیید کد پیامکی');
  }
  const data: OtpVerifyResponse = await res.json();
  if (data.web_session_id) setWebSessionId(data.web_session_id);
  return data;
};

export const registerWithPhoneApi = async (
  payload: RegisterWithPhonePayload
): Promise<AuthTokenResponse> => {
  const res = await fetch(`${API_BASE}/auth/otp/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      detail: 'خطا در ایجاد حساب کاربری',
    }));
    throw new Error(err.detail || 'خطا در ایجاد حساب کاربری');
  }
  const data = (await res.json()) as AuthTokenResponse;
  if (data.web_session_id) setWebSessionId(data.web_session_id);
  return data;
};

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const res = await authFetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در تغییر کلمه عبور' }));
    throw new Error(err.detail || 'خطا در تغییر کلمه عبور');
  }
  const data = (await res.json()) as ChangePasswordResponse;
  // GoTrue rotates the user's token on a successful password change. Swap the
  // stored session so the user stays signed in without a forced re-login.
  if (data.access_token) localStorage.setItem('shopeek_token', data.access_token);
  if (data.refresh_token) localStorage.setItem('shopeek_refresh_token', data.refresh_token);
  if (data.access_token || data.refresh_token) {
    window.dispatchEvent(new Event('shopeek_token_refreshed'));
  }
  return data;
};
