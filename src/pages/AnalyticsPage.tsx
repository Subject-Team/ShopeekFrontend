import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Filter, LineChart, Loader2, RotateCcw } from 'lucide-react';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { fetchRevenueTrend, fetchKPISummary } from '../services/api';
import { RevenuePoint, KPISummary } from '../types';
import { usePageContext } from '../context/PageContext';
import { toPersianDigits, toGroupedPersianDigits } from "../utils/persian";
import { formatJalaliRangeLabel } from "../utils/persian/date";
import { SEO } from '../components/common/SEO';

export const AnalyticsPage: React.FC = () => {
  const { dateRangeDays, startDate, endDate, isHistorical } = usePageContext();
  const isMountedRef = useRef<boolean>(true);
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [trendData, kpiData] = await Promise.all([
        fetchRevenueTrend(dateRangeDays, startDate, endDate),
        fetchKPISummary(dateRangeDays, startDate, endDate)
      ]);
      if (!isMountedRef.current) return;
      setTrend(trendData);
      setKpi(kpiData);
    } catch (err: unknown) {
      if (isMountedRef.current) {
        console.error(err);
        setIsError(true);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [dateRangeDays, startDate, endDate]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadAnalytics();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadAnalytics]);

  return (
    <div className="space-y-6">
      <SEO
        title="تحلیل و آمار فروش | شاپیک"
        description="بررسی نمودار تفکیکی درآمد روزانه، پیش‌بینی هوشمند فروش و رشد دوره‌ای کسب‌وکار."
        canonicalPath="/dashboard/analytics"
      />

      {/* Single H1 requirement */}
      <h1 className="sr-only">تحلیل و آمار فروش شاپیک</h1>

      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-xl">تحلیل جامع و نمودارهای مقایسه‌ای</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            بررسی نوسانات روزانه فروش، رشد دوره به دوره و پیش‌بینی بازه آینده
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>
              بازه ارزیابی: {isHistorical ? formatJalaliRangeLabel(startDate, endDate) : `${toGroupedPersianDigits(dateRangeDays)} روز گذشته`}
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div role="status" className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 py-12">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">در حال بارگذاری آمار فروش...</span>
        </div>
      )}

      {!isLoading && isError && (
        <div role="alert" className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 py-12 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">دریافت آمار فروش ممکن نشد.</p>
          <button
            type="button"
            onClick={() => { void loadAnalytics(); }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div data-guide="analytics-chart">
            {trend.length === 0 ? (
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <LineChart className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">فروشی در این بازه ثبت نشده است</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  اولین فاکتور خود را ثبت کنید تا نمودار فروش و درصد رشد این بازه نمایش داده شود.
                </p>
              </div>
            ) : (
              <RevenueChart
                data={trend}
                hideForecast={isHistorical}
                title={isHistorical ? "نمودار تفکیکی فروش روزانه" : "نمودار تفکیکی فروش روزانه و خط پیش‌بینی"}
              />
            )}
          </div>

          {/* Analytics Breakdown Grid */}
          <div data-guide="analytics-metrics" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">رشد درآمد در این دوره</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {kpi ? `${toPersianDigits(kpi.revenue_change_percentage)}%` : '0%'}
              </h3>
              <p className="text-xs text-slate-500">
                تغییر خالص نسبت به دوره قبلی ({toGroupedPersianDigits(dateRangeDays)} روز قبل)
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">تغییر مطلق فروش (تومان)</span>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {kpi ? toGroupedPersianDigits(kpi.revenue_change_absolute) : '0'}
              </h3>
              <p className="text-xs text-slate-500">افزایش یا کاهش ریالی کل فاکتورها</p>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">رشد تعداد سفارشات</span>
              <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {kpi ? `${toPersianDigits(kpi.order_count_change_percentage)}%` : '0%'}
              </h3>
              <p className="text-xs text-slate-500">تعداد کل سفارشات ثبت‌شده در بازه فعلی</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
