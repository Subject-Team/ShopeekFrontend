import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { CreditIcon } from '../components/icons';

import { fetchBillingOverview } from '../services/api';
import type {
  BillingCreditTransaction,
  BillingOverview,
  BillingUsage,
} from '../types';
import { planLabel, USAGE_LABELS, SOURCE_LABELS, featureLabel } from '../config/plansDisplay';
import { LOW_CREDIT_THRESHOLD, usageStateOf, USAGE_BAR_CLASSES, USAGE_TEXT_CLASSES } from '../config/credits';
import { useBillingContext } from '../context/BillingContext';
import { toGroupedPersianDigits, toPersianDigits } from '../utils/persian';
import { formatJalaliNumeric, relativeJalaliDayLabel } from '../utils/persian/date';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: {
    label: 'فعال',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  },
  trial: {
    label: 'دوره آزمایشی',
    className:
      'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  },
  expired: {
    label: 'منقضی شده',
    className:
      'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  },
  exempt: {
    label: 'دسترسی کامل',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  },
};

const UsageRow: React.FC<{ usage: BillingUsage }> = ({ usage }) => {
  const state = usageStateOf(usage.used, usage.limit);
  const isUnlimited = usage.limit === null;
  const limitLabel = usage.limit === null ? null : toGroupedPersianDigits(usage.limit);
  return (
    <div data-guide="subscription-usage-row">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{USAGE_LABELS[usage.feature_key] || usage.feature_key}</span>
        <span className={`font-medium ${isUnlimited ? 'text-slate-800 dark:text-slate-200' : USAGE_TEXT_CLASSES[state]}`}>
          {toGroupedPersianDigits(usage.used)}
          {' / '}
          {limitLabel ?? 'نامحدود'}
        </span>
      </div>
      {!isUnlimited && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-1.5 rounded-full ${USAGE_BAR_CLASSES[state]}`}
            style={{ width: `${Math.min(100, Math.round((usage.used / (usage.limit || 1)) * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
};

const LedgerRow: React.FC<{ tx: BillingCreditTransaction }> = ({ tx }) => (
  <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
    <td className={`py-2 font-medium ${tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {tx.amount >= 0 ? '+' : '−'}
      {toGroupedPersianDigits(Math.abs(tx.amount))}
    </td>
    <td className="py-2 text-slate-600 dark:text-slate-400">{SOURCE_LABELS[tx.source] || tx.source}</td>
    <td className="py-2 text-slate-500 dark:text-slate-400">{tx.feature_key ? featureLabel(tx.feature_key) : '—'}</td>
    <td className="py-2 text-slate-400 dark:text-slate-500">{relativeJalaliDayLabel(tx.created_at)}</td>
  </tr>
);

export const SubscriptionPage: React.FC = () => {
  const { billing: contextBilling, isLoading: contextLoading, error: contextError } = useBillingContext();
  const [localOverview, setLocalOverview] = useState<BillingOverview | null>(null);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');

  useEffect(() => {
    // If context doesn't have data yet and isn't loading, load directly as fallback
    if (!contextBilling && !contextLoading && !contextError) {
      let active = true;
      setLocalLoading(true);
      fetchBillingOverview()
        .then((data) => {
          if (active) setLocalOverview(data);
        })
        .catch((err) => {
          if (active) setLocalError(err.message || 'خطا در دریافت اطلاعات');
        })
        .finally(() => {
          if (active) setLocalLoading(false);
        });
      return () => {
        active = false;
      };
    }
  }, [contextBilling, contextLoading, contextError]);

  const overview = contextBilling || localOverview;
  const loading = contextLoading || (localLoading && !overview);
  const error = contextError || localError;

  if (loading) {
    return (
      <div className="p-6 text-slate-500 dark:text-slate-400" data-guide="subscription-loading">
        در حال دریافت اطلاعات اشتراک...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 text-rose-600 dark:text-rose-400" data-guide="subscription-error">
        {error || 'اطلاعات اشتراک در دسترس نیست.'}
      </div>
    );
  }

  const { plan, wallet, usage, ledger, stats } = overview;
  const status = STATUS_LABELS[plan.status] || {
    label: plan.status,
    className:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  };
  const planName = plan.name_fa || planLabel(plan.key);
  const walletView = wallet ?? {
    monthly_balance: 0,
    purchased_balance: 0,
    pending_session_charge: 0,
    pending_account_charge: 0,
  };
  const hasDebt = walletView.purchased_balance < 0;
  const isLowCredit =
    wallet !== null &&
    !hasDebt &&
    walletView.monthly_balance + walletView.purchased_balance <= LOW_CREDIT_THRESHOLD;

  return (
    <div className="space-y-6 p-6">
      {/* Plan status */}
      <section
        data-guide="subscription-plan-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-sky-600 dark:text-sky-400" />
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
            <p className="text-xs text-slate-500 dark:text-slate-400">طرح فعلی</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{planName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">روزهای باقی‌مانده</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {plan.is_exempt || plan.remaining_days === null
                ? 'نامحدود'
                : toPersianDigits(plan.remaining_days)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">پایان اشتراک</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {plan.next_payment_due
                ? toPersianDigits(formatJalaliNumeric(plan.next_payment_due))
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Wallet */}
      <section
        data-guide="subscription-wallet-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <CreditIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">کیف پول اعتبار</h3>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">اعتبار ماهانه</p>
            <p className={`text-lg font-bold ${isLowCredit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {toGroupedPersianDigits(walletView.monthly_balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">اعتبار خریداری‌شده</p>
            <p className={`text-lg font-bold ${hasDebt ? 'text-rose-600 dark:text-rose-400' : isLowCredit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {toGroupedPersianDigits(walletView.purchased_balance)}
            </p>
            {hasDebt && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                بدهی: {toGroupedPersianDigits(Math.abs(walletView.purchased_balance))} اعتبار — تا تسویه، ورود و ثبت داده مسدود است
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">در انتظار تسویه (نشست)</p>
            <p className={`text-lg font-bold ${walletView.pending_session_charge !== 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {toGroupedPersianDigits(walletView.pending_session_charge)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">در انتظار تسویه (تلگرام)</p>
            <p className={`text-lg font-bold ${walletView.pending_account_charge !== 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {toGroupedPersianDigits(walletView.pending_account_charge)}
            </p>
          </div>
        </div>
      </section>

      {/* Usage vs limits */}
      <section
        data-guide="subscription-usage-card"
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <CreditIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
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
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>
            مجموع شارژ: <b className="text-emerald-600 dark:text-emerald-400">{toGroupedPersianDigits(stats.total_granted)}</b>
          </span>
          <span>
            مجموع مصرف: <b className="text-rose-600 dark:text-rose-400">{toGroupedPersianDigits(stats.total_spent)}</b>
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
              <tr className="text-xs text-slate-400 dark:text-slate-500">
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
            <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">هنوز تراکنشی ثبت نشده است.</p>
          )}
        </div>
      </section>
    </div>
  );
};
