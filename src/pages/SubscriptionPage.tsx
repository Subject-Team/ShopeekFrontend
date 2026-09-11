import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Sparkles, Wallet } from 'lucide-react';

import { fetchBillingOverview } from '../services/api';
import type {
  BillingCreditTransaction,
  BillingOverview,
  BillingUsage,
} from '../types';
import { toGroupedPersianDigits, toPersianDigits } from '../utils/persian';
import { formatJalaliNumeric } from '../utils/persian/date';

const PLAN_LABELS: Record<string, string> = {
  lite: 'لایت',
  pro: 'پرو',
  trial: 'دوره آزمایشی',
  lifetime: 'دسترسی مادام‌العمر',
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'فعال', className: 'bg-emerald-100 text-emerald-700' },
  trial: { label: 'دوره آزمایشی', className: 'bg-sky-100 text-sky-700' },
  expired: { label: 'منقضی شده', className: 'bg-rose-100 text-rose-700' },
  exempt: { label: 'دسترسی کامل', className: 'bg-violet-100 text-violet-700' },
};

const SOURCE_LABELS: Record<string, string> = {
  purchase: 'خرید اعتبار',
  admin_grant: 'هدیه پشتیبانی',
  period_grant: 'شارژ دوره',
  deduction: 'مصرف اعتبار',
};

const FEATURE_LABELS: Record<string, string> = {
  invoice_daily_limit: 'فاکتور روزانه',
  invoice_monthly_limit: 'فاکتور ماهانه',
  daily_ai_run_limit: 'درخواست هوش مصنوعی',
  web_sessions: 'نشست وب فعال',
  telegram_accounts: 'حساب تلگرام',
};

const USAGE_LABELS: Record<string, string> = {
  invoice_daily_limit: 'فاکتور ثبت‌شده امروز',
  invoice_monthly_limit: 'فاکتور این دوره',
  daily_ai_run_limit: 'درخواست هوش مصنوعی امروز',
};

const featureLabel = (key: string | null): string =>
  (key && FEATURE_LABELS[key]) || 'سایر';

const UsageRow: React.FC<{ usage: BillingUsage }> = ({ usage }) => {
  const percent =
    usage.limit && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0;
  return (
    <div data-guide="subscription-usage-row">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{USAGE_LABELS[usage.feature_key] || usage.feature_key}</span>
        <span className="font-medium text-slate-800">
          {toGroupedPersianDigits(usage.used)}
          {' / '}
          {usage.limit === null ? 'نامحدود' : toGroupedPersianDigits(usage.limit)}
        </span>
      </div>
      {usage.limit !== null && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
          <div
            className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-sky-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

const LedgerRow: React.FC<{ tx: BillingCreditTransaction }> = ({ tx }) => (
  <tr className="border-b border-slate-100 last:border-0">
    <td className={`py-2 font-medium ${tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
      {tx.amount >= 0 ? '+' : '−'}
      {toGroupedPersianDigits(Math.abs(tx.amount))}
    </td>
    <td className="py-2 text-slate-600">{SOURCE_LABELS[tx.source] || tx.source}</td>
    <td className="py-2 text-slate-500">{tx.feature_key ? featureLabel(tx.feature_key) : '—'}</td>
    <td className="py-2 text-slate-400">{toPersianDigits(formatJalaliNumeric(tx.created_at))}</td>
  </tr>
);

export const SubscriptionPage: React.FC = () => {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchBillingOverview();
        if (active) setOverview(data);
      } catch (err: any) {
        if (active) setError(err.message || 'خطا در دریافت اطلاعات');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-500" data-guide="subscription-loading">
        در حال دریافت اطلاعات اشتراک...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 text-rose-600" data-guide="subscription-error">
        {error || 'اطلاعات اشتراک در دسترس نیست.'}
      </div>
    );
  }

  const { plan, wallet, usage, ledger, stats } = overview;
  const status = STATUS_LABELS[plan.status] || {
    label: plan.status,
    className: 'bg-slate-100 text-slate-600',
  };
  const planName = plan.name_fa || (plan.key && PLAN_LABELS[plan.key]) || 'بدون طرح';
  const hasDebt = wallet !== null && wallet.purchased_balance < 0;

  return (
    <div className="space-y-6 p-6">
      {/* Plan status */}
      <section
        data-guide="subscription-plan-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">اشتراک و پرداخت</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
          {!plan.is_exempt && (
            <Link
              to="/plans"
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              مشاهده و ارتقا طرح‌ها
            </Link>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">طرح فعلی</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{planName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">روزهای باقی‌مانده</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {plan.is_exempt || plan.remaining_days === null
                ? 'نامحدود'
                : toPersianDigits(plan.remaining_days)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">سررسید بعدی</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {plan.next_payment_due
                ? toPersianDigits(formatJalaliNumeric(plan.next_payment_due))
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Wallet */}
      {wallet && (
        <section
          data-guide="subscription-wallet-card"
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">کیف پول اعتبار</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">اعتبار دوره</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {toGroupedPersianDigits(wallet.monthly_balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">اعتبار خریداری‌شده</p>
              <p className={`text-lg font-bold ${hasDebt ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
                {toGroupedPersianDigits(wallet.purchased_balance)}
              </p>
              {hasDebt && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  بدهی: {toGroupedPersianDigits(Math.abs(wallet.purchased_balance))} اعتبار — پرداخت آن ورود و ثبت داده را مسدود می‌کند
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">در انتظار تسویه (نشست)</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {toGroupedPersianDigits(wallet.pending_session_charge)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">در انتظار تسویه (تلگرام)</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {toGroupedPersianDigits(wallet.pending_account_charge)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Usage vs limits */}
      <section
        data-guide="subscription-usage-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">مصرف در برابر سهمیه</h3>
        </div>
        <div className="mt-4 space-y-4">
          {usage.map(u => (
            <UsageRow key={u.feature_key} usage={u} />
          ))}
        </div>
      </section>

      {/* Ledger */}
      <section
        data-guide="subscription-ledger-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="font-bold text-slate-800 dark:text-slate-100">تاریخچه اعتبار</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>
            مجموع شارژ: <b className="text-emerald-600">{toGroupedPersianDigits(stats.total_granted)}</b>
          </span>
          <span>
            مجموع مصرف: <b className="text-rose-600">{toGroupedPersianDigits(stats.total_spent)}</b>
          </span>
          {Object.entries(stats.spend_by_feature).map(([key, amount]) => (
            <span key={key}>
              {featureLabel(key)}: <b>{toGroupedPersianDigits(amount)}</b>
            </span>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-sm" dir="rtl">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="pb-2">تغییر</th>
                <th className="pb-2">نوع</th>
                <th className="pb-2">بخش</th>
                <th className="pb-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((tx, idx) => (
                <LedgerRow key={`${tx.created_at}-${idx}`} tx={tx} />
              ))}
            </tbody>
          </table>
          {ledger.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">هنوز تراکنشی ثبت نشده است.</p>
          )}
        </div>
      </section>
    </div>
  );
};
