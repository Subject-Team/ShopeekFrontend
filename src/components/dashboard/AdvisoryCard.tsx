import React, { useState } from 'react';
import { Sparkle, RefreshCw, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { AIAdvisory } from '../../types';
import { triggerManualAdvisory } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useBillingContext } from '../../context/BillingContext';
import { utcStringToPersianTime } from "../../utils/persian/date";
import { AdvisoryHistoryModal } from './AdvisoryHistoryModal';
import { CreditSpendConfirmModal } from '../credits/CreditSpendConfirmModal';
import { QuotaOrCreditInfo } from '../credits/QuotaOrCreditInfo';
import { PAYG_COSTS } from '../../config/credits';

interface AdvisoryCardProps {
  advisory: AIAdvisory | null;
  history?: AIAdvisory[];
  onRefresh?: () => void;
  readOnly?: boolean;
  status?: 'loading' | 'loaded' | 'failed';
  onRetry?: () => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory, history = [], onRefresh, readOnly = false, status = 'loaded', onRetry }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const { showToast } = useToast();
  const { billing, isSiteSuppressed, suppressSite, refreshBilling } = useBillingContext();

  const wallet = billing?.wallet ?? null;
  const remainingCredits = wallet ? wallet.purchased_balance + wallet.monthly_balance : 0;
  const aiUsage = billing?.usage?.find(u => u.feature_key === 'daily_ai_run_limit') ?? null;
  const paygCost = aiUsage?.payg_cost ?? PAYG_COSTS.daily_ai_run_limit ?? 3;
  const quotaLimit = aiUsage?.limit ?? null;
  const quotaLeft = quotaLimit === null
    ? null
    : aiUsage?.remaining !== undefined && aiUsage?.remaining !== null
      ? aiUsage.remaining
      : Math.max(0, quotaLimit - (aiUsage?.used ?? 0));
  const overQuota = quotaLimit !== null && quotaLeft !== null && quotaLeft <= 0;
  const blocked = overQuota && remainingCredits < paygCost;

  const performTrigger = async () => {
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
      void refreshBilling();
    }
  };

  const handleManualTrigger = async () => {
    if (readOnly || loading || blocked) return;
    if (!overQuota) {
      await performTrigger();
      return;
    }
    if (isSiteSuppressed('advisory') && remainingCredits >= paygCost) {
      await performTrigger();
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmTrigger = async () => {
    setShowConfirmModal(false);
    await performTrigger();
  };

  const handleDontShowAgain = async () => {
    setShowConfirmModal(false);
    await suppressSite('advisory');
    if (remainingCredits >= paygCost) {
      await performTrigger();
    }
  };

  return (
    <>
      <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xs relative overflow-hidden bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <Sparkle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <div className="w-full">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base lg:text-lg flex flex-wrap items-center gap-2">
                <span>توصیه اختصاصی از شاپیک</span>
                <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shrink-0">
                  تحلیل همه جانبه
                </span>
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <QuotaOrCreditInfo usage={aiUsage} units={1} featureKey="daily_ai_run_limit" />

            {/* History Popup Trigger Button */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex-1 sm:flex-initial flex justify-center items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] sm:text-xs transition-colors border border-indigo-200/70 dark:border-indigo-800/70 shadow-2xs whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5" />
              <span>پیشنهادات قبلی</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualTrigger}
              disabled={loading || readOnly || blocked}
              title={readOnly ? 'در حالت فقط-خواندنی، پیشنهاد هوشمند جدید تولید نمی‌شود.' : blocked ? 'اعتبار کافی نیست' : undefined}
              className="flex-1 sm:flex-initial flex justify-center items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-semibold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{loading ? 'در حال تحلیل...' : 'به‌روزرسانی دستی'}</span>
              <span className="xs:hidden">{loading ? '...' : 'بروزرسانی دستی'}</span>
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-indigo-50 dark:border-indigo-950 shadow-xs space-y-2">
          {status === 'failed' && !advisory ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-semibold flex items-center gap-2" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                بارگذاری توصیه هوشمند با خطا مواجه شد.
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-bold border border-indigo-200/70 dark:border-indigo-800/70 transition-colors shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  تلاش دوباره
                </button>
              )}
            </div>
          ) : status === 'loaded' && !advisory ? (
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              هنوز توصیه‌ای تولید نشده است. برای دریافت توصیه، دکمه بروزرسانی دستی را بزنید.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                <Sparkle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{advisory?.summary || 'خلاصه پیشنهاد'}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                {advisory?.recommendation_text || 'در حال تحلیل داده‌های اخیر فروش برای ارائه پیشنهادات کاربردی...'}
              </p>
            </>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="mt-3.5 pt-2.5 border-t border-indigo-100/60 dark:border-indigo-950/60 flex flex-wrap items-center justify-between gap-2.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>بر اساس خلاصه ۳۰ روز گذشته</span>
            </span>
          </div>

          {advisory?.generated_at && (
            <span suppressHydrationWarning className="shrink-0 text-slate-400 dark:text-slate-500">
              بروزرسانی: {utcStringToPersianTime(advisory.generated_at)}
            </span>
          )}
        </div>
      </div>

      {/* Advisory History Popup Modal */}
      <AdvisoryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
      />

      <CreditSpendConfirmModal
        open={showConfirmModal}
        cost={paygCost}
        remaining={remainingCredits}
        actionLabel="تولید پیشنهاد هوشمند"
        quotaExhausted={overQuota}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={confirmTrigger}
        onDontShowAgain={handleDontShowAgain}
      />
    </>
  );
};
