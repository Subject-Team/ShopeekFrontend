import type { ChatMessage } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const sendChatMessage = async (sessionId: string, message: string, contextHints?: { active_page?: string; date_range_days?: number }, paygConfirmed?: boolean): Promise<ChatMessage> => {
  const res = await authFetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      context_hints: contextHints,
      payg_confirmed: paygConfirmed ?? false
    })
  });
  if (!res.ok) throw new Error('دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.');
  return res.json();
};

export const sendChatMessageStream = async (
  sessionId: string,
  message: string,
  onToken: (delta: string) => void,
  contextHints?: { active_page?: string; date_range_days?: number },
  options?: { signal?: AbortSignal; paygConfirmed?: boolean }
): Promise<ChatMessage> => {
  const res = await authFetch(`${API_BASE}/chat/message/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      context_hints: contextHints,
      payg_confirmed: options?.paygConfirmed ?? false
    }),
    signal: options?.signal
  });
  if (!res.ok || !res.body) throw new Error('دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalMessage: ChatMessage | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const event of events) {
      const line = event.split('\n').find(l => l.startsWith('data:'));
      if (!line) continue;
      try {
        const payload = JSON.parse(line.slice(5).trim()) as { delta?: string; done?: boolean; message?: ChatMessage };
        if (payload.done) {
          finalMessage = payload.message ?? null;
        } else if (payload.delta) {
          onToken(payload.delta);
        }
      } catch {
        continue;
      }
    }
  }
  if (!finalMessage) throw new Error('دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.');
  return finalMessage;
};

export const fetchChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  const res = await authFetch(`${API_BASE}/chat/history?session_id=${sessionId}`);
  if (!res.ok) return [];
  return res.json();
};

export const clearChatHistory = async (sessionId: string): Promise<void> => {
  const res = await authFetch(`${API_BASE}/chat/history?session_id=${sessionId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('خطا در پاک کردن تاریخچه گفتگو');
};
