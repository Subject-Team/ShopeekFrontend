import {
  KPISummary,
  RevenuePoint,
  Customer,
  AIAdvisory,
  AdvisoryTriggerResult,
  ChatMessage,
  AuthTokenResponse,
  LoginPayload,
  RegisterPayload,
  User
} from '../types';

const API_BASE = '/api/v1';

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('shopeek_token');
};

// Custom fetch wrapper adding Authorization header
const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // Clear invalid or expired token
    localStorage.removeItem('shopeek_token');
    localStorage.removeItem('shopeek_user');
    window.dispatchEvent(new Event('shopeek_unauthorized'));
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
    throw new Error(err.detail || 'ایمیل یا کلمه عبور وارد شده نادرست است.');
  }
  return res.json();
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthTokenResponse> => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در ثبت‌نام کاربر' }));
    throw new Error(err.detail || 'خطا در ایجاد حساب جدید.');
  }
  return res.json();
};

export const fetchMeApi = async (): Promise<User> => {
  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('خطا در دریافت اطلاعات کاربر');
  return res.json();
};

// --- ANALYTICS & DASHBOARD API METHODS ---

export const fetchKPISummary = async (days: number = 30): Promise<KPISummary> => {
  const res = await authFetch(`${API_BASE}/analytics/kpi-summary?days=${days}`);
  if (!res.ok) throw new Error('خطا در دریافت خلاصه آمار و شاخص‌ها');
  return res.json();
};

export const fetchRevenueTrend = async (days: number = 14): Promise<RevenuePoint[]> => {
  const res = await authFetch(`${API_BASE}/analytics/revenue-trend?days=${days}`);
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
  const res = await authFetch(`${API_BASE}/advisory/trigger`, { method: 'POST' });
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

export const uploadCSVFile = uploadSalesFile;

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

export const previewCSVFile = previewSalesFile;

export const getSampleCSV = async () => {
  const res = await authFetch(`${API_BASE}/ingestion/sample`);
  if (!res.ok) throw new Error('خطا در دریافت فایل نمونه');
  return res.json();
};

export const sendChatMessage = async (sessionId: string, message: string, snapshotContext?: any): Promise<ChatMessage> => {
  const res = await authFetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      snapshot_context: snapshotContext
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
