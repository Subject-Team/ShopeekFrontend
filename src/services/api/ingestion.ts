import { authFetch } from './client';

const API_BASE = '/api/v1';

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
