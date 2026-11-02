import React, { useMemo } from 'react';
import { Calendar, Flame } from 'lucide-react';
import { DayOfWeekDistribution } from '../../types';
import { shortTomaanWithUnit, toGroupedPersianDigits } from '../../utils/persian';

interface DayOfWeekCardProps {
  data: DayOfWeekDistribution[];
}

export const DayOfWeekCard: React.FC<DayOfWeekCardProps> = ({ data }) => {
  const peakDay = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((best, curr) => (curr.revenue > best.revenue ? curr : best), data[0]);
  }, [data]);

  const maxRevenue = useMemo(() => {
    return Math.max(...data.map((d) => d.revenue), 1);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, d) => sum + d.revenue, 0);
  }, [data]);

  return (
    <div className="glass-card p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              روزهای پیک فروش
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              توزیع درآمد و سفارشات در روزهای هفته
            </p>
          </div>
        </div>

        {peakDay && peakDay.revenue > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>پیک: {peakDay.day_name}</span>
          </div>
        )}
      </div>

      {/* Week Days List */}
      {totalRevenue > 0 ? (
        <div className="space-y-2.5 pt-1">
          {data.map((item) => {
            const isPeak = peakDay?.day_index === item.day_index && item.revenue > 0;
            const barWidth = Math.max(4, Math.round((item.revenue / maxRevenue) * 100));

            return (
              <div key={item.day_index} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      isPeak
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.day_name}
                    {isPeak && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </span>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      {toGroupedPersianDigits(item.orders)} سفارش
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {shortTomaanWithUnit(item.revenue)}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPeak
                        ? 'bg-amber-500'
                        : 'bg-brand-500/70 dark:bg-brand-400/60'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          داده‌ای برای تفکیک روزهای هفته ثبت نشده است.
        </div>
      )}
    </div>
  );
};
