// @test-type service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReadableStream as WebReadableStream } from 'node:stream/web';
import { sendChatMessage, sendChatMessageStream, fetchChatHistory, clearChatHistory } from '../api';

describe('[service] chat API', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

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

  const sseBody = (events: string[]) => {
    const enc = new TextEncoder();
    const stream = new WebReadableStream({
      start(controller) {
        for (const e of events) controller.enqueue(enc.encode(e));
        controller.close();
      }
    });
    return stream as unknown as ReadableStream<Uint8Array>;
  };

  it('sendChatMessageStream emits deltas and resolves the final message', async () => {
    const finalMsg = {
      id: 'm9',
      session_id: 'sess-1',
      sender: 'ASSISTANT',
      message_content: 'سلام دنیا',
      created_at: new Date().toISOString()
    };
    window.fetch = vi.fn().mockResolvedValue(new Response(
      sseBody([
        `data: ${JSON.stringify({ delta: 'سلام ' })}\n\n`,
        `data: ${JSON.stringify({ delta: 'دنیا' })}\n\n`,
        `data: ${JSON.stringify({ done: true, message: finalMsg })}\n\n`
      ]),
      { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
    ));
    const seen: string[] = [];
    const result = await sendChatMessageStream('sess-1', 'سلام', d => { seen.push(d); });
    expect(seen).toEqual(['سلام ', 'دنیا']);
    expect(result).toEqual(finalMsg);
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/v1/chat/message/stream',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sendChatMessageStream throws when the stream never completes', async () => {
    window.fetch = vi.fn().mockResolvedValue(new Response(
      sseBody([`data: ${JSON.stringify({ delta: 'نصف' })}\n\n`]),
      { status: 200 }
    ));
    await expect(sendChatMessageStream('sess-1', 'سلام', () => {})).rejects.toThrow(
      'دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.'
    );
  });
});