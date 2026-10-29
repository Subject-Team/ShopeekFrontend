import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Bug,
  Lightbulb,
  Sparkles,
  Gift,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  MessageSquare,
} from 'lucide-react';
import {
  fetchAdminFeedback,
  updateAdminFeedbackStatus,
  grantAdminFeedbackReward,
} from '../../services/api';
import type { AdminFeedbackItem } from '../../types/admin';
import { toPersianDigits, toGroupedPersianDigits } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';
import { ModalOverlay } from '../../components/common/ModalOverlay';

export const FeedbackTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Reward modal state
  const [rewardingItem, setRewardingItem] = useState<AdminFeedbackItem | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(25);
  const [rewardNote, setRewardNote] = useState<string>('');
  const [rewardSubmitting, setRewardSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pageSize = 15;

  const loadFeedback = useCallback(async (p: number, st: string, tp: string) => {
    setLoading(true);
    try {
      const res = await fetchAdminFeedback(p, pageSize, st || undefined, tp || undefined);
      setFeedbacks(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback(page, status, type);
  }, [page, status, type, loadFeedback]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = async (item: AdminFeedbackItem, newStatus: string) => {
    try {
      const updated = await updateAdminFeedbackStatus(item.id, newStatus);
      setFeedbacks((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
      showToast('وضعیت بازخورد بروزرسانی شد.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در تغییر وضعیت';
      alert(msg);
    }
  };

  const handleGrantReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardingItem) return;
    if (rewardAmount <= 0) {
      alert('مبلغ پاداش باید بزرگتر از صفر باشد.');
      return;
    }

    setRewardSubmitting(true);
    try {
      const updated = await grantAdminFeedbackReward(rewardingItem.id, rewardAmount, rewardNote.trim() || undefined);
      setFeedbacks((prev) => prev.map((f) => (f.id === rewardingItem.id ? updated : f)));
      showToast(`پاداش ${toGroupedPersianDigits(rewardAmount)} اعتبار با موفقیت اعطا شد.`);
      setRewardingItem(null);
      setRewardAmount(25);
      setRewardNote('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در اعطای پاداش';
      alert(msg);
    } finally {
      setRewardSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getTypeBadge = (tp: string) => {
    switch (tp) {
      case 'bug_report':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <Bug className="w-3 h-3" />
            گزارش خطا
          </span>
        );
      case 'feature_request':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <Lightbulb className="w-3 h-3" />
            قابلیت جدید
          </span>
        );
      case 'improvement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Sparkles className="w-3 h-3" />
            پیشنهاد بهبود
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {tp}
          </span>
        );
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            در انتظار بررسی
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            بررسی شده
          </span>
        );
      case 'rewarded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Gift className="w-3 h-3" />
            پاداش داده شده
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            بسته شده
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-vazir dir-rtl">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters row */}
      <div className="flex gap-2 sm:gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="reviewed">بررسی شده</option>
            <option value="rewarded">پاداش داده شده</option>
            <option value="closed">بسته شده</option>
          </select>

          {/* Type filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="">همه انواع</option>
            <option value="bug_report">گزارش خطا (باگ)</option>
            <option value="feature_request">درخواست قابلیت</option>
            <option value="improvement">پیشنهاد بهبود</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          مجموع: {toGroupedPersianDigits(total)} مورد
        </span>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="text-xs">در حال دریافت بازخوردها...</span>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs">هیچ بازخوردی با فیلترهای انتخابی یافت نشد.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {feedbacks.map((f) => (
              <div key={f.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(f.type)}
                    {getStatusBadge(f.status)}
                    {f.reward_amount > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        +{toGroupedPersianDigits(f.reward_amount)} اعتبار
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {utcStringToPersianDate(f.created_at, true, true)}
                  </span>
                </div>

                {/* Submitter & Page Info */}
                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {f.user_full_name || 'کاربر ناشناس'}
                    </span>
                    {(f.user_phone || f.user_email) && (
                      <span className="text-[11px] text-slate-400">
                        ({f.user_phone ? toPersianDigits(f.user_phone) : f.user_email})
                      </span>
                    )}
                  </div>

                  {f.page_url && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-auto">
                      <span>مسیر:</span>
                      <code className="text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {f.page_url}
                      </code>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1.5">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {f.description}
                  </p>
                </div>

                {/* Screenshot & Admin Notes Row */}
                <div className="flex items-start gap-4 pt-1 flex-wrap">
                  {f.screenshot_data && (
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(f.screenshot_data || null)}
                        className="group relative block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs hover:border-brand-500 transition-all"
                        title="مشاهده تصویر در اندازه کامل"
                      >
                        <img
                          src={f.screenshot_data}
                          alt="اسکرین‌شات بازخورد"
                          className="w-28 h-18 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          بزرگ‌نمایی
                        </div>
                      </button>
                    </div>
                  )}

                  {f.admin_notes && (
                    <div className="flex-1 min-w-[200px] p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                      <span className="font-bold block mb-1">یادداشت مدیر:</span>
                      <pre className="whitespace-pre-line font-vazir leading-relaxed">
                        {f.admin_notes}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">تغییر وضعیت:</span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(f, 'reviewed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        f.status === 'reviewed'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      بررسی شده
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(f, 'closed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        f.status === 'closed'
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      بستن
                    </button>
                  </div>

                  {f.user_id && (
                    <button
                      type="button"
                      onClick={() => setRewardingItem(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>اعطای پاداش اعتبار</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} — مجموع {toGroupedPersianDigits(total)} مورد
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

      {/* Screenshot full preview modal */}
      {previewImage && (
        <ModalOverlay onClick={() => setPreviewImage(null)}>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 text-white">
                <span className="text-xs font-bold">تصویر اسکرین‌شات پیوست شده</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 overflow-auto max-h-[calc(90vh-60px)]">
                <img
                  src={previewImage}
                  alt="Full preview"
                  className="max-w-full h-auto mx-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Grant Reward Modal */}
      {rewardingItem && (
        <ModalOverlay onClick={() => setRewardingItem(null)}>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 font-vazir dir-rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">اعطای پاداش اعتبار</h3>
                </div>
                <button
                  onClick={() => setRewardingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  <strong>کاربر:</strong> {rewardingItem.user_full_name || rewardingItem.user_email || rewardingItem.user_phone}
                </p>
                <p className="truncate">
                  <strong>موضوع:</strong> {rewardingItem.title}
                </p>
              </div>

              <form onSubmit={handleGrantReward} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    تعداد اعتبار پاداش <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setRewardAmount(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          rewardAmount === amt
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {toPersianDigits(amt)} اعتبار
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    یادداشت (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={rewardNote}
                    onChange={(e) => setRewardNote(e.target.value)}
                    placeholder="مثال: تشکر بابت گزارش باگ فرم فاکتور"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    maxLength={200}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRewardingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={rewardSubmitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
                  >
                    {rewardSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>در حال ثبت...</span>
                      </>
                    ) : (
                      <span>تایید و اعطای پاداش</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
