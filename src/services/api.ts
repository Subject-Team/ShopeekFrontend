import {
  KPISummary,
  RevenuePoint,
  Customer,
  AIAdvisory,
  AdvisoryTriggerResult,
  ChatMessage,
  AuthTokenResponse,
  ResendVerificationResponse,
  LoginPayload,
  User,
  SettingsData,
  ChangePasswordPayload,
  ChangePasswordResponse,
  SalesSuggestions,
  CreateInvoicePayload,
  InvoiceResult,
  OtpSendPayload,
  OtpSendResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  RegisterWithPhonePayload
} from '../types';

const API_BASE = '/api/v1';

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('shopeek_token');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('shopeek_refresh_token');
};

// The current device's web-session id, issued by the backend on login. It lets
// the frontend (a) mark its own session in the Settings list and (b) tell the
// refresh flow which session it belongs to so revoked sessions cannot renew.
const SESSION_ID_KEY = 'shopeek_session_id';
export const getWebSessionId = (): string | null => localStorage.getItem(SESSION_ID_KEY);
export const setWebSessionId = (id: string | null): void => {
  if (id) localStorage.setItem(SESSION_ID_KEY, id);
  else localStorage.removeItem(SESSION_ID_KEY);
};

const clearAuthStorage = (): void => {
  localStorage.removeItem('shopeek_token');
  localStorage.removeItem('shopeek_refresh_token');
  localStorage.removeItem('shopeek_user');
  setWebSessionId(null);
  window.dispatchEvent(new Event('shopeek_unauthorized'));
};

// Single-flight silent token refresh via the backend's GoTrue refresh grant.
// `ok`: new tokens stored; `invalid`: refresh token conclusively rejected (or
// absent) so the session is dead; `unavailable`: transient network failure —
// keep the stored session and let the caller surface the error.
type RefreshOutcome = 'ok' | 'invalid' | 'unavailable';

let refreshPromise: Promise<RefreshOutcome> | null = null;

export const refreshAccessToken = async (): Promise<RefreshOutcome> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return 'invalid';
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          ...(getWebSessionId() ? { session_id: getWebSessionId() } : {}),
        }),
      });
      if (!res.ok) return 'invalid';
      const data = (await res.json()) as AuthTokenResponse;
      localStorage.setItem('shopeek_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('shopeek_refresh_token', data.refresh_token);
      }
      localStorage.setItem('shopeek_user', JSON.stringify(data.user));
      if (data.web_session_id) setWebSessionId(data.web_session_id);
      window.dispatchEvent(new Event('shopeek_token_refreshed'));
      return 'ok';
    } catch {
      return 'unavailable';
    }
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const doFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

// Custom fetch wrapper adding the Authorization header, with on-401 refresh+retry.
// Only a conclusively-rejected session clears local auth storage; transient
// network/refresh failures must NOT log read-only users out.
const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let response = await doFetch(input, init);

  if (response.status === 401) {
    const outcome = await refreshAccessToken();
    if (outcome === 'ok') {
      response = await doFetch(input, init);
      if (response.status === 401) {
        // A freshly issued token was still rejected — the session is unusable.
        clearAuthStorage();
      }
    } else if (outcome === 'invalid') {
      // Refresh token is conclusively dead. Clear invalid or expired token.
      clearAuthStorage();
    }
    // outcome === 'unavailable': transient failure; keep the stored session.
  }

  return response;
};

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

export const resendVerificationApi = async (email: string): Promise<ResendVerificationResponse> => {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ارسال مجدد لینک تأیید ایمیل' }));
    throw new Error(err.detail || 'خطا در ارسال مجدد لینک تأیید ایمیل');
  }
  return res.json();
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
  return res.json();
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

// --- ANALYTICS & DASHBOARD API METHODS ---

export const fetchKPISummary = async (
  days: number = 7,
  startDate?: string,
  endDate?: string
): Promise<KPISummary> => {
  let url = `${API_BASE}/analytics/kpi-summary?days=${days}`;
  if (startDate && endDate) {
    url += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  const res = await authFetch(url);
  if (!res.ok) throw new Error('خطا در دریافت خلاصه آمار و شاخص‌ها');
  return res.json();
};

export const fetchRevenueTrend = async (
  days: number = 7,
  startDate?: string,
  endDate?: string
): Promise<RevenuePoint[]> => {
  let url = `${API_BASE}/analytics/revenue-trend?days=${days}`;
  if (startDate && endDate) {
    url += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  const res = await authFetch(url);
  if (!res.ok) throw new Error('خطا در دریافت نمودار روند فروش');
  return res.json();
};


export const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await authFetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('خطا در دریافت لیست مشتریان');
  return res.json();
};

export const fetchCustomerDetail = async (id: string): Promise<Customer> => {
  const res = await authFetch(`${API_BASE}/customers/${id}`);
  if (!res.ok) throw new Error('خطا در دریافت جزئیات مشتری');
  return res.json();
};

export const addCustomerInteraction = async (id: string, type: string, content: string) => {
  const res = await authFetch(`${API_BASE}/customers/${id}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interaction_type: type, content })
  });
  if (!res.ok) throw new Error('خطا در ثبت یادداشت یا تعامل مشتری');
  return res.json();
};

export const fetchLatestAdvisory = async (): Promise<AIAdvisory | null> => {
  const res = await authFetch(`${API_BASE}/advisory/latest`);
  if (!res.ok) throw new Error('خطا در دریافت پیشنهادات هوشمند');
  return res.json();
};

export const fetchAdvisoryHistory = async (): Promise<AIAdvisory[]> => {
  const res = await authFetch(`${API_BASE}/advisory/history`);
  if (!res.ok) throw new Error('خطا در دریافت تاریخچه پیشنهادات');
  return res.json();
};

export const triggerManualAdvisory = async (): Promise<AdvisoryTriggerResult> => {
  const res = await authFetch(`${API_BASE}/advisory/generate`, { method: 'POST' });
  if (!res.ok) throw new Error('سرویس مشاوره هوشمند در دسترس نیست.');
  return res.json();
};

export const triggerBatchForecast = async () => {
  const res = await authFetch(`${API_BASE}/forecast/batch`, { method: 'POST' });
  if (!res.ok) throw new Error('خطا در محاسبه پیش‌بینی');
  return res.json();
};

export const uploadSalesFile = async (file: File, userMapping?: Record<string, string>) => {
  const formData = new FormData();
  formData.append('file', file);
  if (userMapping) {
    formData.append('user_mapping', JSON.stringify(userMapping));
  }

  const res = await authFetch(`${API_BASE}/ingestion/process`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در پردازش فایل' }));
    throw new Error(err.detail || 'خطا در پردازش فایل فاکتورها');
  }
  return res.json();
};

export const previewSalesFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`${API_BASE}/ingestion/preview`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در پیش‌نمایش فایل' }));
    throw new Error(err.detail || 'خطا در پیش‌نمایش فایل فاکتورها');
  }
  return res.json();
};

export const getSampleCSV = async () => {
  const res = await authFetch(`${API_BASE}/ingestion/sample`);
  if (!res.ok) throw new Error('خطا در دریافت فایل نمونه');
  return res.json();
};

export const sendChatMessage = async (sessionId: string, message: string, contextHints?: { active_page?: string; date_range_days?: number }): Promise<ChatMessage> => {
  const res = await authFetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      context_hints: contextHints
    })
  });
  if (!res.ok) throw new Error('دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.');
  return res.json();
};

export const fetchChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  const res = await authFetch(`${API_BASE}/chat/history?session_id=${sessionId}`);
  if (!res.ok) return [];
  return res.json();
};

export const clearChatHistory = async (sessionId: string): Promise<void> => {
  const res = await authFetch(`${API_BASE}/chat/history?session_id=${sessionId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('خطا در پاک کردن تاریخچه گفتگو');
};

export const createCustomer = async (data: { name: string; email?: string; phone?: string; address?: string }) => {
  const res = await authFetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ایجاد مشتری' }));
    throw new Error(err.detail || 'خطا در ایجاد مشتری');
  }
  return res.json();
};

// --- DIRECT INVOICE (ثبت فاکتور) API METHODS ---

export const fetchSalesSuggestions = async (): Promise<SalesSuggestions> => {
  const res = await authFetch(`${API_BASE}/sales/suggestions`);
  if (!res.ok) throw new Error('خطا در دریافت اطلاعات محصولات و مشتریان');
  return res.json();
};

export const createInvoice = async (payload: CreateInvoicePayload): Promise<InvoiceResult> => {
  const res = await authFetch(`${API_BASE}/sales/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ثبت فاکتور' }));
    throw new Error(err.detail || 'خطا در ثبت فاکتور');
  }
  return res.json();
};

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
