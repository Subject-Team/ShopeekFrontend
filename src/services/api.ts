import { KPISummary, RevenuePoint, Customer, AIAdvisory, AdvisoryTriggerResult, ChatMessage } from '../types';

const API_BASE = '/api/v1';

export const fetchKPISummary = async (days: number = 30): Promise<KPISummary> => {
  const res = await fetch(`${API_BASE}/analytics/kpi-summary?days=${days}`);
  if (!res.ok) throw new Error('خطا در دریافت خلاصه آمار و شاخص‌ها');
  return res.json();
};

export const fetchRevenueTrend = async (days: number = 14): Promise<RevenuePoint[]> => {
  const res = await fetch(`${API_BASE}/analytics/revenue-trend?days=${days}`);
  if (!res.ok) throw new Error('خطا در دریافت نمودار روند فروش');
  return res.json();
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('خطا در دریافت لیست مشتریان');
  return res.json();
};

export const fetchCustomerDetail = async (id: string): Promise<Customer> => {
  const res = await fetch(`${API_BASE}/customers/${id}`);
  if (!res.ok) throw new Error('خطا در دریافت جزئیات مشتری');
  return res.json();
};

export const addCustomerInteraction = async (id: string, type: string, content: string) => {
  const res = await fetch(`${API_BASE}/customers/${id}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interaction_type: type, content })
  });
  if (!res.ok) throw new Error('خطا در ثبت یادداشت یا تعامل مشتری');
  return res.json();
};

export const fetchLatestAdvisory = async (): Promise<AIAdvisory | null> => {
  const res = await fetch(`${API_BASE}/advisory/latest`);
  if (!res.ok) throw new Error('خطا در دریافت پیشنهادات هوشمند');
  return res.json();
};

export const triggerManualAdvisory = async (): Promise<AdvisoryTriggerResult> => {
  const res = await fetch(`${API_BASE}/advisory/trigger`, { method: 'POST' });
  if (!res.ok) throw new Error('سرویس مشاوره هوشمند در دسترس نیست.');
  return res.json();
};

export const triggerBatchForecast = async () => {
  const res = await fetch(`${API_BASE}/forecast/batch`, { method: 'POST' });
  if (!res.ok) throw new Error('خطا در محاسبه پیش‌بینی');
  return res.json();
};

export const uploadCSVFile = async (file: File, userMapping?: Record<string, string>) => {
  const formData = new FormData();
  formData.append('file', file);
  if (userMapping) {
    formData.append('user_mapping', JSON.stringify(userMapping));
  }

  const res = await fetch(`${API_BASE}/ingestion/process`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'خطا در پردازش فایل CSV');
  }
  return res.json();
};

export const previewCSVFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/ingestion/preview`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'خطا در پیش‌نمایش فایل');
  }
  return res.json();
};

export const getSampleCSV = async () => {
  const res = await fetch(`${API_BASE}/ingestion/sample`);
  if (!res.ok) throw new Error('خطا در دریافت فایل نمونه');
  return res.json();
};

export const sendChatMessage = async (sessionId: string, message: string, snapshotContext?: any): Promise<ChatMessage> => {
  const res = await fetch(`${API_BASE}/chat/message`, {
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
  const res = await fetch(`${API_BASE}/chat/history?session_id=${sessionId}`);
  if (!res.ok) return [];
  return res.json();
};
