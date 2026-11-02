import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Filter,
  LineChart,
  Loader2,
  RotateCcw,
  Sparkles,
  DollarSign,
  ShoppingBag,
  ReceiptText,
  Users,
} from 'lucide-react';
import { AnalyticsHeroChart } from '../components/analytics/AnalyticsHeroChart';
import { DayOfWeekCard } from '../components/analytics/DayOfWeekCard';
import { CustomerRetentionCard } from '../components/analytics/CustomerRetentionCard';
import { TopProductsCard } from '../components/analytics/TopProductsCard';
import { KpiCard } from '../components/dashboard/KpiCard';
import { fetchAdvancedAnalytics } from '../services/api';
import { AdvancedAnalyticsOverview } from '../types';
import { usePageContext } from '../context/PageContext';
import { toGroupedPersianDigits } from '../utils/persian';
import { formatJalaliRangeLabel } from '../utils/persian/date';
import { SEO } from '../components/common/SEO';

export const AnalyticsPage: React.FC = () => {
  const { dateRangeDays, startDate, endDate, isHistorical } = usePageContext();
  const isMountedRef = useRef<boolean>(true);
  const [data, setData] = useState<AdvancedAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const overview = await fetchAdvancedAnalytics(dateRangeDays, startDate, endDate);
      if (!isMountedRef.current) return;
      setData(overview);
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

  const kpi = data?.kpi;

  return (
    <div className="space-y-6">
      <SEO
        title="تحلیل و آمار فروش | شاپیک"
        description="مرکز هوش تجاری و تحلیل آماری فروش، روندهای مقایسه‌ای دوره به دوره، روزهای پیک و رفتار مشتریان."
        canonicalPath="/dashboard/analytics"
      />

      {/* Single H1 requirement for accessibility/SEO */}
      <h1 className="sr-only">تحلیل و آمار فروش شاپیک</h1>

      {/* Page Header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-xl">
            هوش فروش و تحلیل آماری
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            بررسی نوسانات فروش، مقایسه دوره به دوره، روزهای پیک و رفتار مشتریان
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>
              بازه ارزیابی:{' '}
              {isHistorical
                ? formatJalaliRangeLabel(startDate, endDate)
                : `${toGroupedPersianDigits(dateRangeDays)} روز گذشته`}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Insight Banner */}
      {!isLoading && !isError && data?.smart_insight && (
        <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-brand-700 dark:text-brand-300 ml-1">
              بینش هوشمند دوره:
            </span>
            {data.smart_insight}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          role="status"
          className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 py-16"
        >
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            در حال بارگذاری هوش آماری و تحلیل فروش...
          </span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div
          role="alert"
          className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center"
        >
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            دریافت اطلاعات آماری با خطا مواجه شد.
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش نمایید.
          </p>
          <button
            type="button"
            onClick={() => {
              void loadAnalytics();
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      )}

      {/* Loaded Content */}
      {!isLoading && !isError && data && (
        <>
          {/* Top 4 KPI Cards (Comprehensive Overview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="فروش کل (تومان)"
              value={kpi ? toGroupedPersianDigits(kpi.total_revenue) : '۰'}
              changePercentage={kpi?.revenue_change_percentage}
              subtitle={
                kpi && kpi.revenue_change_absolute !== 0
                  ? `${toGroupedPersianDigits(Math.abs(kpi.revenue_change_absolute))} ت تغییر خالص`
                  : 'نسبت به دوره متناظر قبل'
              }
              icon={DollarSign}
              color="emerald"
              forecastValue={isHistorical ? undefined : kpi?.revenue_forecast}
              forecastLabel="تومان"
            />
            <KpiCard
              title="تعداد سفارشات"
              value={kpi ? toGroupedPersianDigits(kpi.order_count) : '۰'}
              changePercentage={kpi?.order_count_change_percentage}
              subtitle="در این بازه"
              icon={ShoppingBag}
              color="indigo"
              forecastValue={isHistorical ? undefined : kpi?.order_count_forecast}
            />
            <KpiCard
              title="میانگین ارزش فاکتور (AOV)"
              value={kpi ? toGroupedPersianDigits(Math.round(kpi.average_order_value ?? 0)) : '۰'}
              changePercentage={kpi?.aov_change_percentage}
              subtitle="تومان در هر خرید"
              icon={ReceiptText}
              color="amber"
              forecastValue={isHistorical ? undefined : kpi?.aov_forecast}
              forecastLabel="تومان"
            />
            <KpiCard
              title="تعداد خریداران فعال"
              value={kpi ? toGroupedPersianDigits(kpi.total_customers) : '۰'}
              changePercentage={kpi?.customer_count_change_percentage}
              subtitle="مشتری ثبت‌شده"
              icon={Users}
              color="cyan"
              forecastValue={isHistorical ? undefined : kpi?.customer_count_forecast}
            />
          </div>

          {/* Hero Multi-Metric Chart with PoP Comparison */}
          <div data-guide="analytics-chart">
            {data.trend.length === 0 ? (
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <LineChart className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  فروشی در این بازه ثبت نشده است
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  اولین فاکتور خود را ثبت کنید تا نمودار تحلیلی و مقایسه دوره به دوره شکل بگیرد.
                </p>
              </div>
            ) : (
              <AnalyticsHeroChart data={data.trend} hideForecast={isHistorical} />
            )}
          </div>

          {/* Deep Diagnostic Breakdown Row (3 Cards Grid) */}
          <div data-guide="analytics-metrics" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DayOfWeekCard data={data.day_of_week} />
            <CustomerRetentionCard data={data.customer_breakdown} />
            <TopProductsCard products={data.top_products} />
          </div>
        </>
      )}
    </div>
  );
};
