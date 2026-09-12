import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  DollarSign,
  ShoppingBag,
  UserCheck,
  UserX,
  Shield,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Trash2,
  Save,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NotFoundPage } from './NotFoundPage';
import { UserBillingPanel } from '../components/admin/UserBillingPanel';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUserDetail,
  fetchAdminUserTransactions,
  updateAdminUser,
  deleteAdminUser,
  restoreAdminUser,
  fetchAdminErrors,
} from '../services/api';
import type {
  AdminStats,
  AdminUserItem,
  AdminTransaction,
  AdminErrorEvent,
} from '../types/admin';
import { toGroupedPersianDigits, toPersianDigits, formatTomaan } from '../utils/persian';
import { utcStringToPersianDate } from '../utils/persian/date';

type AdminTab = 'stats' | 'users' | 'errors';

// ---------------------------------------------------------------------------
// Stats Tab
// ---------------------------------------------------------------------------

const StatsTab: React.FC = () => {
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

// ---------------------------------------------------------------------------
// User Detail Modal
// ---------------------------------------------------------------------------

interface UserDetailModalProps {
  user: AdminUserItem;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdated, currentUserId }) => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>(user.full_name);
  const [formRole, setFormRole] = useState<'User' | 'Admin'>(user.role === 'Admin' ? 'Admin' : 'User');
  const [formSubExpiry, setFormSubExpiry] = useState<string>(
    user.subscription_expires_at ? user.subscription_expires_at.slice(0, 16) : ''
  );
  const [formSubInfinite, setFormSubInfinite] = useState<boolean>(!user.subscription_expires_at);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [restoreSubmitting, setRestoreSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  const isSelf = user.id === currentUserId;

  const handleRestore = async () => {
    setRestoreSubmitting(true);
    try {
      await restoreAdminUser(user.id);
      showToast('حساب کاربر با موفقیت بازیابی شد.', 'success');
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بازیابی کاربر';
      showToast(msg, 'error');
    } finally {
      setRestoreSubmitting(false);
    }
  };

  useEffect(() => {
    const loadTx = async () => {
      setTxLoading(true);
      try {
        const res = await fetchAdminUserTransactions(user.id);
        setTransactions(res.items);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setTxLoading(false);
      }
    };
    loadTx();
  }, [user.id]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (formName !== user.full_name) payload.full_name = formName;
      if (formRole !== (user.role === 'Admin' ? 'Admin' : 'User')) payload.role = formRole;
      if (formSubInfinite) {
        if (user.subscription_expires_at !== null) payload.subscription_expires_at = null;
      } else {
        const newExpiry = formSubExpiry ? new Date(formSubExpiry).toISOString() : null;
        if (newExpiry !== user.subscription_expires_at) payload.subscription_expires_at = newExpiry;
      }

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      await updateAdminUser(user.id, payload);
      showToast('اطلاعات کاربر با موفقیت بروزرسانی شد', 'success');
      setEditing(false);
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بروزرسانی';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (field: 'email_verified' | 'phone_verified') => {
    try {
      await updateAdminUser(user.id, { [field]: !user[field] });
      showToast(`${field === 'email_verified' ? 'ایمیل' : 'تلفن'} ${user[field] ? 'تأیید نشد' : 'تأیید شد'}`, 'success');
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    try {
      await deleteAdminUser(user.id);
      showToast('کاربر با موفقیت حذف شد', 'success');
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در حذف کاربر';
      showToast(msg, 'error');
    } finally {
      setDeleteSubmitting(false);
      setDeleteConfirm(false);
    }
  };

  const isDeleted = Boolean(user.deleted_at);
  const diffMs = user.deleted_at ? Date.now() - new Date(user.deleted_at).getTime() : 0;
  const deletedDaysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isDeleted7DaysAgo = isDeleted && deletedDaysAgo >= 7;

  const subscriptionLabel = isDeleted7DaysAgo
    ? 'حذف شده (≥ ۷ روز)'
    : isDeleted
    ? `در صف حذف (${toPersianDigits(deletedDaysAgo)} روز)`
    : user.is_read_only
    ? 'فقط خواندنی'
    : user.is_subscription_active
    ? `فعال (${toPersianDigits(user.remaining_days ?? 0)} روز)`
    : 'منقضی‌شده';

  const subscriptionBadgeColor = isDeleted7DaysAgo
    ? 'bg-rose-600 text-white shadow-xs'
    : isDeleted
    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
    : user.is_read_only
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
    : user.is_subscription_active
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white">{user.full_name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {/* Deleted Account Banner */}
          {isDeleted && (
            <div
              className={`p-4 rounded-2xl border ${
                isDeleted7DaysAgo
                  ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
              } space-y-1.5 text-xs`}
            >
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  {isDeleted7DaysAgo
                    ? 'این حساب بیش از ۷ روز پیش حذف شده است و آماده پاکسازی دائمی دستی می‌باشد.'
                    : `این حساب ${toPersianDigits(deletedDaysAgo)} روز پیش توسط کاربر حذف شده است.`}
                </span>
              </div>
              <p className="text-[11px] opacity-80">
                تاریخ درخواست حذف: {utcStringToPersianDate(user.deleted_at!)}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">تلفن</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user.phone || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">نقش</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.role === 'Admin' ? 'مدیر' : 'کاربر'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">ایمیل تأیید شده</span>
              <p className={`font-bold mt-0.5 ${user.email_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {user.email_verified ? 'بله' : 'خیر'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">تلفن تأیید شده</span>
              <p className={`font-bold mt-0.5 ${user.phone_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {user.phone_verified ? 'بله' : 'خیر'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">وضعیت اشتراک</span>
              <p className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${subscriptionBadgeColor}`}>
                {subscriptionLabel}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">تاریخ عضویت</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {utcStringToPersianDate(user.created_at)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">مشتریان</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {toGroupedPersianDigits(user.customers_count)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">تراکنش‌ها</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {toGroupedPersianDigits(user.transactions_count)}
              </p>
            </div>
          </div>

          {/* Quick Toggle Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleToggle('email_verified')}
              disabled={isSelf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              {user.email_verified ? 'لغو تأیید ایمیل' : 'تأیید ایمیل'}
            </button>
            <button
              onClick={() => handleToggle('phone_verified')}
              disabled={isSelf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              {user.phone_verified ? 'لغو تأیید تلفن' : 'تأیید تلفن'}
            </button>
          </div>

          {/* Edit Form */}
          {editing ? (
            <div className="space-y-3 p-4 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/20">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نام کامل</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نقش</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'User' | 'Admin')}
                  disabled={isSelf}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  <option value="User">کاربر</option>
                  <option value="Admin">مدیر</option>
                </select>
                {isSelf && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">امکان تغییر نقش حساب خودتان وجود ندارد</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تاریخ انقضا اشتراک</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formSubInfinite}
                    onChange={(e) => setFormSubInfinite(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">نامحدود</span>
                </div>
                {!formSubInfinite && (
                  <input
                    type="datetime-local"
                    value={formSubExpiry}
                    onChange={(e) => setFormSubExpiry(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  ذخیره
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
            >
              ویرایش اطلاعات
            </button>
          )}

          {/* Delete User */}
          {deleteConfirm ? (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteSubmitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {deleteSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  تأیید حذف
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {isDeleted && (
                <button
                  onClick={handleRestore}
                  disabled={restoreSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {restoreSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  بازیابی حساب کاربری
                </button>
              )}
              {!isSelf && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleted ? 'حذف دائمی کاربر' : 'حذف کاربر'}
                </button>
              )}
            </div>
          )}
          {isSelf && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              حساب خودتان — حذف و تغییر نقش غیرفعال است
            </p>
          )}

          {/* Billing Panel (subscription, wallets, payments) */}
          <UserBillingPanel userId={user.id} onChanged={onUpdated} />

          {/* Transactions */}
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3">تراکنش‌های اخیر</h4>
            {txLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">تراکنشی یافت نشد</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{tx.product_name || '—'}</span>
                      <span className="text-slate-400 mr-2">{utcStringToPersianDate(tx.transaction_date)}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {tx.total_amount != null ? toGroupedPersianDigits(tx.total_amount) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Users Tab
// ---------------------------------------------------------------------------

interface UsersTabProps {
  currentUserId: string;
}

const UsersTab: React.FC<UsersTabProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const pageSize = 15;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(q, p, pageSize);
      setUsers(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(page, search);
  }, [page, loadUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadUsers(1, value);
    }, 400);
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleUserUpdated = () => {
    loadUsers(page, search);
    if (selectedUser) {
      fetchAdminUserDetail(selectedUser.id).then(setSelectedUser).catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir dir-rtl"
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Mobile Card View (lg:hidden) */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
            کاربری یافت نشد
          </div>
        ) : (
          users.map((u) => {
            const isDeleted = Boolean(u.deleted_at);
            const diffMs = u.deleted_at ? Date.now() - new Date(u.deleted_at).getTime() : 0;
            const deletedDaysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const isDeleted7DaysAgo = isDeleted && deletedDaysAgo >= 7;

            const statusLabel = isDeleted7DaysAgo
              ? 'حذف شده (≥ ۷ روز)'
              : isDeleted
              ? `در صف حذف (${toPersianDigits(deletedDaysAgo)} روز)`
              : u.is_read_only
              ? 'فقط خواندنی'
              : u.is_subscription_active
              ? `فعال`
              : 'منقضی';
            const statusColor = isDeleted7DaysAgo
              ? 'bg-rose-600 text-white font-black shadow-xs'
              : isDeleted
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              : u.is_read_only
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              : u.is_subscription_active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';

            const cardBorder = isDeleted7DaysAgo
              ? 'border-r-4 border-r-rose-600'
              : isDeleted
              ? 'border-r-4 border-r-amber-500'
              : '';

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`glass-card rounded-2xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-all ${cardBorder}`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {u.full_name ? u.full_name.charAt(0) : '؟'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{u.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" dir="ltr">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block">نقش و شماره:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        u.role === 'Admin'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role === 'Admin' ? 'مدیر' : 'کاربر'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-[11px]" dir="ltr">{u.phone || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">آمار:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] mt-0.5 block">
                      {toPersianDigits(u.customers_count)} مشتری · {toPersianDigits(u.transactions_count)} تراکنش
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                  <span>عضویت: {utcStringToPersianDate(u.created_at)}</span>
                  <button className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 text-xs">
                    <span>جزئیات و ویرایش</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden lg:block) */}
      <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">نام</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">ایمیل</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">تلفن</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">نقش</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">وضعیت</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">مشتریان</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">تراکنش</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <Loader2 className="w-5 h-5 text-brand-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">کاربری یافت نشد</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isDeleted = Boolean(u.deleted_at);
                  const diffMs = u.deleted_at ? Date.now() - new Date(u.deleted_at).getTime() : 0;
                  const deletedDaysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const isDeleted7DaysAgo = isDeleted && deletedDaysAgo >= 7;

                  const statusLabel = isDeleted7DaysAgo
                    ? 'حذف شده (≥ ۷ روز)'
                    : isDeleted
                    ? `در صف حذف (${toPersianDigits(deletedDaysAgo)} روز)`
                    : u.is_read_only
                    ? 'فقط خواندنی'
                    : u.is_subscription_active
                    ? `فعال`
                    : 'منقضی';
                  const statusColor = isDeleted7DaysAgo
                    ? 'bg-rose-600 text-white font-black shadow-xs'
                    : isDeleted
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    : u.is_read_only
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : u.is_subscription_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';

                  const rowClass = isDeleted7DaysAgo
                    ? 'border-b border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 border-r-4 border-r-rose-600'
                    : isDeleted
                    ? 'border-b border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 border-r-4 border-r-amber-500'
                    : 'border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40';

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`${rowClass} cursor-pointer transition-colors`}
                    >
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{u.full_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400" dir="ltr">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          u.role === 'Admin'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {u.role === 'Admin' ? 'مدیر' : 'کاربر'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{toPersianDigits(u.customers_count)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{toPersianDigits(u.transactions_count)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-500">{utcStringToPersianDate(u.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} — مجموع {toGroupedPersianDigits(total)} کاربر
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={handleUserUpdated}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Errors Tab
// ---------------------------------------------------------------------------

const ErrorsTab: React.FC = () => {
  const [errors, setErrors] = useState<AdminErrorEvent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [severity, setSeverity] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = 20;

  const loadErrors = useCallback(async (p: number, sev: string, src: string) => {
    setLoading(true);
    try {
      const res = await fetchAdminErrors(p, pageSize, sev || undefined, src || undefined);
      setErrors(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadErrors(page, severity, source);
  }, [page, severity, source, loadErrors]);

  const totalPages = Math.ceil(total / pageSize);

  const severityBadge = (sev: string) => {
    const base = 'px-2 py-0.5 rounded-full font-bold text-[11px]';
    switch (sev.toLowerCase()) {
      case 'critical':
        return `${base} bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300`;
      case 'error':
        return `${base} bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300`;
      case 'warning':
        return `${base} bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300`;
      default:
        return `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir"
        >
          <option value="">همه شدت‌ها</option>
          <option value="critical">بحرانی</option>
          <option value="error">خطا</option>
          <option value="warning">هشدار</option>
        </select>
        <input
          type="text"
          placeholder="منبع (مثلاً auth, api)"
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(1); }}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir"
        />
      </div>

      {/* Error List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
          </div>
        ) : errors.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">خطایی یافت نشد</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {errors.map((err) => {
              const isExpanded = expandedId === err.id;
              return (
                <div key={err.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : err.id)}
                    className="w-full text-right p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                      <span className={severityBadge(err.severity)}>{err.severity}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{err.code}</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">{err.message}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                      <span className="text-slate-400">{utcStringToPersianDate(err.created_at)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">پیام: </span>
                          <span className="text-slate-800 dark:text-slate-200">{err.message}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">شناسه کاربر: </span>
                          <span className="text-slate-800 dark:text-slate-200 font-mono">{err.user_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">زمان: </span>
                          <span className="text-slate-800 dark:text-slate-200">{utcStringToPersianDate(err.created_at, true, true)}</span>
                        </div>
                        {err.detail && (
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">جزئیات: </span>
                            <pre className="mt-1 p-2 rounded bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                              {typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} — مجموع {toGroupedPersianDigits(total)} رویداد
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Admin Page
// ---------------------------------------------------------------------------

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  const tabs: { key: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'stats', label: 'آمار', icon: BarChart3 },
    { key: 'users', label: 'کاربران', icon: Users },
    { key: 'errors', label: 'خطاها', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-vazir dir-rtl">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">پنل مدیریت</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none">شاپیک</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'users' && <UsersTab currentUserId={user?.id || ''} />}
        {activeTab === 'errors' && <ErrorsTab />}
      </main>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Admin Guard (route-level)
// ---------------------------------------------------------------------------

export const AdminGuard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-slate-100 font-vazir dir-rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">در حال بارگذاری سامانه شاپیک...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Admin') {
    return <NotFoundPage />;
  }

  return <AdminPage />;
};
