import type { Customer } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

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
