import React, { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb, CheckCircle2 } from 'lucide-react';
import { AIAdvisory } from '../../types';
import { triggerManualAdvisory } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface AdvisoryCardProps {
  advisory: AIAdvisory | null;
  onRefresh?: () => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory, onRefresh }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleManualTrigger = async () => {
    setLoading(true);
    try {
      const res = await triggerManualAdvisory();
      if (res.success) {
        showToast(res.message, res.advisory ? 'success' : 'info');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.message, 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'سرویس مشاوره هوشمند در دسترس نیست.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl shadow-xs relative overflow-hidden bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base lg:text-lg flex items-center gap-2">
              <span>پیشنهاد هوشمند مشاوره کسب‌وکار</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                هر ۳ ساعت
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">تولید شده توسط موتور هوش مصنوعی شاپیک</p>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={handleManualTrigger}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'در حال تحلیل...' : 'به‌روزرسانی دستی'}</span>
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-indigo-50 dark:border-indigo-950 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{advisory?.summary || 'خلاصه پیشنهاد'}</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
          {advisory?.recommendation_text || 'در حال تحلیل داده‌های اخیر فروش برای ارائه پیشنهادات کاربردی...'}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>بررسی شده با خلاصه ۷ روز گذشته (عدم تکرار)</span>
        </span>
        {advisory?.generated_at && (
          <span suppressHydrationWarning>
            تاریخ بروزرسانی: {new Date(advisory.generated_at.endsWith('Z') ? advisory.generated_at : advisory.generated_at + 'Z').toLocaleTimeString('fa-IR')}
          </span>
        )}
      </div>
    </div>
  );
};
