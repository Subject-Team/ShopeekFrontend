// Shared Persian display labels for plans/credits across pages
// (SubscriptionPage, PlansPage).

export const PLAN_LABELS: Record<string, string> = {
  lite: 'لایت',
  pro: 'پرو',
  trial: 'دوره آزمایشی',
  lifetime: 'دسترسی مادام‌العمر',
};

export const SOURCE_LABELS: Record<string, string> = {
  purchase: 'خرید اعتبار',
  admin_grant: 'هدیه پشتیبانی',
  period_grant: 'شارژ دوره',
  deduction: 'مصرف اعتبار',
};

export const FEATURE_LABELS: Record<string, string> = {
  invoice_daily_limit: 'فاکتور روزانه',
  invoice_monthly_limit: 'فاکتور ماهانه',
  daily_ai_run_limit: 'درخواست هوش مصنوعی',
  web_sessions: 'نشست وب فعال',
  telegram_accounts: 'حساب تلگرام',
  advisory_scheduling: 'زمان‌بندی مشاوره',
  forecast_scheduling: 'زمان‌بندی پیش‌بینی',
  custom_scheduling: 'زمان‌بندی دلخواه',
  import_export: 'خروجی/ورودی داده',
  forecast_lookback_days: 'بازه داده پیش‌بینی',
};

export const USAGE_LABELS: Record<string, string> = {
  invoice_daily_limit: 'فاکتور ثبت‌شده امروز',
  invoice_monthly_limit: 'فاکتور این دوره',
  daily_ai_run_limit: 'درخواست هوش مصنوعی امروز',
};

export const featureLabel = (key: string | null): string =>
  (key && FEATURE_LABELS[key]) || 'سایر';

export const planLabel = (key: string | null): string =>
  (key && PLAN_LABELS[key]) || 'بدون طرح';
