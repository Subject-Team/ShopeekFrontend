import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, CreditCard, Users, UploadCloud, ReceiptText } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AdvisoryCard } from '../components/dashboard/AdvisoryCard';
import { SubscriptionWarningBanner } from '../components/dashboard/SubscriptionWarningBanner';
import { SubscriptionStatusCard } from '../components/dashboard/SubscriptionStatusCard';
import { usePageContext } from '../context/PageContext';
import { useAuth } from '../context/AuthContext';
import { fetchKPISummary, fetchRevenueTrend, fetchLatestAdvisory, fetchAdvisoryHistory, fetchCustomers } from '../services/api';
import { KPISummary, RevenuePoint, AIAdvisory, Customer } from '../types';
import { formatPersianNumber } from '../utils';
import { formatJalaliRangeLabel } from '../utils/jalali';
import { SEO } from '../components/common/SEO';
import { InvoiceModal } from './InvoicePage';

export const DashboardPage: React.FC = () => {
  const { dateRangeDays, startDate, endDate, isHistorical } = usePageContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);
  const [advisoryHistory, setAdvisoryHistory] = useState<AIAdvisory[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);

  const loadDashboardData = async () => {
    try {
      const [kpiRes, trendRes, advRes, custRes, historyRes] = await Promise.all([
        fetchKPISummary(dateRangeDays, startDate, endDate),
        fetchRevenueTrend(dateRangeDays, startDate, endDate),
        fetchLatestAdvisory(),
        fetchCustomers(),
        fetchAdvisoryHistory()
      ]);
      setKpi(kpiRes);
      setTrend(trendRes);
      setAdvisory(advRes);
      setAdvisoryHistory(historyRes);
      setTopCustomers(custRes.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
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

      {/* 3-Hour AI Advisory Widget */}
      <div data-guide="dashboard-advisory">
        <AdvisoryCard advisory={advisory} history={advisoryHistory} onRefresh={loadDashboardData} readOnly={Boolean(user?.is_read_only)} />
      </div>

      {/* KPI Cards Grid */}
      <div data-guide="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="فروش کل (تومان)"
          value={kpi ? formatPersianNumber(kpi.total_revenue) : '۰'}
          changePercentage={kpi?.revenue_change_percentage}
          subtitle={
            isHistorical
              ? formatJalaliRangeLabel(startDate, endDate)
              : `در ${formatPersianNumber(dateRangeDays)} روز گذشته`
          }
          icon={DollarSign}
          color="emerald"
          forecastValue={isHistorical ? undefined : kpi?.revenue_forecast}
          forecastLabel="تومان"
        />
        <KpiCard
          title="تعداد کل سفارشات"
          value={kpi ? formatPersianNumber(kpi.order_count) : '۰'}
          changePercentage={kpi?.order_count_change_percentage}
          subtitle={
            isHistorical
              ? formatJalaliRangeLabel(startDate, endDate)
              : `در ${formatPersianNumber(dateRangeDays)} روز گذشته`
          }
          icon={ShoppingBag}
          color="indigo"
          forecastValue={isHistorical ? undefined : kpi?.order_count_forecast}
        />
        <KpiCard
          title="میانگین ارزش فاکتور (AOV)"
          value={kpi ? formatPersianNumber(kpi.average_order_value.toFixed(0)) : '۰'}
          changePercentage={kpi?.aov_change_percentage}
          subtitle="تومان"
          icon={CreditCard}
          color="amber"
          forecastValue={isHistorical ? undefined : kpi?.aov_forecast}
          forecastLabel="تومان"
        />
        <KpiCard
          title="تعداد مشتریان فعال"
          value={kpi ? formatPersianNumber(kpi.total_customers) : '۰'}
          changePercentage={kpi?.customer_count_change_percentage}
          subtitle="مشتری ثبت‌شده"
          icon={Users}
          color="cyan"
          forecastValue={isHistorical ? undefined : kpi?.customer_count_forecast}
        />
      </div>

      {/* Revenue Trend & Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-guide="dashboard-chart" className="lg:col-span-2">
          <RevenueChart data={trend} hideForecast={isHistorical} />
        </div>

        {/* Side Widget: Top Customers Summary, Data Import CTA, & Subscription Card */}

        <div className="space-y-6">
          {/* Quick Import & Invoice CTA */}
          <div
            data-guide="dashboard-ingestion-cta"
            className="glass-card p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/40 dark:from-brand-950/40 dark:to-slate-900 border border-brand-200 dark:border-brand-900/50 space-y-3"
          >
            <div className="flex items-center gap-3 text-brand-700 dark:text-brand-300">
              <ReceiptText className="w-6 h-6" />
              <h4 className="font-extrabold text-sm">ورود فاکتورهای جدید</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ثبت سریع فاکتور فروش به صورت مستقیم یا ورود داده‌ها از طریق فایل اکسل و CSV.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ReceiptText className="w-4 h-4" />
                ثبت فاکتور مستقیم
              </button>
              <button
                onClick={() => navigate('/dashboard/ingestion')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                ورود داده‌ها
              </button>
            </div>
          </div>

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
            <div className="space-y-2.5">
              {topCustomers.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">داده‌ای یافت نشد.</p>
              ) : (
                topCustomers.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPersianNumber(c.total_lifetime_value)} ت
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Remaining Subscription Status Card (Under Data Entry Section) */}
          <div data-guide="dashboard-subscription">
            <SubscriptionStatusCard user={user} />
          </div>
        </div>
      </div>

      <InvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} />
    </div>
  );
};
