import type {
  AdminStats,
  AdminUsersResponse,
  AdminUserItem,
  AdminTransactionsResponse,
  AdminErrorsResponse,
  AdminUserUpdatePayload,
} from '../../types/admin';
import { authFetch } from './client';

const API_BASE = '/api/v1';

// --- ADMIN API METHODS ---

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const res = await authFetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error('خطا در دریافت آمار کلی');
  return res.json();
};

export const fetchAdminUsers = async (
  search: string = '',
  page: number = 1,
  pageSize: number = 20
): Promise<AdminUsersResponse> => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const res = await authFetch(`${API_BASE}/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error('خطا در دریافت لیست کاربران');
  return res.json();
};

export const fetchAdminUserDetail = async (id: string): Promise<AdminUserItem> => {
  const res = await authFetch(`${API_BASE}/admin/users/${id}`);
  if (!res.ok) throw new Error('خطا در دریافت جزئیات کاربر');
  return res.json();
};

export const fetchAdminUserTransactions = async (
  id: string,
  limit: number = 50,
  offset: number = 0
): Promise<AdminTransactionsResponse> => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await authFetch(`${API_BASE}/admin/users/${id}/transactions?${params.toString()}`);
  if (!res.ok) throw new Error('خطا در دریافت تراکنش‌های کاربر');
  return res.json();
};

export const updateAdminUser = async (
  id: string,
  payload: AdminUserUpdatePayload
): Promise<AdminUserItem> => {
  const res = await authFetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در بروزرسانی کاربر' }));
    throw new Error(err.detail || 'خطا در بروزرسانی کاربر');
  }
  return res.json();
};

export const deleteAdminUser = async (id: string): Promise<{ ok: boolean }> => {
  const res = await authFetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در حذف کاربر' }));
    throw new Error(err.detail || 'خطا در حذف کاربر');
  }
  return res.json();
};

export const restoreAdminUser = async (id: string): Promise<AdminUserItem> => {
  const res = await authFetch(`${API_BASE}/admin/users/${id}/restore`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطا در بازیابی کاربر' }));
    throw new Error(err.detail || 'خطا در بازیابی کاربر');
  }
  return res.json();
};

export const fetchAdminErrors = async (
  page: number = 1,
  pageSize: number = 20,
  severity?: string,
  source?: string
): Promise<AdminErrorsResponse> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  if (severity) params.set('severity', severity);
  if (source) params.set('source', source);
  const res = await authFetch(`${API_BASE}/admin/errors?${params.toString()}`);
  if (!res.ok) throw new Error('خطا در دریافت لیست خطاها');
  return res.json();
};
