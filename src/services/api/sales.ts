import type { CreateInvoicePayload, InvoiceResult, SalesSuggestions } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

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
