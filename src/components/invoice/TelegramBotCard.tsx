import React, { useEffect, useState } from 'react';
import { Send, Info, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchSettings } from '../../services/api';
import type { TelegramSession } from '../../types';
import { toGroupedPersianDigits } from '../../utils/persian';
import { TelegramBotInfoModal } from './TelegramBotInfoModal';

interface TelegramBotCardProps {
  sessions?: TelegramSession[];
}

export const TelegramBotCard: React.FC<TelegramBotCardProps> = ({ sessions: propSessions }) => {
  const [sessions, setSessions] = useState<TelegramSession[]>(propSessions ?? []);
  const [loading, setLoading] = useState<boolean>(!propSessions);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (propSessions !== undefined) {
      setSessions(propSessions);
      setLoading(false);
      return;
    }

    let active = true;
    fetchSettings()
      .then((data) => {
        if (active) {
          setSessions(data.telegram_sessions ?? []);
        }
      })
      .catch(() => {
        if (active) setSessions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [propSessions]);

  const isConnected = sessions.length > 0;

  return (
    <div
      data-guide="invoices-telegram-bot"
      className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-xs"
    >
      {/* Top Header & Info Trigger */}
      <div className="flex items-start justify-between gap-3 border-b border-indigo-100/70 dark:border-indigo-900/40 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                ثبت فاکتور با ربات تلگرام
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                سریع و آنی
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ثبت تراکنش‌ها از طریق تلگرام با پشتیبانی از متن روان هوشمند
            </p>
          </div>
        </div>

        {/* Info Icon Button */}
        <button
          type="button"
          onClick={() => setInfoModalOpen(true)}
          aria-label="راهنمای ربات تلگرام و ثبت هوشمند"
          title="راهنمای امکانات و دستورات ربات"
          className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center transition-all shadow-xs shrink-0"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Connection Status & Quick Feature Highlights */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {/* Connection Status Identifier */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">وضعیت اتصال به ربات:</span>
          {loading ? (
            <span className="text-slate-400 text-xs animate-pulse">در حال بررسی...</span>
          ) : isConnected ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                متصل به ربات ({toGroupedPersianDigits(sessions.length)} حساب)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="font-bold text-slate-500 dark:text-slate-400">
                حسابی متصل نیست
              </span>
            </div>
          )}
        </div>

        {/* Highlight Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">ثبت متن روان با هوش مصنوعی</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">پشتیبانی از تاریخ شمسی</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <a
          href="https://t.me/Shopeek_Bot"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ورود به ربات Shopeek_Bot@</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Info Modal */}
      <TelegramBotInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        telegramSessions={sessions}
      />
    </div>
  );
};
