import React, { useState } from 'react';
import { X, Sparkles, ChevronDown, Lightbulb, Clock, History } from 'lucide-react';
import { AIAdvisory } from '../../types';
import { formatPersianDateAsUTC } from '../../utils';

interface AdvisoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AIAdvisory[];
}

export const AdvisoryHistoryModal: React.FC<AdvisoryHistoryModalProps> = ({
  isOpen,
  onClose,
  history
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                پیشنهادات قبلی هوش مصنوعی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تاریخچه توصیه‌های راهبردی ۳ روز اخیر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="بستن"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Accordion List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900/50">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                هیچ پیشنهادی در ۳ روز گذشته ثبت نشده است
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                توصیه‌های هوشمند بر اساس تحلیل فروش‌های ثبت‌شده و هر ۳ ساعت یا به‌صورت دستی تولید می‌شوند.
              </p>
            </div>
          ) : (
            history.map(item => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'border-indigo-200 dark:border-indigo-800/80 shadow-xs bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-right gap-3 transition-colors focus:outline-hidden ${
                      isExpanded
                        ? 'bg-slate-50/80 dark:bg-slate-800/60'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Right side: Title / Summary */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isExpanded
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                        {item.summary || 'پیشنهاد هوشمند'}
                      </span>
                    </div>

                    {/* Left side: Datetime & Accordion chevron toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {item.generated_at && (
                        <span className="hidden xs:flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                          <Clock className="w-3 h-3" />
                          <span suppressHydrationWarning>
                            {formatPersianDateAsUTC(item.generated_at, false, true)}
                          </span>
                        </span>
                      )}
                      <div
                        className={`p-1.5 rounded-lg border transition-all duration-200 ${
                          isExpanded
                            ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Accordion Expanded Content (Structured like Dashboard Card) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-indigo-100/60 dark:border-indigo-900/40">
                      <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                        {/* Title Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{item.summary || 'خلاصه پیشنهاد'}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">
                            {item.trigger_type === 'MANUAL' ? 'تولید دستی' : 'تولید خودکار ۳ ساعته'}
                          </span>
                        </div>

                        {/* Content Body */}
                        <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                          {item.recommendation_text}
                        </p>

                        {/* Card Footer */}
                        {item.generated_at && (
                          <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-end text-[10px] sm:text-[11px]">
                            <span suppressHydrationWarning className="font-medium text-slate-400 dark:text-slate-500">
                              زمان تولید: {formatPersianDateAsUTC(item.generated_at, true, true)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
