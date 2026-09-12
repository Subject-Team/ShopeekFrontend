import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '../api';

describe('chat API', () => {
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

  it('sendChatMessage throws when the assistant is unavailable', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(503, {}));
    await expect(sendChatMessage('sess-1', 'سلام')).rejects.toThrow(
      'دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.'
    );
  });

  it('fetchChatHistory returns an empty list on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    const history = await fetchChatHistory('sess-1');
    expect(history).toEqual([]);
  });

  it('clearChatHistory DELETEs the history', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    window.fetch = fetchMock;

    await clearChatHistory('sess-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/chat/history?session_id=sess-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('clearChatHistory throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(clearChatHistory('sess-1')).rejects.toThrow('خطا در پاک کردن تاریخچه گفتگو');
  });
});