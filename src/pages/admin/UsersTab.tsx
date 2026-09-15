import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
} from '../../services/api';
import type { AdminUserItem } from '../../types/admin';
import { planLabel } from '../../config/plansDisplay';
import { toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';
import { utcStringToPersianDate, formatJalaliNumeric } from '../../utils/persian/date';
import { UserDetailModal } from './UserDetailModal';

interface UsersTabProps {
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Plan cell helpers (users table)
// ---------------------------------------------------------------------------

const PLAN_BADGE_LABELS: Record<string, string> = {
  trial: 'آزمایشی',
  active: 'فعال',
  expired: 'منقضی',
  exempt: 'معاف',
};

const PLAN_BADGE_STYLES: Record<string, string> = {
  trial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  expired: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  exempt: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const planCellLabel = (u: AdminUserItem): string => {
  const key = u.plan_key;
  if (key === 'exempt' || u.subscription_status === 'exempt') return 'معاف';
  if (!key) return '—';
  const label = planLabel(key);
  return label !== 'بدون طرح' ? label : key.charAt(0).toUpperCase() + key.slice(1);
};

const planCellBadge = (status: string | undefined): { label: string; className: string } | null => {
  if (!status) return null;
  return {
    label: PLAN_BADGE_LABELS[status] ?? status,
    className: PLAN_BADGE_STYLES[status] ?? PLAN_BADGE_STYLES.exempt,
  };
};

const planCellMeta = (u: AdminUserItem): string | null => {
  const days = u.remaining_days;
  if (days != null && days > 0) return `${toPersianDigits(days)} روز مانده`;
  if (u.subscription_expires_at) {
    return `انقضا: ${toPersianDigits(formatJalaliNumeric(u.subscription_expires_at))}`;
  }
  return null;
};

export const UsersTab: React.FC<UsersTabProps> = ({ currentUserId }) => {
  const { showToast } = useToast();
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
      fetchAdminUserDetail(selectedUser.id)
        .then(setSelectedUser)
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'خطا در بارگذاری جزئیات کاربر';
          showToast(msg, 'error');
        });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir dir-rtl"
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute start-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
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
              ? 'border-s-4 border-s-rose-600'
              : isDeleted
              ? 'border-s-4 border-s-amber-500'
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
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">طرح</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">وضعیت</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">مشتریان</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">تراکنش</th>
                <th className="text-right p-3 font-bold text-slate-500 dark:text-slate-400">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <Loader2 className="w-5 h-5 text-brand-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">کاربری یافت نشد</td>
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

                  const planLabelText = planCellLabel(u);
                  const planBadge = planCellBadge(u.subscription_status);
                  const planMeta = planCellMeta(u);

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
                      <td className="p-3 whitespace-nowrap">
                        {planLabelText === '—' ? (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{planLabelText}</span>
                            {planBadge && (
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${planBadge.className}`}>
                                {planBadge.label}
                              </span>
                            )}
                            {planMeta && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">{planMeta}</span>
                            )}
                          </div>
                        )}
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
