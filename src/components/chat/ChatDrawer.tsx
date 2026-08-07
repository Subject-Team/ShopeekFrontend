import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, Layers, RefreshCw } from 'lucide-react';
import { usePageContext } from '../../context/PageContext';
import { sendChatMessage, fetchChatHistory } from '../../services/api';
import { ChatMessage } from '../../types';
import { toPersianDigits } from '../../utils';

export const ChatDrawer: React.FC = () => {
  const { isChatOpen, setIsChatOpen, activePage, dateRangeDays, pageMetricsSnapshot } = usePageContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = 'session_default_user';

  useEffect(() => {
    if (isChatOpen) {
      fetchChatHistory(sessionId).then(data => {
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Default Welcome Persian Message
          setMessages([{
            id: 'welcome',
            session_id: sessionId,
            sender: 'ASSISTANT',
            message_content: 'سلام! من دستیار هوشمند شاپیک هستم. چطور می‌توانم در تحلیل روند فروش یا وضعیت مشتریان به شما کمک کنم؟',
            created_at: new Date().toISOString()
          }]);
        }
      });
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(),
      session_id: sessionId,
      sender: 'USER',
      message_content: userText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    const snapshot = {
      active_page: activePage,
      date_range_days: dateRangeDays,
      metrics: pageMetricsSnapshot
    };

    try {
      const response = await sendChatMessage(sessionId, userText, snapshot);
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        session_id: sessionId,
        sender: 'ASSISTANT',
        message_content: 'دستیار هوشمند شاپیک در حال حاضر در دسترس نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsChatOpen(false)}
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">

          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">دستیار هوشمند شاپیک</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>زمینه فعال: {activePage} ({toPersianDigits(dateRangeDays)} روز)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'USER'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.sender === 'USER'
                      ? 'bg-indigo-600 text-white rounded-tl-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {msg.message_content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>دستیار در حال تحلیل داده‌ها...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="سوال خود درباره فروش را بپرسید..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-transparent focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
