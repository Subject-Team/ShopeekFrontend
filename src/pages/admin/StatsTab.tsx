import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  DollarSign,
  ShoppingBag,
  UserCheck,
  UserX,
  Shield,
  AlertTriangle,
  BarChart3,
  FileText,
  Trash2,
  Clock,
  Loader2,
} from 'lucide-react';
import { fetchAdminStats } from '../../services/api';
import type { AdminStats } from '../../types/admin';
import { toGroupedPersianDigits, formatTomaan } from '../../utils/persian';

export const StatsTab: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-center text-slate-400 py-8">خطا در بارگذاری آمار</p>
    );
  }

  const kpis = [
    { title: 'کل کاربران', value: stats.total_users, icon: Users, color: 'emerald' as const },
    { title: 'کاربران تأییدشده', value: stats.verified_users, icon: UserCheck, color: 'indigo' as const },
    { title: 'اشتراک فعال', value: stats.active_subscription_users, icon: Shield, color: 'cyan' as const },
    { title: 'فقط خواندنی', value: stats.read_only_users, icon: UserX, color: 'amber' as const },
    { title: 'کاربران جدید (۷ روز)', value: stats.new_users_last_7d, icon: BarChart3, color: 'emerald' as const },
    { title: 'کاربران جدید (۳۰ روز)', value: stats.new_users_last_30d, icon: BarChart3, color: 'indigo' as const },
    { title: 'کل مشتریان', value: stats.total_customers, icon: Users, color: 'cyan' as const },
    { title: 'کل تراکنش‌ها', value: stats.total_transactions, icon: ShoppingBag, color: 'amber' as const },
    { title: 'کل درآمد', value: formatTomaan(stats.total_revenue), icon: DollarSign, color: 'emerald' as const, isFormatted: true },
    { title: 'مشاوره‌ها', value: stats.total_advisories, icon: FileText, color: 'indigo' as const },
    { title: 'پیش‌بینی‌ها', value: stats.total_forecasts, icon: BarChart3, color: 'cyan' as const },
    { title: 'پروفایل تکمیل‌شده', value: stats.business_profiles_completed, icon: UserCheck, color: 'emerald' as const },
    { title: 'رویدادهای خطا', value: stats.total_error_events, icon: AlertTriangle, color: 'amber' as const },
    { title: 'در صف حذف', value: stats.deletion_queue_accounts ?? 0, icon: Clock, color: 'amber' as const },
    { title: 'حساب‌های حذف‌شده', value: stats.deleted_accounts ?? 0, icon: Trash2, color: 'rose' as const },
  ];

  const colorStyles = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50',
    rose: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
  };

  return (
    <div className="space-y-6">
      {/* New Users Growth Section */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">رشد کاربران جدید</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">۷ روز اخیر</p>
            <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-300">
              {toGroupedPersianDigits(stats.new_users_last_7d)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">۳۰ روز اخیر</p>
            <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {toGroupedPersianDigits(stats.new_users_last_30d)}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="glass-card p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex items-start justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpi.isFormatted ? kpi.value : toGroupedPersianDigits(kpi.value as number)}
              </h3>
            </div>
            <div className={`p-3 rounded-xl border ${colorStyles[kpi.color]}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
