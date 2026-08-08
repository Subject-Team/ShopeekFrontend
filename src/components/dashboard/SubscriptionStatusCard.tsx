import React from 'react';
import { Calendar, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { formatJalaliDate, toPersianDigits } from '../../utils/dateUtils';

interface SubscriptionStatusCardProps {
  user: User | null;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ user }) => {
  if (!user) return null;

  const isInfinite = user.is_infinite_subscription || user.role === 'Admin';
  const isActive = user.is_subscription_active ?? true;
  const remainingDays = user.remaining_days ?? 0;
  const expiresAt = user.subscription_expires_at;

  return (
    <div className="glass-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
          <Calendar className="w-5 h-5 text-brand-500" />
          <h4 className="font-extrabold text-sm">وضعیت اشتراک حساب</h4>
        </div>
        {isInfinite ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            دائمی (دمو)
          </span>
        ) : isActive ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            <Clock className="w-3.5 h-3.5" />
            فعال
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            منقضی شده
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">زمان باقیمانده:</div>
        <div className="text-base font-black text-slate-900 dark:text-white">
          {isInfinite ? (
            <span className="text-emerald-600 dark:text-emerald-400">اشتراک نامحدود</span>
          ) : isActive ? (
            <span className="text-brand-600 dark:text-brand-400">
              {toPersianDigits(remainingDays)} روز باقی مانده
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">بدون اعتبار (۰ روز)</span>
          )}
        </div>
      </div>

      {!isInfinite && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span>تاریخ انقضای اشتراک:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {expiresAt ? formatJalaliDate(expiresAt) : 'تعریف‌نشده (صفر)'}
          </span>
        </div>
      )}
    </div>
  );
};
