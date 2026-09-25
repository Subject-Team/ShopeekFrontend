import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, ReceiptText, AlertTriangle, RefreshCw, Medal } from 'lucide-react';
import { CreditIcon } from '../components/icons';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AdvisoryCard } from '../components/dashboard/AdvisoryCard';
import { SubscriptionWarningBanner } from '../components/dashboard/SubscriptionWarningBanner';
import { PlanCreditOverviewCard } from '../components/dashboard/PlanCreditOverviewCard';
import { LatestArticleCard } from '../components/dashboard/LatestArticleCard';
import { BusinessProfileBanner } from '../components/dashboard/BusinessProfileBanner';
import { LastInvoicesCard } from '../components/dashboard/LastInvoicesCard';
import { usePageContext } from '../context/PageContext';
import { useAuth } from '../context/AuthContext';
import {
  fetchKPISummary,
  fetchRevenueTrend,
  fetchLatestAdvisory,
  fetchAdvisoryHistory,
  fetchCustomers,
  fetchBusinessProfile,
  fetchBillingOverview,
} from '../services/api';
import { KPISummary, RevenuePoint, AIAdvisory, Customer, BusinessProfile, BillingOverview } from '../types';
import { USAGE_LABELS } from '../config/plansDisplay';
import { toGroupedPersianDigits } from "../utils/persian";
import { formatJalaliRangeLabel } from "../utils/persian/date";
import { SEO } from '../components/common/SEO';
import { InvoiceModal } from '../components/invoice/InvoiceModal';

type WidgetKey = 'kpi' | 'trend' | 'advisory' | 'customers';
type WidgetStatus = 'loading' | 'loaded' | 'failed';
type WidgetStatuses = Record<WidgetKey, WidgetStatus>;

const INITIAL_STATUSES: WidgetStatuses = {
  kpi: 'loading',
  trend: 'loading',
  advisory: 'loading',
  customers: 'loading',
};

const ShimmerBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/50 ${className}`} />
);

const KpiCardSkeleton: React.FC = () => (
  <div className="glass-card p-5 rounded-2xl shadow-xs flex flex-col justify-between" aria-hidden="true">
    <div className="flex items-start justify-between mb-4 w-full">
      <div className="space-y-2">
        <ShimmerBox className="h-3 w-20" />
        <ShimmerBox className="h-8 w-28" />
      </div>
      <ShimmerBox className="w-12 h-12 rounded-xl" />
    </div>
    <ShimmerBox className="h-3 w-32" />
  </div>
);

const ChartCardSkeleton: React.FC = () => (
  <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xs space-y-4" aria-hidden="true">
    <ShimmerBox className="h-5 w-52" />
    <ShimmerBox className="h-64 sm:h-72 w-full" />
  </div>
);

const WidgetErrorCard: React.FC<{ onRetry: () => void; label: string; className?: string }> = ({ onRetry, label, className = '' }) => (
  <div role="alert" className={`glass-card p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center ${className}`}>
    <AlertTriangle className="w-6 h-6 text-amber-500" />
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      تلاش دوباره
    </button>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { dateRangeDays, startDate, endDate, isHistorical } = usePageContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);
  const [advisoryHistory, setAdvisoryHistory] = useState<AIAdvisory[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [invoicesRefreshKey, setInvoicesRefreshKey] = useState<number>(0);
  const [statuses, setStatuses] = useState<WidgetStatuses>(INITIAL_STATUSES);
  const isMountedRef = useRef(true);

  const aiUsage = billing?.usage.find((u) => u.feature_key === 'daily_ai_run_limit');

  const loadWidget = async <T,>(key: WidgetKey, fetcher: () => Promise<T>, apply: (value: T) => void): Promise<void> => {
    setStatuses((prev) => ({ ...prev, [key]: 'loading' }));
    try {
      const value = await fetcher();
      if (!isMountedRef.current) return;
      apply(value);
      setStatuses((prev) => ({ ...prev, [key]: 'loaded' }));
    } catch (err) {
      if (isMountedRef.current) {
        console.error(err);
        setStatuses((prev) => ({ ...prev, [key]: 'failed' }));
      }
    }
  };

  const loadOptional = async <T,>(fetcher: () => Promise<T>, apply: (value: T) => void): Promise<void> => {
    try {
      const value = await fetcher();
      if (isMountedRef.current && value) apply(value);
    } catch (err) {
      console.error(err);
    }
  };

  const loadKpi = () => loadWidget('kpi', () => fetchKPISummary(dateRangeDays, startDate, endDate), setKpi);
  const loadTrend = () => loadWidget('trend', () => fetchRevenueTrend(dateRangeDays, startDate, endDate), setTrend);
  const loadAdvisoryWidget = () => loadWidget('advisory', fetchLatestAdvisory, setAdvisory);
  const loadCustomersWidget = () => loadWidget('customers', fetchCustomers, (v) => setTopCustomers(v.slice(0, 3)));

  const loadDashboardData = async () => {
    await Promise.all([loadKpi(), loadTrend(), loadAdvisoryWidget(), loadCustomersWidget()]);
    void loadOptional(fetchAdvisoryHistory, setAdvisoryHistory);
    void loadOptional(fetchBusinessProfile, setBusinessProfile);
    void loadOptional(fetchBillingOverview, setBilling);
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardData();
    return () => {
      isMountedRef.current = false;
    };
  }, [startDate, endDate, dateRangeDays]);


  return (
    <div className="space-y-6">
      <SEO
        title="داشبورد تحلیلی فروش | شاپیک"
        description="خلاصه آمار، شاخص‌های کلیدی عملکرد فروش، نمودارهای روند درآمد و توصیه‌های هوش مصنوعی شاپیک."
        canonicalPath="/dashboard"
      />

      {/* Single H1 requirement for accessibility/SEO */}
      <h1 className="sr-only">داشبورد اصلی تحلیلی شاپیک</h1>

      {/* Welcome & Overview Header Anchor */}
      <div data-guide="dashboard-welcome" className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-lg">
            داشبورد مدیریت و تحلیل فروش
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            دید ۳۶۰ درجه نسبت به فروش، رفتار مشتریان و هوش تجاری کسب‌وکار
          </p>
        </div>
      </div>

      {/* 7-Day Expiration Warning Banner (if applicable) */}
      <SubscriptionWarningBanner user={user} />

      {/* Secondary Business Profile Supplementary Reminder Banner */}
      <BusinessProfileBanner businessProfile={businessProfile} />

      {/* 3-Hour AI Advisory Widget */}
      <div data-guide="dashboard-advisory">
        <AdvisoryCard advisory={advisory} history={advisoryHistory} onRefresh={loadDashboardData} readOnly={Boolean(user?.is_read_only)} status={statuses.advisory} onRetry={loadAdvisoryWidget} />
        {aiUsage && (
          <p className="mt-2 px-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <CreditIcon className="w-3.5 h-3.5 text-sky-500" />
            <span>
              {USAGE_LABELS['daily_ai_run_limit']}: {toGroupedPersianDigits(aiUsage.used)}
              {aiUsage.limit === null ? ' — نامحدود' : ` از ${toGroupedPersianDigits(aiUsage.limit)}`}
            </span>
          </p>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div data-guide="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy={kpi === null && statuses.kpi === 'loading'}>
        {kpi === null && statuses.kpi === 'loading' ? (
          [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
        ) : kpi === null && statuses.kpi === 'failed' ? (
          <WidgetErrorCard onRetry={loadKpi} label="بارگذاری شاخص‌های فروش با خطا مواجه شد." className="sm:col-span-2 lg:col-span-4" />
        ) : (
          <>
        <KpiCard
          title="فروش کل (تومان)"
          value={kpi ? toGroupedPersianDigits(kpi.total_revenue) : '۰'}
          changePercentage={kpi?.revenue_change_percentage}
          subtitle={
            isHistorical
              ? formatJalaliRangeLabel(startDate, endDate)
              : `در ${toGroupedPersianDigits(dateRangeDays)} روز گذشته`
          }
          icon={DollarSign}
          color="emerald"
          forecastValue={isHistorical ? undefined : kpi?.revenue_forecast}
          forecastLabel="تومان"
        />
        <KpiCard
          title="تعداد کل سفارشات"
          value={kpi ? toGroupedPersianDigits(kpi.order_count) : '۰'}
          changePercentage={kpi?.order_count_change_percentage}
          subtitle={
            isHistorical
              ? formatJalaliRangeLabel(startDate, endDate)
              : `در ${toGroupedPersianDigits(dateRangeDays)} روز گذشته`
          }
          icon={ShoppingBag}
          color="indigo"
          forecastValue={isHistorical ? undefined : kpi?.order_count_forecast}
        />
        <KpiCard
          title="میانگین ارزش فاکتور (AOV)"
          value={kpi ? toGroupedPersianDigits(kpi.average_order_value.toFixed(0)) : '۰'}
          changePercentage={kpi?.aov_change_percentage}
          subtitle="تومان"
          icon={ReceiptText}
          color="amber"
          forecastValue={isHistorical ? undefined : kpi?.aov_forecast}
          forecastLabel="تومان"
        />
        <KpiCard
          title="تعداد مشتریان فعال"
          value={kpi ? toGroupedPersianDigits(kpi.total_customers) : '۰'}
          changePercentage={kpi?.customer_count_change_percentage}
          subtitle="مشتری ثبت‌شده"
          icon={Users}
          color="cyan"
          forecastValue={isHistorical ? undefined : kpi?.customer_count_forecast}
        />
          </>
        )}
      </div>

      {/* Revenue Trend & Forecast Chart + Last Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div data-guide="dashboard-chart" aria-busy={trend.length === 0 && statuses.trend === 'loading'}>
            {trend.length === 0 && statuses.trend === 'loading' ? (
              <ChartCardSkeleton />
            ) : trend.length === 0 && statuses.trend === 'failed' ? (
              <WidgetErrorCard onRetry={loadTrend} label="بارگذاری نمودار فروش با خطا مواجه شد." />
            ) : (
              <RevenueChart data={trend} hideForecast={isHistorical} />
            )}
          </div>

          <LastInvoicesCard
            startDate={startDate}
            endDate={endDate}
            isHistorical={isHistorical}
            readOnly={Boolean(user?.is_read_only)}
            onOpenInvoiceModal={() => setInvoiceModalOpen(true)}
            refreshKey={invoicesRefreshKey}
          />
        </div>

        {/* Side Widget: Top Customers Summary, Subscription Card, & Latest Article */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">مشتریان برتر (LTV)</h4>
              <button
                onClick={() => navigate('/dashboard/customers')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                مشاهده همه
              </button>
            </div>
            <div className="space-y-2.5" aria-busy={topCustomers.length === 0 && statuses.customers === 'loading'}>
              {topCustomers.length === 0 && statuses.customers === 'loading' ? (
                [0, 1, 2].map((i) => <ShimmerBox key={i} className="h-10 w-full" />)
              ) : topCustomers.length === 0 && statuses.customers === 'failed' ? (
                <WidgetErrorCard onRetry={loadCustomersWidget} label="بارگذاری مشتریان با خطا مواجه شد." />
              ) : topCustomers.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">داده‌ای یافت نشد.</p>
              ) : (
                topCustomers.map((c, i) => {
                  const medalStyles = [
                    { ring: 'bg-amber-100 dark:bg-amber-950 text-amber-500 dark:text-amber-400' },
                    { ring: 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300' },
                    { ring: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400' },
                  ][i];
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {medalStyles ? (
                          <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center ${medalStyles.ring}`}>
                            <Medal className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                      </div>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {toGroupedPersianDigits(c.total_lifetime_value)} ت
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Plan & Credit Overview Card */}
          <PlanCreditOverviewCard overview={billing} />

          {/* Latest Blog Article Card */}
          <div data-guide="dashboard-latest-article">
            <LatestArticleCard />
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onCreated={() => {
          setInvoicesRefreshKey((k) => k + 1);
          void loadDashboardData();
        }}
      />
    </div>
  );
};
