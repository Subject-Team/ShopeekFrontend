import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { resendVerificationApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface RestrictionBannerProps {
  user: User | null;
}

export const RestrictionBanner: React.FC<RestrictionBannerProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (!user || !user.is_read_only) return null;

  const reasons = Array.isArray(user.restriction_reasons) ? user.restriction_reasons : [];
  const hasUnverified = reasons.includes('email_unverified');

  const lines: string[] = [];
  if (hasUnverified) {
    lines.push('ایمیل حساب شما تأیید نشده است. لطفاً از طریق لینک ارسال‌شده در ایمیل، حساب خود را فعال کنید.');
  } else {
    lines.push('اشتراک حساب کاربری شما به پایان رسیده است.');
  }
  lines.push('در این حالت امکان ثبت تراکنش، ایجاد مشتری، ثبت یادداشت، تولید پیشنهادات هوشمند و پیش‌بینی و ارسال پیام به دستیار وجود ندارد.');

  const fa = (s: number) => new Intl.NumberFormat('fa-IR').format(s);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const res = await resendVerificationApi(user.email);
      showToast(res.message || 'لینک تأیید مجدداً برای شما ارسال شد.', 'success');
      setCooldown(30);
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
      setResending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 p-4 mb-6 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-extrabold text-sm text-rose-800 dark:text-rose-300">
            <span>دسترسی «فقط‌-خواندنی»</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 font-bold">
              {fa(reasons.length)}
            </span>
          </div>
          <ul className="text-xs leading-relaxed mt-2 space-y-1 list-disc pr-4">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 dark:text-rose-200/80">
          {hasUnverified ? 'پس از تأیید ایمیل، دسترسی کامل فعال خواهد شد.' : 'جهت رفع محدودیت، با پشتیبانی شاپیک در تماس باشید.'}
        </span>
        {hasUnverified ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline underline-offset-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>
              {resending
                ? 'در حال ارسال...'
                : cooldown > 0
                  ? `ارسال مجدد لینک (${cooldown}ثانیه)`
                  : 'ارسال مجدد لینک تأیید ایمیل'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline underline-offset-4 text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>تماس با پشتیبانی</span>
          </button>
        )}
      </div>
    </div>
  );
};