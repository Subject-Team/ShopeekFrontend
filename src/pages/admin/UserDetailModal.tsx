import React, { useEffect, useState } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  Trash2,
  Save,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { UserBillingPanel } from '../../components/admin/UserBillingPanel';
import {
  fetchAdminUserTransactions,
  updateAdminUser,
  deleteAdminUser,
  restoreAdminUser,
} from '../../services/api';
import type { AdminUserItem, AdminTransaction } from '../../types/admin';
import { toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';

interface UserDetailModalProps {
  user: AdminUserItem;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: string;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdated, currentUserId }) => {
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
                      <span className="text-slate-400 ms-2">{utcStringToPersianDate(tx.transaction_date)}</span>
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
