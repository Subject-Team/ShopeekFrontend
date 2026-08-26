import React, { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb, CheckCircle2, History } from 'lucide-react';
import { AIAdvisory } from '../../types';
import { triggerManualAdvisory } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPersianTimeAsUTC } from '../../utils';
import { AdvisoryHistoryModal } from './AdvisoryHistoryModal';

interface AdvisoryCardProps {
  advisory: AIAdvisory | null;
  history?: AIAdvisory[];
  onRefresh?: () => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory, history = [], onRefresh }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleManualTrigger = async () => {
    setLoading(true);
    try {
      const res = await triggerManualAdvisory();
      if (res.advisory.success) {
        showToast(res.advisory.message, 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.advisory.message, 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'سرویس مشاوره هوشمند در دسترس نیست.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xs relative overflow-hidden bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/40">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base lg:text-lg flex flex-wrap items-center gap-2">
                <span>پیشنهاد هوشمند بهبود کسب‌وکار</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shrink-0">
                  هر ۳ ساعت
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                از هوش مصنوعی شاپیک
              </p>
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualTrigger}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-semibold shadow-xs transition-all disabled:opacity-60 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{loading ? 'در حال تحلیل...' : 'به‌روزرسانی دستی'}</span>
            <span className="xs:hidden">{loading ? '...' : 'بروزرسانی'}</span>
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-indigo-50 dark:border-indigo-950 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{advisory?.summary || 'خلاصه پیشنهاد'}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            {advisory?.recommendation_text || 'در حال تحلیل داده‌های اخیر فروش برای ارائه پیشنهادات کاربردی...'}
          </p>
        </div>

        {/* Footer & Actions */}
        <div className="mt-3.5 pt-2.5 border-t border-indigo-100/60 dark:border-indigo-950/60 flex flex-wrap items-center justify-between gap-2.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>بر اساس خلاصه ۳۰ روز گذشته</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* History Popup Trigger Button */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] sm:text-xs transition-colors border border-indigo-200/70 dark:border-indigo-800/70 shadow-2xs"
            >
              <History className="w-3.5 h-3.5" />
              <span>پیشنهادات قبلی</span>
            </button>

            {advisory?.generated_at && (
              <span suppressHydrationWarning className="shrink-0 text-slate-400 dark:text-slate-500">
                بروزرسانی: {formatPersianTimeAsUTC(advisory.generated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Advisory History Popup Modal */}
      <AdvisoryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
      />
    </>
  );
};
