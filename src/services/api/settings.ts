import type {
  SettingsData,
  BusinessProfile,
  BusinessProfileUpdatePayload,
  DeleteAccountResponse,
  DataImportResult,
  User,
  UserProfileUpdatePayload,
  PhoneOtpSendPayload,
  PhoneOtpSendResponse,
  PhoneOtpVerifyPayload,
} from '../../types';
import { authFetch, getWebSessionId } from './client';

const API_BASE = '/api/v1';

// --- SETTINGS & SESSION MANAGEMENT API METHODS ---

export const fetchSettings = async (): Promise<SettingsData> => {
  const res = await authFetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('خطا در دریافت تنظیمات');
  return res.json();
};

export const deleteAccountApi = async (): Promise<DeleteAccountResponse> => {
  const res = await authFetch(`${API_BASE}/settings/delete-account`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در حذف حساب کاربری' }));
    throw new Error(err.detail || 'خطا در حذف حساب کاربری');
  }
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

export const fetchBusinessProfile = async (): Promise<BusinessProfile> => {
  const res = await authFetch(`${API_BASE}/settings/business-profile`);
  if (!res.ok) throw new Error('خطا در دریافت اطلاعات تکمیلی کسب‌وکار');
  return res.json();
};

export const updateBusinessProfile = async (
  payload: BusinessProfileUpdatePayload
): Promise<BusinessProfile> => {
  const res = await authFetch(`${API_BASE}/settings/business-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ذخیره اطلاعات تکمیلی' }));
    throw new Error(err.detail || 'خطا در ذخیره اطلاعات تکمیلی');
  }
  return res.json();
};

export const fetchSampleDataApi = async (): Promise<Record<string, unknown>> => {
  const res = await authFetch(`${API_BASE}/settings/data-transfer/example`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در دریافت ساختار نمونه داده' }));
    throw new Error(err.detail || 'خطا در دریافت ساختار نمونه داده');
  }
  return res.json();
};

export const exportUserDataApi = async (): Promise<Blob> => {
  const res = await authFetch(`${API_BASE}/settings/data-transfer/export`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در دریافت خروجی داده‌ها' }));
    throw new Error(err.detail || 'خطا در دریافت خروجی داده‌ها');
  }
  return res.blob();
};

export const importUserDataApi = async (file: File): Promise<DataImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`${API_BASE}/settings/data-transfer/import`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در بارگذاری و بازیابی اطلاعات' }));
    throw new Error(err.detail || 'خطا در بارگذاری و بازیابی اطلاعات');
  }
  return res.json();
};

export const updateUserProfile = async (
  payload: UserProfileUpdatePayload
): Promise<User> => {
  const res = await authFetch(`${API_BASE}/settings/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در به‌روزرسانی مشخصات کاربری' }));
    throw new Error(err.detail || 'خطا در به‌روزرسانی مشخصات کاربری');
  }
  return res.json();
};

export const sendPhoneOtpApi = async (
  payload: PhoneOtpSendPayload
): Promise<PhoneOtpSendResponse> => {
  const res = await authFetch(`${API_BASE}/settings/phone/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ارسال کد تأیید پیامکی' }));
    throw new Error(err.detail || 'خطا در ارسال کد تأیید پیامکی');
  }
  return res.json();
};

export const verifyPhoneOtpApi = async (
  payload: PhoneOtpVerifyPayload
): Promise<User> => {
  const res = await authFetch(`${API_BASE}/settings/phone/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در تأیید کد پیامکی' }));
    throw new Error(err.detail || 'خطا در تأیید کد پیامکی');
  }
  return res.json();
};


