export const LOW_CREDIT_THRESHOLD = 30;

export const USAGE_NEAR_LIMIT_PERCENT = 90;

export const PAYG_COSTS: Record<string, number> = {
  daily_ai_run_limit: 3,
  invoice_daily_limit: 2,
  invoice_monthly_limit: 2,
};

export const CREDIT_ALERT_SITES: { key: string; label: string }[] = [
  { key: 'chat', label: 'ارسال پیام به دستیار هوشمند' },
  { key: 'advisory', label: 'تولید پیشنهاد هوشمند' },
  { key: 'invoice_direct', label: 'ثبت فاکتور مستقیم' },
  { key: 'invoice_batch', label: 'بارگذاری دسته‌ای فاکتور' },
  { key: 'bot', label: 'ربات تلگرام' },
];

export type UsageState = 'normal' | 'near' | 'over';

export const usageStateOf = (used: number, limit: number | null): UsageState => {
  if (limit === null || limit <= 0) return 'normal';
  const percent = Math.min(100, Math.round((used / limit) * 100));
  if (percent >= 100) return 'over';
  if (percent >= USAGE_NEAR_LIMIT_PERCENT) return 'near';
  return 'normal';
};

export const USAGE_BAR_CLASSES: Record<UsageState, string> = {
  normal: 'bg-sky-500',
  near: 'bg-amber-500',
  over: 'bg-rose-500',
};

export const USAGE_TEXT_CLASSES: Record<UsageState, string> = {
  normal: 'text-slate-700 dark:text-slate-200',
  near: 'text-amber-600 dark:text-amber-400',
  over: 'text-rose-600 dark:text-rose-400',
};
