import type { PublicPlan } from '../types';

// Fallback catalog so /plans stays reviewable without a backend.
// Mirrors the current lite/pro seed values; replaced by the API response when reachable.
export const DEMO_PUBLIC_PLANS: PublicPlan[] = [
  {
    key: 'lite',
    name_fa: 'لایت',
    sort_order: 1,
    monthly_credit_grant: 100,
    prices: [
      { duration_months: 1, price_toman: 290000 },
      { duration_months: 3, price_toman: 780000 },
    ],
    features: [
      { feature_key: 'invoice_daily_limit', enabled: true, limit_value: 10, payg_cost: 2 },
      { feature_key: 'invoice_monthly_limit', enabled: true, limit_value: 200, payg_cost: 2 },
      { feature_key: 'daily_ai_run_limit', enabled: true, limit_value: 20, payg_cost: 5 },
      { feature_key: 'web_sessions', enabled: true, limit_value: 3, payg_cost: 30 },
      { feature_key: 'telegram_accounts', enabled: true, limit_value: 1, payg_cost: 20 },
      { feature_key: 'advisory_scheduling', enabled: false, limit_value: null, payg_cost: null },
      { feature_key: 'custom_scheduling', enabled: false, limit_value: null, payg_cost: null },
      { feature_key: 'import_export', enabled: true, limit_value: null, payg_cost: null },
      { feature_key: 'forecast_lookback_days', enabled: true, limit_value: 30, payg_cost: null },
    ],
  },
  {
    key: 'pro',
    name_fa: 'پرو',
    sort_order: 2,
    monthly_credit_grant: 250,
    prices: [
      { duration_months: 1, price_toman: 570000 },
      { duration_months: 3, price_toman: 1560000 },
      { duration_months: 6, price_toman: 2820000 },
    ],
    features: [
      { feature_key: 'invoice_daily_limit', enabled: true, limit_value: 25, payg_cost: 2 },
      { feature_key: 'invoice_monthly_limit', enabled: true, limit_value: 600, payg_cost: 2 },
      { feature_key: 'daily_ai_run_limit', enabled: true, limit_value: 60, payg_cost: 5 },
      { feature_key: 'web_sessions', enabled: true, limit_value: 6, payg_cost: 30 },
      { feature_key: 'telegram_accounts', enabled: true, limit_value: 3, payg_cost: 20 },
      { feature_key: 'advisory_scheduling', enabled: true, limit_value: null, payg_cost: null },
      { feature_key: 'custom_scheduling', enabled: true, limit_value: null, payg_cost: null },
      { feature_key: 'import_export', enabled: true, limit_value: null, payg_cost: null },
      { feature_key: 'forecast_lookback_days', enabled: true, limit_value: 90, payg_cost: null },
    ],
  },
];
