import type { ChatMessage } from '../../types';
import { authFetch } from './client';

const API_BASE = '/api/v1';

export const sendChatMessage = async (sessionId: string, message: string, contextHints?: { active_page?: string; date_range_days?: number }): Promise<ChatMessage> => {
  const res = await authFetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      context_hints: contextHints
    })
  });
  if (!res.ok) throw new Error('دستیار هوشمند شاپیک در حال حاضر در دسترس نیست.');
  return res.json();
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
