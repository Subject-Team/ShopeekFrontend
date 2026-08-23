import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loginApi,
  registerApi,
  fetchMeApi,
  fetchKPISummary,
  fetchRevenueTrend,
  fetchCustomers,
  fetchCustomerDetail,
  addCustomerInteraction,
  fetchLatestAdvisory,
  fetchAdvisoryHistory,
  triggerManualAdvisory,
  triggerBatchForecast,
  uploadSalesFile,
  previewSalesFile,
  getSampleCSV,
  sendChatMessage,
  fetchChatHistory,
  createCustomer,
} from '../api';

describe('API Services', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('loginApi sends POST request and returns auth token response', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'tok-123',
        token_type: 'bearer',
        user: { id: 'u-1', email: 'test@shopeek.ir' },
      }),
    });

    const res = await loginApi({ email: 'test@shopeek.ir', password: 'Password123!' });
    expect(res.access_token).toBe('tok-123');
  });

  it('loginApi throws custom error on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials' }),
    });

    await expect(
      loginApi({ email: 'test@shopeek.ir', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('registerApi sends POST request and returns token response', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-tok-123',
        token_type: 'bearer',
        user: { id: 'u-2', email: 'new@shopeek.ir' },
      }),
    });

    const res = await registerApi({
      email: 'new@shopeek.ir',
      password: 'Password123!',
      full_name: 'کاربر جدید',
    });
    expect(res.access_token).toBe('new-tok-123');
  });

  it('fetchMeApi includes Bearer token header', async () => {
    localStorage.setItem('shopeek_token', 'jwt-token-xyz');
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u-1', email: 'test@shopeek.ir' }),
    });

    const user = await fetchMeApi();
    expect(user.email).toBe('test@shopeek.ir');
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/v1/auth/me',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('fetchKPISummary and fetchRevenueTrend pass query parameters', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total_revenue: 1000000 }),
    });

    await fetchKPISummary(14);
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/v1/analytics/kpi-summary?days=14',
      expect.anything()
    );

    await fetchRevenueTrend(30);
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/v1/analytics/revenue-trend?days=30',
      expect.anything()
    );
  });

  it('fetchCustomers and fetchCustomerDetail retrieve customer records', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'c-1', name: 'سارا' }],
    });

    const list = await fetchCustomers();
    expect(list.length).toBe(1);

    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'c-1', name: 'سارا', interactions: [] }),
    });

    const detail = await fetchCustomerDetail('c-1');
    expect(detail.name).toBe('سارا');
  });

  it('addCustomerInteraction and createCustomer send POST requests', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await addCustomerInteraction('c-1', 'NOTE', 'یادداشت جدید');
    await createCustomer({ name: 'مشتری جدید', email: 'new@cust.com' });
  });

  it('advisory and forecast endpoints return expected payloads', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ summary: 'پیشنهاد' }),
    });

    await fetchLatestAdvisory();
    await fetchAdvisoryHistory();
    await triggerManualAdvisory();
    await triggerBatchForecast();
  });

  it('file upload and preview functions build form data', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ row_count: 10 }),
    });

    const mockFile = new File(['header\n1,2'], 'sales.csv', { type: 'text/csv' });
    await uploadSalesFile(mockFile, { col1: 'mapped' });
    await previewSalesFile(mockFile);
    await getSampleCSV();
  });

  it('sendChatMessage and fetchChatHistory communicate with chat endpoint', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message_content: 'سلام' }),
    });

    const reply = await sendChatMessage('sess-1', 'سلام', { snapshot: true });
    expect(reply.message_content).toBe('سلام');

    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ message_content: 'پیام قبلی' }],
    });

    const history = await fetchChatHistory('sess-1');
    expect(history.length).toBe(1);
  });

  it('authFetch dispatches shopeek_unauthorized on 401 response', async () => {
    localStorage.setItem('shopeek_token', 'expired-token');
    const unauthorizedListener = vi.fn();
    window.addEventListener('shopeek_unauthorized', unauthorizedListener);

    window.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
    });

    await expect(fetchKPISummary(30)).rejects.toThrow();

    expect(unauthorizedListener).toHaveBeenCalled();
    expect(localStorage.getItem('shopeek_token')).toBeNull();
    window.removeEventListener('shopeek_unauthorized', unauthorizedListener);
  });
});
