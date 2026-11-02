import React from 'react';
import { UserCheck, UserPlus, Users2 } from 'lucide-react';
import { CustomerTypeMetrics } from '../../types';
import { shortTomaanWithUnit, toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';

interface CustomerRetentionCardProps {
  data: CustomerTypeMetrics;
}

export const CustomerRetentionCard: React.FC<CustomerRetentionCardProps> = ({ data }) => {
  const totalRev = data.new_customers_revenue + data.returning_customers_revenue;
  const hasData = totalRev > 0;

  return (
    <div className="glass-card p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
          <Users2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
            مشتریان جدید و وفادار
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            سهم درآمد حاصل از خریداران جدید در برابر مشتریان بازگشتی
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-4 pt-1">
          {/* Dual Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                مشتریان وفادار ({toPersianDigits(data.returning_customers_share)}٪)
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                خریداران جدید ({toPersianDigits(data.new_customers_share)}٪)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.max(2, data.returning_customers_share)}%` }}
              />
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${Math.max(2, data.new_customers_share)}%` }}
              />
            </div>
          </div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Returning Customers Card */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>خریداران وفادار</span>
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {shortTomaanWithUnit(data.returning_customers_revenue)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {toGroupedPersianDigits(data.returning_customers_orders)} فاکتور ثبت‌شده
              </p>
            </div>

            {/* New Customers Card */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <UserPlus className="w-4 h-4" />
                <span>خریداران جدید</span>
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {shortTomaanWithUnit(data.new_customers_revenue)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {toGroupedPersianDigits(data.new_customers_orders)} فاکتور ثبت‌شده
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
            * خریدار وفادار به مشتریانی اطلاق می‌شود که حداقل یک سفارش پیش از شروع این دوره در شاپیک داشته‌اند.
          </p>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          داده‌ای برای تفکیک مشتریان ثبت نشده است.
        </div>
      )}
    </div>
  );
};
