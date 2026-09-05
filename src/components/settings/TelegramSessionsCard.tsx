import React from 'react';
import { Loader2, MessageSquare, XCircle } from 'lucide-react';
import type { TelegramSession } from '../../types';
import { formatPersianDateAsUTC } from '../../utils';

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

interface TelegramSessionsCardProps {
  telegramSessions: TelegramSession[];
  loading: boolean;
  readOnly: boolean;
  revokingId: string | null;
  onUnlinkTelegram: (id: string) => void;
}

export const TelegramSessionsCard: React.FC<TelegramSessionsCardProps> = ({
  telegramSessions,
  loading,
  readOnly,
  revokingId,
  onUnlinkTelegram,
}) => (
  <div data-guide="settings-telegram" className={cardClass}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">اتصال به ربات تلگرام</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">دستگاه‌هایی که از طریق ربات تلگرام به حسابتان متصل شده‌اند.</p>
      </div>
      <MessageSquare className="w-5 h-5 text-indigo-400" />
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-10 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    ) : telegramSessions.length === 0 ? (
      <p className="text-sm text-slate-400 py-8 text-center">هنوز اتصالی به ربات تلگرام برقرار نشده است.</p>
    ) : (
      <ul className="mt-4 space-y-2.5">
        {telegramSessions.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 p-3.5 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate" dir="ltr">
                {t.telegram_chat_id}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                متصل از {formatPersianDateAsUTC(t.created_at, true)}
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => onUnlinkTelegram(t.id)}
                disabled={revokingId === t.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 text-[11px] font-bold transition-all shrink-0 disabled:opacity-50"
              >
                {revokingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                قطع اتصال
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);