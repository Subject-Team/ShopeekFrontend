import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkle, X, Send, User, Layers, RefreshCw, Trash2, Lock, Bot, Gauge } from 'lucide-react';
import { CreditIcon } from '../icons';
import { usePageContext } from '../../context/PageContext';
import { useAuth } from '../../context/AuthContext';
import { useBillingContext } from '../../context/BillingContext';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '../../services/api';
import type { ChatMessage } from '../../types';
import { toGroupedPersianDigits, toPersianDigits } from "../../utils/persian";
import { formatJalaliRangeLabel } from "../../utils/persian/date";
import { CreditSpendConfirmModal } from '../credits/CreditSpendConfirmModal';
import { LOW_CREDIT_THRESHOLD, PAYG_COSTS } from '../../config/credits';

/** Converts direct string children of a markdown node to Persian digits (۰-۹). */
const persianText = (children: React.ReactNode): React.ReactNode =>
  React.Children.map(children, (child) =>
    typeof child === 'string' ? toPersianDigits(child) : child
  );

const assistantMarkdownComponents: Components = {
  p: ({ node: _node, children, ...props }) => <p {...props} className="my-1 first:mt-0 last:mb-0">{persianText(children)}</p>,
  strong: ({ node: _node, children, ...props }) => <strong {...props} className="font-extrabold">{persianText(children)}</strong>,
  em: ({ node: _node, children, ...props }) => <em {...props} className="italic">{persianText(children)}</em>,
  ul: ({ node: _node, ...props }) => <ul {...props} className="list-disc ps-5 my-1 space-y-0.5" />,
  ol: ({ node: _node, ...props }) => <ol {...props} className="list-decimal ps-5 my-1 space-y-0.5" />,
  li: ({ node: _node, children, ...props }) => <li {...props} className="leading-relaxed">{persianText(children)}</li>,
  a: ({ node: _node, children, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 dark:text-indigo-300 underline underline-offset-2 break-all"
    >
      {persianText(children)}
    </a>
  ),
  h1: ({ node: _node, children, ...props }) => <h1 {...props} className="text-sm font-extrabold my-1.5 first:mt-0 last:mb-0">{persianText(children)}</h1>,
  h2: ({ node: _node, children, ...props }) => <h2 {...props} className="text-[13px] font-extrabold my-1.5 first:mt-0 last:mb-0">{persianText(children)}</h2>,
  h3: ({ node: _node, children, ...props }) => <h3 {...props} className="text-xs font-extrabold my-1 first:mt-0 last:mb-0">{persianText(children)}</h3>,
  h4: ({ node: _node, children, ...props }) => <h4 {...props} className="text-xs font-extrabold my-1 first:mt-0 last:mb-0">{persianText(children)}</h4>,
  blockquote: ({ node: _node, children, ...props }) => (
    <blockquote {...props} className="border-s-2 border-slate-300 dark:border-slate-600 ps-2 my-1 italic text-slate-500 dark:text-slate-400">{persianText(children)}</blockquote>
  ),
  pre: ({ node: _node, children }) => (
    <pre
      dir="ltr"
      className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-2 my-1.5 overflow-x-auto text-left font-mono text-[10px] leading-relaxed"
    >
      {children}
    </pre>
  ),
  code: ({ node: _node, children, ...props }) => (
    <code
      {...props}
      dir="ltr"
      className="bg-slate-200/70 dark:bg-slate-700/70 rounded px-1 py-0.5 font-mono text-[10px] [pre&]:bg-transparent [pre&]:p-0 [pre&]:text-inherit"
    >
      {children}
    </code>
  ),
  table: ({ node: _node, children }) => (
    <div className="overflow-x-auto my-1.5">
      <table className="w-full border-collapse text-[10px]">{children}</table>
    </div>
  ),
  thead: ({ node: _node, ...props }) => <thead {...props} />,
  tbody: ({ node: _node, ...props }) => <tbody {...props} />,
  tr: ({ node: _node, ...props }) => <tr {...props} />,
  th: ({ node: _node, children, ...props }) => (
    <th {...props} className="border border-slate-300 dark:border-slate-600 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-1 font-bold [&>p]:my-0">
      {persianText(children)}
    </th>
  ),
  td: ({ node: _node, children, ...props }) => (
    <td {...props} className="border border-slate-300 dark:border-slate-600 px-1.5 py-1 [&>p]:my-0">
      {persianText(children)}
    </td>
  ),
  hr: () => <hr className="my-2 border-slate-200 dark:border-slate-700" />,
  img: ({ node: _node, ...props }) => <img {...props} className="max-w-full rounded-lg my-1" alt="" />,
};

export const ChatDrawer: React.FC = () => {
  const { isChatOpen, setIsChatOpen, activePage, dateRangeDays, startDate, endDate, isHistorical } = usePageContext();
  const { user } = useAuth();
  const { billing, refreshBilling, isSiteSuppressed, suppressSite } = useBillingContext();

  const readOnly = Boolean(user?.is_read_only);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [pendingSend, setPendingSend] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = 'session_default_user';
  // History rows are isolated per account server-side (user_id + session_id),
  // so the shared key is safe — but the in-memory list must follow account
  // switches, otherwise user B sees user A's messages after a login change.
  const userId = user?.id ?? null;

  const wallet = billing?.wallet ?? null;
  const aiUsage = billing?.usage?.find(u => u.feature_key === 'daily_ai_run_limit') ?? null;
  const remainingCredits = wallet ? wallet.purchased_balance + wallet.monthly_balance : 0;
  const creditState: 'normal' | 'low' | 'debt' =
    (wallet?.purchased_balance ?? 0) < 0
      ? 'debt'
      : wallet !== null && remainingCredits <= LOW_CREDIT_THRESHOLD
        ? 'low'
        : 'normal';

  const paygCost = aiUsage?.payg_cost ?? PAYG_COSTS.daily_ai_run_limit ?? 3;
  const quotaLimit = aiUsage?.limit ?? null;
  const quotaLeft = quotaLimit === null
    ? null
    : aiUsage?.remaining !== undefined && aiUsage?.remaining !== null
      ? aiUsage.remaining
      : Math.max(0, quotaLimit - (aiUsage?.used ?? 0));
  const overQuota = quotaLimit !== null && quotaLeft !== null && quotaLeft <= 0;
  const blocked = overQuota && remainingCredits < paygCost;

  const buildWelcomeMessage = (): ChatMessage => ({
    id: 'welcome',
    session_id: sessionId,
    sender: 'ASSISTANT',
    message_content: 'سلام! من دستیار هوشمند شاپیک هستم. چطور می‌توانم در تحلیل روند فروش یا وضعیت مشتریان به شما کمک کنم؟',
    created_at: new Date().toISOString()
  });

  useEffect(() => {
    if (!isChatOpen) return;
    setHistoryLoading(true);
    fetchChatHistory(sessionId)
      .then(data => {
        setMessages(data && data.length > 0 ? data : [buildWelcomeMessage()]);
      })
      .catch(() => {
        setMessages([buildWelcomeMessage()]);
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  }, [isChatOpen, userId]);

  useEffect(() => {
    if (isChatOpen) {
      void refreshBilling();
    }
  }, [isChatOpen, refreshBilling]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, loading, historyLoading]);

  const sendMessage = async (rawText: string) => {
    const userText = rawText.trim();
    if (readOnly || !userText || loading) return;

    setInput('');

    const tempUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      sender: 'USER',
      message_content: userText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    const contextHints = {
      active_page: activePage,
      date_range_days: dateRangeDays
    };

    try {
      const response = await sendChatMessage(sessionId, userText, contextHints);
      setMessages(prev => [...prev, response]);
    } catch (err: unknown) {
      console.error('Failed to send chat message', err instanceof Error ? err.message : err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        sender: 'ASSISTANT',
        message_content: 'دستیار هوشمند شاپیک در حال حاضر در دسترس نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      void refreshBilling();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || loading || blocked || !input.trim()) return;
    const text = input;
    if (!overQuota) {
      setInput('');
      void sendMessage(text);
      return;
    }
    if (isSiteSuppressed('chat') && remainingCredits >= paygCost) {
      setInput('');
      void sendMessage(text);
      return;
    }
    setPendingSend(text);
  };

  const handleSuggestedClick = (suggested: string) => {
    if (readOnly || loading || blocked) return;
    if (!overQuota) {
      void sendMessage(suggested);
      return;
    }
    if (isSiteSuppressed('chat') && remainingCredits >= paygCost) {
      void sendMessage(suggested);
      return;
    }
    setPendingSend(suggested);
  };

  const confirmSend = () => {
    if (!pendingSend) return;
    const text = pendingSend;
    setPendingSend(null);
    setInput('');
    void sendMessage(text);
  };

  const handleDontShowAgain = async () => {
    if (!pendingSend) return;
    const text = pendingSend;
    setPendingSend(null);
    await suppressSite('chat');
    if (remainingCredits >= paygCost) {
      setInput('');
      void sendMessage(text);
    }
  };

  const handleClearChat = (): void => {
    if (readOnly || clearing || loading) return;
    setShowClearConfirm(true);
  };

  const confirmClearChat = async (): Promise<void> => {
    setShowClearConfirm(false);
    setClearing(true);
    try {
      await clearChatHistory(sessionId);
      setMessages([buildWelcomeMessage()]);
    } catch (err: unknown) {
      console.error('Failed to clear chat history', err);
    } finally {
      setClearing(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 h-[100dvh] z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsChatOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pr-0 h-full">
        <div className="w-screen max-w-md h-full max-h-[100dvh] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">

          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">دستیار هوشمند شاپیک</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>
                    زمینه فعال: {activePage} (
                    {isHistorical ? formatJalaliRangeLabel(startDate, endDate) : `${toGroupedPersianDigits(dateRangeDays)} روز`}
                    )
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!overQuota ? (
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"
                  title="سهمیه پیام امروز"
                >
                  <Gauge size={12} className="shrink-0" />
                  <span>
                    {quotaLeft === null
                      ? 'نامحدود'
                      : `${toGroupedPersianDigits(quotaLeft)} از ${toGroupedPersianDigits(quotaLimit ?? 0)}`}
                  </span>
                </span>
              ) : (
                wallet && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      creditState === 'debt'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : creditState === 'low'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                    title="اعتبار باقی‌مانده"
                  >
                    <CreditIcon
                      size={12}
                      className={`shrink-0 ${
                        creditState === 'debt'
                          ? 'text-rose-500'
                          : creditState === 'low'
                            ? 'text-amber-500'
                            : 'text-indigo-500'
                      }`}
                    />
                    <span>{toGroupedPersianDigits(remainingCredits)}</span>
                  </span>
                )
              )}
              <button
                onClick={handleClearChat}
                disabled={clearing || loading || readOnly}
                title={readOnly ? 'در حالت فقط-خواندنی امکان پاک کردن گفتگو وجود ندارد.' : 'پاک کردن گفتگو'}
                aria-label="پاک کردن گفتگو"
                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  {msg.sender === 'ASSISTANT' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={assistantMarkdownComponents}>
                      {msg.message_content}
                    </ReactMarkdown>
                  ) : (
                    msg.message_content
                  )}
                </div>
              </div>
            ))}

            {historyLoading && messages.length === 0 && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>در حال بارگذاری گفتگو...</span>
                </div>
              </div>
            )}

            {/* Recommended starter question chips if fresh chat */}
            {messages.length <= 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  سوالات پیشنهادی برای شروع گفتگو:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'پرفروش‌ترین روزهای دوره کدام بودند؟',
                    'میانگین ارزش هر فاکتور چه تغییری داشته؟',
                    'پیش‌بینی فروش برای روزهای آینده چیست؟',
                    'کدام مشتریان بیشترین سهم درآمد را دارند؟',
                  ].map((suggested, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      disabled={readOnly || loading || blocked}
                      onClick={() => handleSuggestedClick(suggested)}
                      className="text-start text-[11px] px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💡 {suggested}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
            {readOnly && (
              <div className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-[11px] leading-relaxed">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                <span>در حالت «فقط-خواندنی» ارسال پیام به دستیار هوشمند امکان‌پذیر نیست.</span>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={readOnly}
                placeholder={readOnly ? 'ارسال پیام غیرفعال است' : 'سوال خود درباره فروش را بپرسید...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-transparent focus:border-indigo-500 focus:outline-hidden disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || readOnly || blocked || !input.trim()}
                title={blocked ? 'اعتبار کافی نیست — برای ارسال، اعتبار شارژ کنید' : undefined}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Clear-chat confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 dir-rtl font-vazir">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowClearConfirm(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-chat-confirm-title"
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <h4 id="clear-chat-confirm-title" className="font-extrabold text-slate-900 dark:text-white text-sm">
                پاک کردن گفتگو
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا از پاک کردن کامل گفتگو مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={confirmClearChat}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/25 transition-all disabled:opacity-50"
              >
                {clearing ? 'در حال پاک کردن...' : 'تأیید و پاک کردن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-usage credit confirmation modal */}
      <CreditSpendConfirmModal
        open={pendingSend !== null}
        cost={paygCost}
        remaining={remainingCredits}
        actionLabel="ارسال پیام به دستیار هوشمند"
        quotaExhausted={overQuota}
        onCancel={() => setPendingSend(null)}
        onConfirm={confirmSend}
        onDontShowAgain={handleDontShowAgain}
      />
    </div>
  );
};
