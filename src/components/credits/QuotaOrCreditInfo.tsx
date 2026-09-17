import React from 'react';
import { Gauge } from 'lucide-react';
import type { BillingUsage } from '../../types';
import { PAYG_COSTS } from '../../config/credits';
import { toGroupedPersianDigits } from '../../utils/persian';

interface QuotaOrCreditInfoProps {
  usage: BillingUsage | null;
  units: number;
  featureKey: string;
}

/**
 * Info line shown beside a usage action (#155):
 * - unlimited plan axis  → free/unlimited
 * - quota not reached    → remaining quota (no credit talk)
 * - quota exhausted      → wallet charge warning
 * - batch crossing limit → both parts (free + paid)
 */
export const QuotaOrCreditInfo: React.FC<QuotaOrCreditInfoProps> = ({ usage, units, featureKey }) => {
  const paygCost = usage?.payg_cost ?? PAYG_COSTS[featureKey] ?? 1;

  if (!usage || usage.limit === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
        <Gauge className="w-3.5 h-3.5" />
        <span>نامحدود — بدون برداشت اعتبار</span>
      </span>
    );
  }

  const quotaLeft = usage.remaining !== undefined && usage.remaining !== null
    ? usage.remaining
    : Math.max(0, usage.limit - usage.used);

  if (units <= quotaLeft) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
        <Gauge className="w-3.5 h-3.5" />
        <span>سهمیه باقی‌مانده امروز: {toGroupedPersianDigits(quotaLeft)} از {toGroupedPersianDigits(usage.limit)}</span>
      </span>
    );
  }

  if (quotaLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
        <Gauge className="w-3.5 h-3.5" />
        <span>سهمیه امروز تکمیل شده — این عملیات {toGroupedPersianDigits(units * paygCost)} اعتبار برداشت می‌کند</span>
      </span>
    );
  }

  const overage = units - quotaLeft;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold">
      <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
        <Gauge className="w-3.5 h-3.5" />
        <span>{toGroupedPersianDigits(quotaLeft)} مورد در سهمیه رایگان</span>
      </span>
      <span className="text-amber-600 dark:text-amber-400">
        + {toGroupedPersianDigits(overage)} مورد با اعتبار ({toGroupedPersianDigits(overage * paygCost)} اعتبار)
      </span>
    </span>
  );
};
