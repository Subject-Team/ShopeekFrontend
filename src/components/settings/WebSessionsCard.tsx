import React from 'react';
import { Loader2, LogOut, RefreshCcw } from 'lucide-react';
import { deviceIcon } from '../../utils/device';
import type { WebSession } from '../../types';
import { formatPersianDateAsUTC, formatPersianTimeAsUTC } from '../../utils';

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

interface WebSessionsCardProps {
  webSessions: WebSession[];
  loading: boolean;
  readOnly: boolean;
  currentSessionId: string | null;
  revokingId: string | null;
  targetId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAll: () => void;
}

export const WebSessionsCard: React.FC<WebSessionsCardProps> = ({
  webSessions,
  loading,
  readOnly,
  currentSessionId,
  revokingId,
  targetId,
  onRevokeSession,
  onRevokeAll,
}) => (
  <div data-guide="settings-sessions" className={cardClass}>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">نشست‌های وب</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">دستگاه‌هایی که با حساب شما وارد شده‌اند.</p>
      </div>
      {!readOnly && webSessions.length > 1 && (
        <button
          onClick={onRevokeAll}
          disabled={targetId === '__all__'}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shrink-0 disabled:opacity-50"
        >
          {targetId === '__all__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          خروج از سایر دستگاه‌ها
        </button>
      )}
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-10 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    ) : webSessions.length === 0 ? (
      <p className="text-sm text-slate-400 py-8 text-center">هنوز نشست وب فعالی ثبت نشده است.</p>
    ) : (
      <ul className="mt-4 space-y-2.5">
        {webSessions.map((s) => {
          const isCurrent = s.id === currentSessionId;
          const Icon = deviceIcon(s.device_label);
          return (
            <li
              key={s.id}
              className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 p-3.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{s.device_label}</p>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  آخرین فعالیت: {formatPersianDateAsUTC(s.last_seen_at, true)} ساعت {formatPersianTimeAsUTC(s.last_seen_at)}
                </p>
              </div>
              {!isCurrent && !readOnly && (
                <button
                  onClick={() => onRevokeSession(s.id)}
                  disabled={revokingId === s.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 text-[11px] font-bold transition-all shrink-0 disabled:opacity-50"
                >
                  {revokingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  خروج
                </button>
              )}
              {isCurrent && <span className="text-[11px] text-slate-400 px-1 shrink-0">دستگاه فعلی</span>}
            </li>
          );
        })}
      </ul>
    )}
  </div>
);