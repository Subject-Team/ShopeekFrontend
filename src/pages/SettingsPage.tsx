import React, { useCallback, useEffect, useState } from 'react';
import {
  Eye, EyeOff, KeyRound, Laptop, Loader2, Lock, LogOut, MessageSquare, Monitor, RefreshCcw, ShieldCheck, Smartphone, User as UserIcon, XCircle,
} from 'lucide-react';
import {
  fetchSettings,
  revokeWebSession,
  revokeAllOtherSessions,
  unlinkTelegramSession,
  changePassword,
  getWebSessionId,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChangePasswordPayload, SettingsData } from '../types';
import { formatPersianDateAsUTC, formatPersianTimeAsUTC } from '../utils';
import { SEO } from '../components/common/SEO';
import { analyzePassword } from '../utils/passwordStrength';

const deviceIcon = (label: string) => {
  const l = (label || '').toLowerCase();
  if (l.includes('android') || l.includes('ios')) return <Smartphone className="w-5 h-5" />;
  if (l.includes('mac') || l.includes('windows') || l.includes('linux')) return <Monitor className="w-5 h-5" />;
  return <Laptop className="w-5 h-5" />;
};

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

const tabItemClass = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
    active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
  }`;

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
  const passwordAnalysis = analyzePassword(newPassword, confirmNewPassword);
  const passwordValid =
    passwordAnalysis.hasMinLength &&
    passwordAnalysis.hasLower &&
    passwordAnalysis.hasUpper &&
    passwordAnalysis.hasSymbol &&
    passwordAnalysis.hasDigit &&
    passwordAnalysis.isMatching;

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!passwordValid || !currentPassword) {
      showToast('لطفاً همه فیلدها را به درستی تکمیل کنید.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload: ChangePasswordPayload = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      };
      const res = await changePassword(payload);
      showToast(res.message || 'کلمه عبور شما با موفقیت تغییر کرد.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setHasSubmitted(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در تغییر کلمه عبور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const webSessions = data?.web_sessions ?? [];
  const telegramSessions = data?.telegram_sessions ?? [];

  const renderRule = (label: string, ok: boolean) => (
    <div
      className={`flex items-center gap-1.5 transition-colors ${
        ok ? 'text-emerald-700 font-medium' : hasSubmitted ? 'text-rose-600 font-medium' : 'text-slate-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          ok ? 'bg-emerald-500 ring-2 ring-emerald-100' : hasSubmitted ? 'bg-rose-500 ring-2 ring-rose-100' : 'bg-slate-300'
        }`}
      />
      <span>{label}</span>
    </div>
  );

  const renderWebSessions = () => (
    <div className={cardClass}>
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
                {isCurrent && <span className="text-[11px] text-slate-400 px-1 shrink-0">دستگاه فعلی</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const renderTelegram = () => (
    <div className={cardClass}>
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
  );

  const renderPasswordForm = () => (
    <div className={cardClass}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">تغییر کلمه عبور</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">برای حفظ امنیت حساب، کلمه عبور جدیدی انتخاب کنید.</p>
        </div>
      </div>

      {readOnly ? (
        <p className="text-sm text-amber-600 dark:text-amber-300 mt-5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> حساب‌های با دسترسی فقط‌خواندنی نمی‌توانند کلمه عبور خود را تغییر دهند.
        </p>
      ) : (
        <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">کلمه عبور فعلی</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showCurrent ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">کلمه عبور جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showNew ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword ? (
              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        seg <= passwordAnalysis.score ? passwordAnalysis.barColor : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className={`text-[11px] font-bold ms-1 ${passwordAnalysis.levelColor}`}>
                    {passwordAnalysis.levelLabel}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">تکرار کلمه عبور جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            {renderRule('حداقل ۸ کاراکتر', passwordAnalysis.hasMinLength)}
            {renderRule('حرف کوچک انگلیسی', passwordAnalysis.hasLower)}
            {renderRule('حرف بزرگ انگلیسی', passwordAnalysis.hasUpper)}
            {renderRule('عدد', passwordAnalysis.hasDigit)}
            {renderRule('علامت یا نماد خاص', passwordAnalysis.hasSymbol)}
            {renderRule('تطابق با تکرار', passwordAnalysis.isMatching)}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            تغییر کلمه عبور
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <SEO title="تنظیمات حساب" description="مدیریت نشست‌های وب و اتصال ربات تلگرام حساب شاپیک شما." />
      <div className="sr-only">
        <h1>تنظیمات حساب شاپیک</h1>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        <button onClick={() => setActiveTab('account')} className={tabItemClass(activeTab === 'account')}>
          <UserIcon className="w-4 h-4" /> حساب کاربری
        </button>
        <button onClick={() => setActiveTab('security')} className={tabItemClass(activeTab === 'security')}>
          <ShieldCheck className="w-4 h-4" /> امنیت
        </button>
      </div>

      {activeTab === 'account' && (
        <div className={cardClass}>
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
        </div>
      )}

      {activeTab === 'security' && (
        <>
          {renderPasswordForm()}
          {renderWebSessions()}
          {renderTelegram()}
        </>
      )}
    </div>
  );
};

export default SettingsPage;
