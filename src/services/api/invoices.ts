import type { FetchInvoicesParams, InvoicesResponse } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const fetchInvoices = async (
  params: FetchInvoicesParams
): Promise<InvoicesResponse> => {
  const query = new URLSearchParams();
  query.set('limit', String(params.limit ?? 20));
  query.set('offset', String(params.offset ?? 0));
  if (params.customerId) query.set('customer_id', params.customerId);
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.startDate) query.set('start_date', params.startDate);
  if (params.endDate) query.set('end_date', params.endDate);
  const res = await authFetch(`${API_BASE}/sales/invoices?${query.toString()}`);
  if (!res.ok) throw new Error('خطا در دریافت لیست فاکتورها');
  return res.json();
};
