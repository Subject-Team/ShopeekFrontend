import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSalesSuggestions, createInvoice } from '../api';

describe('sales API', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  const okJson = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
  const errJson = (status: number, body: unknown) => ({
    ok: false,
    status,
    json: async () => body,
  });
  const errNonJson = (status: number) => ({
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  });

  it('fetchSalesSuggestions returns products and customers', async () => {
    window.fetch = vi.fn().mockResolvedValue(
      okJson({
        products: { last: 'قهوه', top3: ['قهوه', 'چای'], names: ['قهوه', 'چای'] },
        customers: { last: 'سارا', top3: ['سارا'], items: [{ id: 'c-1', name: 'سارا' }] },
      })
    );
    const res = await fetchSalesSuggestions();
    expect(res.products.last).toBe('قهوه');
    expect(res.customers.items[0].name).toBe('سارا');
  });

  it('fetchSalesSuggestions throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(fetchSalesSuggestions()).rejects.toThrow('خطا در دریافت اطلاعات محصولات و مشتریان');
  });

  it('createInvoice POSTs the invoice payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        transaction_reference: 'ref-1',
        product_name: 'قهوه',
        customer_name: 'سارا',
        total_amount: 100,
        transaction_date: '2026-09-12',
      })
    );
    window.fetch = fetchMock;

    const res = await createInvoice({ product_name: 'قهوه', customer_name: 'سارا', total_amount: 100 });
    expect(res.transaction_reference).toBe('ref-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/sales/invoices',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ product_name: 'قهوه', customer_name: 'سارا', total_amount: 100 }),
      })
    );
  });

  it('createInvoice throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'مشتری یافت نشد' }));
    await expect(createInvoice({ product_name: 'قهوه', customer_name: 'غایب', total_amount: 100 })).rejects.toThrow(
      'مشتری یافت نشد'
    );
  });

  it('createInvoice falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(createInvoice({ product_name: 'قهوه', customer_name: 'سارا', total_amount: 100 })).rejects.toThrow(
      'خطا در ثبت فاکتور'
    );
  });
});