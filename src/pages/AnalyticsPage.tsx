import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { fetchRevenueTrend, fetchKPISummary } from '../services/api';
import { RevenuePoint, KPISummary } from '../types';
import { usePageContext } from '../context/PageContext';
import { toPersianDigits } from '../utils';

export const AnalyticsPage: React.FC = () => {
  const { dateRangeDays, setPageMetricsSnapshot } = usePageContext();
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [kpi, setKpi] = useState<KPISummary | null>(null);

  useEffect(() => {
    Promise.all([
      fetchRevenueTrend(dateRangeDays),
      fetchKPISummary(dateRangeDays)
    ]).then(([trendData, kpiData]) => {
      setTrend(trendData);
      setKpi(kpiData);
      setPageMetricsSnapshot({ analytics_kpi: kpiData });
    });
  }, [dateRangeDays]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">تحلیل جامع و نمودارهای مقایسه‌ای</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            بررسی نوسانات روزانه فروش، رشد دوره به دوره و پیش‌بینی بازه آینده
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>بازه ارزیابی: {toPersianDigits(dateRangeDays)} روز گذشته</span>
          </div>
        </div>
      </div>

      <RevenueChart data={trend} title="نمودار تفکیکی فروش روزانه و خط پیش‌بینی" />

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">رشد درآمد در این دوره</span>
          <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {kpi ? `${toPersianDigits(kpi.revenue_change_percentage)}%` : '0%'}
          </h4>
          <p className="text-xs text-slate-500">تغییر خالص نسبت به دوره قبلی ({dateRangeDays} روز قبل)</p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">تغییر مطلق فروش (تومان)</span>
          <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {kpi ? toPersianDigits(kpi.revenue_change_absolute) : '0'}
          </h4>
          <p className="text-xs text-slate-500">افزایش یا کاهش ریالی کل فاکتورها</p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">رشد تعداد سفارشات</span>
          <h4 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {kpi ? `${toPersianDigits(kpi.order_count_change_percentage)}%` : '0%'}
          </h4>
          <p className="text-xs text-slate-500">تعداد کل سفارشات ثبت‌شده در بازه فعلی</p>
        </div>
      </div>
    </div>
  );
};
