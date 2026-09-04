import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, MessageSquare } from 'lucide-react';
import { User } from '../../types';

interface RestrictionBannerProps {
  user: User | null;
}

export const RestrictionBanner: React.FC<RestrictionBannerProps> = ({ user }) => {
  const navigate = useNavigate();

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
        <button
          type="button"
          onClick={() => navigate('/contact')}
          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline underline-offset-4 text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>تماس با پشتیبانی</span>
        </button>
      </div>
    </div>
  );
};