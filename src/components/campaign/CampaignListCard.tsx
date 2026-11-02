import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { fetchCampaignsOverview, deleteCampaign } from '../../services/api';
import { CampaignsOverview, AdCampaign, CampaignPerformanceStatus } from '../../types';
import { CreateCampaignModal } from './CreateCampaignModal';
import { useToast } from '../../context/ToastContext';
import { toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';

interface CampaignListCardProps {
  onCampaignCreated?: () => void;
}

export const CampaignListCard: React.FC<CampaignListCardProps> = ({ onCampaignCreated }) => {
  const { showToast } = useToast();
  const [data, setData] = useState<CampaignsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await fetchCampaignsOverview();
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDelete = async (campaign: AdCampaign) => {
    const confirmed = window.confirm(`آیا از حذف کمپین «${campaign.title}» اطمینان دارید؟`);
    if (!confirmed) return;

    try {
      setDeletingId(campaign.id);
      await deleteCampaign(campaign.id);
      showToast('کمپین با موفقیت حذف شد.', 'info');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در حذف کمپین';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: CampaignPerformanceStatus, isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
          <Clock className="w-3 h-3 animate-spin" />
          در حال پایش (فعال)
        </span>
      );
    }

    switch (status) {
      case 'excellent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            🟢 بسیار موفق (عالی)
          </span>
        );
      case 'profitable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            🔵 سودآور و مثبت
          </span>
        );
      case 'breakeven':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            🟡 نزدیک به سر‌به‌سر
          </span>
        );
      case 'loss':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            🔴 زیان‌ده / بدون بازدهی
          </span>
        );
    }
  };

  const campaigns = data?.campaigns ?? [];
  const summary = data?.summary;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              هوش پایش تبلیغات و بازگشت سرمایه (ROAS & CAC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              محاسبه خودکار جهش فروش مازاد نسبت به روزهای عادی، نرخ بازگشت سرمایه و هزینه جذب هر مشتری جدید
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت تبلیغ جدید</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <span className="text-xs font-semibold">در حال بررسی داده‌های تبلیغات و بازگشت سرمایه...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="py-8 text-center text-xs text-rose-500 flex flex-col items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>خطا در دریافت اطلاعات کمپین‌ها</span>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Summary KPI Strip */}
          {summary && summary.total_cost > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  مجموع هزینه تبلیغات
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {toGroupedPersianDigits(summary.total_cost)} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  فروش مازاد ناشی از تبلیغات
                </span>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {toGroupedPersianDigits(summary.total_lift)} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  میانگین بازگشت سرمایه (ROAS)
                </span>
                <p className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                  {toPersianDigits(summary.avg_roas.toFixed(2))} <span className="text-[10px] font-normal text-slate-400">برابر</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  مشتریان جدید جذب‌شده
                </span>
                <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {toGroupedPersianDigits(summary.total_new_customers)} <span className="text-[10px] font-normal text-slate-400">مشتری</span>
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {campaigns.length === 0 ? (
            <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                  هنوز تبلیغی ثبت نکرده‌اید
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  هروقت به یک بلاگر استوری دادید یا کمپین برگزار کردید، مشخصات آن را اینجا ثبت کنید تا شاپیک فروش مازاد، بازگشت سرمایه (ROAS) و هزینه جذب مشتری را دقیقاً برایتان حساب کند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                + ثبت اولین تبلیغ
              </button>
            </div>
          ) : (
            /* Campaign Cards List */
            <div className="space-y-3">
              {campaigns.map((camp) => {
                const m = camp.metrics;
                return (
                  <div
                    key={camp.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                  >
                    {/* Top Row: Title, Channel, Status & Delete */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {camp.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {camp.channel === 'Instagram'
                            ? 'اینستاگرام'
                            : camp.channel === 'Telegram'
                            ? 'تلگرام'
                            : camp.channel}
                        </span>
                        {getStatusBadge(m.performance_status, m.is_active)}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(camp)}
                          disabled={deletingId === camp.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف کمپین"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      {/* Cost */}
                      <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          هزینه تبلیغ
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {toGroupedPersianDigits(camp.cost)} ت
                        </span>
                      </div>

                      {/* Total Sales in Window */}
                      <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          فروش در بازه
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {toGroupedPersianDigits(m.total_sales)} ت
                        </span>
                      </div>

                      {/* Attributed Lift */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 space-y-1">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          جهش مازاد (Lift)
                        </span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                          +{toGroupedPersianDigits(m.lift_sales)} ت
                        </span>
                      </div>

                      {/* ROAS */}
                      <div className="p-2.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 space-y-1">
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block">
                          بازگشت سرمایه (ROAS)
                        </span>
                        <span className="font-extrabold text-brand-700 dark:text-brand-300">
                          {toPersianDigits(m.roas.toFixed(2))} برابر
                        </span>
                      </div>

                      {/* New Customers */}
                      <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 space-y-1">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                          مشتریان جدید
                        </span>
                        <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                          {toGroupedPersianDigits(m.new_customers_count)} نفر
                        </span>
                      </div>

                      {/* CAC */}
                      <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          هزینه جذب هر مشتری
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {m.new_customers_count > 0 ? `${toGroupedPersianDigits(m.cac)} ت` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Notes if provided */}
                    {camp.notes && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-slate-700 dark:text-slate-200 ml-1">توضیحات:</strong>
                          {camp.notes}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <CreateCampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          void loadData();
          onCampaignCreated?.();
        }}
      />
    </div>
  );
};
