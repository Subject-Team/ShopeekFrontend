import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, Home, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react';
import { resendVerificationApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';

const RESEND_COOLDOWN_SECONDS = 30;

export const VerifyEmailPage: React.FC = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email
    || new URLSearchParams(location.search).get('email')
    || '';

  const [email, setEmail] = useState<string>(initialEmail);
  const [emailField, setEmailField] = useState<string>(initialEmail === '' ? '' : initialEmail);
  const [editing, setEditing] = useState<boolean>(initialEmail === '');
  const [sending, setSending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const handleResend = async () => {
    const targetEmail = (editing ? emailField : email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
      return;
    }

    setSending(true);
    try {
      const res = await resendVerificationApi(targetEmail);
      setEmail(targetEmail);
      setEditing(false);
      showToast(res.message || 'لینک تأیید مجدداً برای شما ارسال شد.', 'success');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'خطا در ارسال مجدد لینک تأیید', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      <SEO
        title="تأیید ایمیل | شاپیک"
        description="پس از ثبت‌نام، با کلیک بر روی لینک ارسال‌شده در ایمیل، حساب کاربری خود را در شاپیک فعال کنید."
        canonicalPath="/verify-email"
      />

      {/* Sticky Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <Home className="w-4 h-4 text-brand-600" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>

          <span className="text-xs text-slate-500 font-semibold">سامانه تحلیلی شاپیک</span>
        </div>
      </header>

      {/* Ambient Decorative Backdrops */}
      <div className="absolute top-10 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4 my-8 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mx-auto mb-2">
              <MailCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">تأیید حساب کاربری</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              یک لینک تأیید برای ایمیل شما ارسال شده است؛ برای فعال‌سازی حساب، روی لینک داخل ایمیل کلیک کنید.
            </p>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                اگر حساب شما با نشانی ایمیل <strong className="font-bold text-slate-900">{email || '—'}</strong> ثبت شده است، پس از تأیید می‌توانید وارد سامانه شوید.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-500">
              <span className="shrink-0">•</span>
              <span>در صورت عدم دریافت ایمیل، پوشه «هرزنامه» (Spam) را بررسی کنید.</span>
            </div>
          </div>

          {/* Resend Form */}
          <div className="space-y-3">
            {editing && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">نشانی ایمیل</label>
                <input
                  type="email"
                  dir="ltr"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none transition-all"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {sending ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {cooldown > 0 ? `ارسال مجدد لینک پس از ${cooldown} ثانیه` : 'ارسال مجدد لینک تأیید'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Side Actions */}
          <div className="pt-1 space-y-2">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all"
            >
              <span>ورود به حساب کاربری</span>
            </Link>
            <Link
              to="/contact"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-brand-600 hover:text-brand-700 text-xs font-bold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>در صورت نیاز، با پشتیبانی در تماس باشید</span>
            </Link>
          </div>
        </div>
      </main>

      <div className="mt-8 shrink-0">
        <MinimalFooter />
      </div>
    </div>
  );
};