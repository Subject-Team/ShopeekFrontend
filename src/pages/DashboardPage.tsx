import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, CreditCard, Users, UploadCloud, RefreshCw } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AdvisoryCard } from '../components/dashboard/AdvisoryCard';
import { usePageContext } from '../context/PageContext';
import { fetchKPISummary, fetchRevenueTrend, fetchLatestAdvisory, fetchCustomers } from '../services/api';
import { KPISummary, RevenuePoint, AIAdvisory, Customer } from '../types';

export const DashboardPage: React.FC = () => {
  const { dateRangeDays, setPageMetricsSnapshot, setActivePage } = usePageContext();
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, advRes, custRes] = await Promise.all([
        fetchKPISummary(dateRangeDays),
        fetchRevenueTrend(dateRangeDays),
        fetchLatestAdvisory(),
        fetchCustomers()
      ]);
      setKpi(kpiRes);
      setTrend(trendRes);
      setAdvisory(advRes);
      setTopCustomers(custRes.slice(0, 5));

      // Save context snapshot for AI Chat
      setPageMetricsSnapshot({
        kpi: kpiRes,
        latest_advisory: advRes?.summary || '',
        total_top_customers: custRes.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRangeDays]);

  return (
    <div className="space-y-6">
      {/* 3-Hour AI Advisory Widget */}
      <AdvisoryCard advisory={advisory} onRefresh={loadDashboardData} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="فروش کل (تومان)"
          value={kpi ? Number(kpi.total_revenue).toLocaleString('fa-IR') : '0'}
          changePercentage={kpi?.revenue_change_percentage}
          subtitle={`در ${dateRangeDays} روز گذشته`}
          icon={DollarSign}
          color="emerald"
        />
        <KpiCard
          title="تعداد کل سفارشات"
          value={kpi ? kpi.order_count.toLocaleString('fa-IR') : '0'}
          changePercentage={kpi?.order_count_change_percentage}
          subtitle={`در ${dateRangeDays} روز گذشته`}
          icon={ShoppingBag}
          color="indigo"
        />
        <KpiCard
          title="میانگین ارزش فاکتور (AOV)"
          value={kpi ? Number(kpi.average_order_value).toLocaleString('fa-IR') : '0'}
          changePercentage={kpi?.aov_change_percentage}
          subtitle="تومان"
          icon={CreditCard}
          color="amber"
        />
        <KpiCard
          title="تعداد مشتریان فعال"
          value={kpi ? kpi.total_customers.toLocaleString('fa-IR') : '0'}
          changePercentage={kpi?.customer_count_change_percentage}
          subtitle="مشتری ثبت‌شده"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Revenue Trend & Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={trend} />
        </div>

        {/* Side Widget: Top Customers Summary & Data Import CTA */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">مشتریان برتر (LTV)</h4>
              <button
                onClick={() => setActivePage('customers')}
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
                      {Number(c.total_lifetime_value).toLocaleString('fa-IR')} ت
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Import CTA */}
          <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50/40 dark:from-brand-950/40 dark:to-slate-900 border border-brand-200 dark:border-brand-900/50 space-y-3">
            <div className="flex items-center gap-3 text-brand-700 dark:text-brand-300">
              <UploadCloud className="w-6 h-6" />
              <h4 className="font-extrabold text-sm">ورود فاکتورهای جدید</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              افزایش دقت تحلیل‌ها با افزودن فایل فاکتورهای اخیر فروش کسب‌وکار.
            </p>
            <button
              onClick={() => setActivePage('ingestion')}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              بارگذاری فایل CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
