import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCustomer } from '../api';

describe('customers API', () => {
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

  it('createCustomer POSTs the customer data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ id: 'c-1', user_id: 'u-1', name: 'مشتری جدید', total_lifetime_value: 0, created_at: '2026-09-12', interactions_count: 0, transactions_count: 0 })
    );
    window.fetch = fetchMock;

    const res = await createCustomer({ name: 'مشتری جدید', email: 'new@cust.com' });
    expect(res.id).toBe('c-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/customers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'مشتری جدید', email: 'new@cust.com' }),
      })
    );
  });

  it('createCustomer throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'نام الزامی است' }));
    await expect(createCustomer({ name: '' })).rejects.toThrow('نام الزامی است');
  });

  it('createCustomer falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(createCustomer({ name: 'مشتری' })).rejects.toThrow('خطا در ایجاد مشتری');
  });
});