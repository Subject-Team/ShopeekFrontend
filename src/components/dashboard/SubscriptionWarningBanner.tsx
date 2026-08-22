import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { User } from '../../types';
import { formatPersianDate, formatPersianNumber } from '../../utils';

interface SubscriptionWarningBannerProps {
  user: User | null;
}

export const SubscriptionWarningBanner: React.FC<SubscriptionWarningBannerProps> = ({ user }) => {
  if (!user) return null;

  const isInfinite = Boolean(user.is_infinite_subscription);
  const isActive = user.is_subscription_active ?? true;
  const remainingDays = user.remaining_days ?? 0;

  // Render warning only if user is active, non-infinite, and remaining_days <= 7
  if (isInfinite || !isActive || remainingDays > 7) {
    return null;
  }

  const formattedDate = user.subscription_expires_at ? formatPersianDate(user.subscription_expires_at, true) : '';

  return (
    <div className="glass-card p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-extrabold text-sm text-amber-800 dark:text-amber-300">
            <span>هشدار تمدید اشتراک</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 font-bold">
              {formatPersianNumber(remainingDays)} روز تا انقضا
            </span>
          </div>
          <p className="text-xs leading-relaxed mt-1 text-slate-700 dark:text-amber-200/90">
            اشتراک حساب شما در تاریخ <strong className="font-bold">{formattedDate}</strong> به پایان می‌رسد. جهت جلوگیری از قطع دسترسی و ادامه بهره‌مندی از امکانات تحلیلی شاپیک، نسبت به تمدید اشتراک خود اقدام کنید.
          </p>
        </div>
      </div>
    </div>
  );
};
