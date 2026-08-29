import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Globe, Laptop, Loader2, LogOut, MessageSquare, Monitor, RefreshCcw, Smartphone, User as UserIcon, XCircle } from 'lucide-react';
import {
  fetchSettings,
  revokeWebSession,
  revokeAllOtherSessions,
  unlinkTelegramSession,
  getWebSessionId,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SettingsData } from '../types';
import { formatPersianDateAsUTC, formatPersianTimeAsUTC } from '../utils';
import { SEO } from '../components/common/SEO';

const deviceIcon = (label: string) => {
  const l = (label || '').toLowerCase();
  if (l.includes('android') || l.includes('ios')) return <Smartphone className="w-5 h-5" />;
  if (l.includes('mac') || l.includes('windows') || l.includes('linux')) return <Monitor className="w-5 h-5" />;
  return <Laptop className="w-5 h-5" />;
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const { showToast } = useToast();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await fetchSettings();
      setData(d);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت تنظیمات', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const currentSessionId = getWebSessionId();

  const handleRevokeSession = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeWebSession(id);
      showToast('دستگاه مورد نظر از حساب شما خارج شد.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در خروج از دستگاه', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setTargetId('__all__');
    try {
      await revokeAllOtherSessions();
      showToast('سایر دستگاه‌ها از حساب شما خارج شدند.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در خروج از سایر دستگاه‌ها', 'error');
    } finally {
      setTargetId(null);
    }
  };

  const handleUnlinkTelegram = async (id: string) => {
    setRevokingId(id);
    try {
      await unlinkTelegramSession(id);
      showToast('اتصال ربات تلگرام قطع شد.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در قطع اتصال ربات تلگرام', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const webSessions = data?.web_sessions ?? [];
  const telegramSessions = data?.telegram_sessions ?? [];

  return (
    <div className="space-y-6">
      <SEO title="تنظیمات حساب" description="مدیریت نشست‌های وب و اتصال ربات تلگرام حساب شاپیک شما." />
      <div className="sr-only">
        <h1>تنظیمات حساب شاپیک</h1>
      </div>

      {/* Profile card */}
      <div className="glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <UserIcon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-lg truncate">
              {data?.profile.full_name || user?.full_name || 'کاربر'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" dir="ltr">
              {data?.profile.email || user?.email || ''}
            </p>
          </div>
          {readOnly && (
            <span className="ms-auto text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
              دسترسی فقط‌خواندنی
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> نقش
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{data?.profile.role || 'User'}</span>
          </div>
          <span className="hidden sm:block" />
          <span className="hidden sm:block" />
        </div>
      </div>

      {/* Web sessions */}
      <div className="glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">نشست‌های وب</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">دستگاه‌هایی که با حساب شما وارد شده‌اند.</p>
          </div>
          {!readOnly && webSessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
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
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 p-3.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    {deviceIcon(s.device_label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{s.device_label}</p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> این دستگاه
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      آخرین فعالیت: {formatPersianDateAsUTC(s.last_seen_at, true)} ساعت {formatPersianTimeAsUTC(s.last_seen_at)}
                    </p>
                  </div>
                  {!isCurrent && !readOnly && (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      disabled={revokingId === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 text-[11px] font-bold transition-all shrink-0 disabled:opacity-50"
                    >
                      {revokingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      خروج
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-[11px] text-slate-400 px-1 shrink-0">دستگاه فعلی</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Telegram sessions */}
      <div className="glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
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
                    onClick={() => handleUnlinkTelegram(t.id)}
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
    </div>
  );
};

export default SettingsPage;
