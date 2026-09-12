import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Sparkles } from 'lucide-react';
import type { BillingOverview, BillingUsage } from '../../types';
import { USAGE_LABELS, featureLabel, planLabel } from '../../config/plansDisplay';
import { toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';
import { formatJalaliNumeric, getDayDifference, toIsoDate } from '../../utils/persian/date';

interface PlanCreditOverviewCardProps {
  overview: BillingOverview | null;
}

const PLAN_STATUS_CHIPS: Record<string, { label: string; className: string }> = {
  active: {
    label: 'فعال',
    className:
      'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  },
  trial: {
    label: 'دوره آزمایشی',
    className:
      'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  },
  expired: {
    label: 'منقضی شده',
    className:
      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  },
};

const EXEMPT_CHIP = {
  label: 'دسترسی کامل',
  className:
    'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
};

const UsageMiniRow: React.FC<{ usage: BillingUsage }> = ({ usage }) => {
  const percent =
    usage.limit && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0;
  const isNearLimit = usage.limit !== null && percent >= 90;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {USAGE_LABELS[usage.feature_key] || featureLabel(usage.feature_key)}
        </span>
        <span className={`font-bold ${isNearLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {toGroupedPersianDigits(usage.used)}
          {usage.limit === null ? ' — نامحدود' : ` از ${toGroupedPersianDigits(usage.limit)}`}
        </span>
      </div>
      {usage.limit !== null && (
        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-1 rounded-full ${isNearLimit ? 'bg-rose-500' : 'bg-sky-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const PlanCreditOverviewCard: React.FC<PlanCreditOverviewCardProps> = ({ overview }) => {
  const navigate = useNavigate();

  if (!overview) return null;

  const { plan, wallet, usage } = overview;
  const isExempt = plan.is_exempt;
  const planName = plan.name_fa || planLabel(plan.key);
  const chip = isExempt
    ? EXEMPT_CHIP
    : PLAN_STATUS_CHIPS[plan.status] || {
        label: plan.status,
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      };
  const hasDebt = wallet !== null && wallet.purchased_balance < 0;

  const todayIso = toIsoDate(new Date());
  const periodStart = plan.current_period_started_at ? plan.current_period_started_at.slice(0, 10) : null;
  const periodDue = plan.next_payment_due ? plan.next_payment_due.slice(0, 10) : null;
  let periodPercent: number | null = null;
  if (!isExempt && periodStart && periodDue) {
    const totalDays = getDayDifference(periodStart, periodDue);
    const elapsedDays = Math.min(Math.max(getDayDifference(periodStart, todayIso), 1), totalDays);
    periodPercent =
      totalDays > 1 ? Math.round(((elapsedDays - 1) / (totalDays - 1)) * 100) : 100;
    periodPercent = Math.min(100, Math.max(0, periodPercent));
  }

  return (
    <div
      data-guide="dashboard-plan-overview"
      className="glass-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
    >
      {/* Header: plan name + status chip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">طرح و اعتبار</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{planName}</p>
          </div>
        </div>
        <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${chip.className}`}>
          {chip.label}
        </span>
      </div>

      {/* Period progress (or unlimited access for exempt plans) */}
      {isExempt || !periodPercent ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">دسترسی نامحدود</span>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">بدون محدودیت زمانی</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              شروع دوره:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {periodStart ? toPersianDigits(formatJalaliNumeric(periodStart)) : '—'}
              </span>
            </span>
            <span>
              سررسید بعدی:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {periodDue ? toPersianDigits(formatJalaliNumeric(periodDue)) : '—'}
              </span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-l from-sky-500 to-emerald-400 transition-all"
              style={{ width: `${periodPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              {toPersianDigits(periodPercent)}٪ دوره سپری شده
            </span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {plan.remaining_days === null
                ? 'نامحدود'
                : `${toGroupedPersianDigits(plan.remaining_days)} روز باقی‌مانده`}
            </span>
          </div>
        </div>
      )}

      {/* Wallet balances */}
      {wallet && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">اعتبار دوره</p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {toGroupedPersianDigits(wallet.monthly_balance)}
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500"> اعتبار</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">اعتبار خریداری‌شده</p>
            <p className={`text-base font-black mt-0.5 ${hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {toGroupedPersianDigits(wallet.purchased_balance)}
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500"> اعتبار</span>
            </p>
            {hasDebt && (
              <p className="mt-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
                بدهی: {toGroupedPersianDigits(Math.abs(wallet.purchased_balance))} اعتبار — پرداخت آن ورود داده را مسدود می‌کند
              </p>
            )}
          </div>
        </div>
      )}

      {/* Usage vs quota mini-rows */}
      {usage.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>مصرف سهمیه‌ها</span>
          </div>
          {usage.map((u) => (
            <UsageMiniRow key={u.feature_key} usage={u} />
          ))}
        </div>
      )}

      {/* Link to full plan & payment page */}
      <button
        type="button"
        onClick={() => navigate('/dashboard/subscription')}
        className="flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
      >
        <span>مشاهده جزئیات اشتراک و پرداخت</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};
