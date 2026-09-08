import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DangerZoneCardProps {
  onDeleteClick: () => void;
  disabled?: boolean;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  onDeleteClick,
  disabled = false,
}) => {
  return (
    <div
      data-guide="settings-danger-zone"
      className="p-6 rounded-3xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-base">
            بخش حساس (منطقه خطر)
          </h3>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
            عملیات‌های دارای تأثیر دائمی بر حساب کاربری
          </p>
        </div>
      </div>

      <div className="border-t border-rose-200/80 dark:border-rose-900/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            حذف حساب کاربری
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            با حذف حساب، دسترسی شما به سامانه قطع خواهد شد. اطلاعات شما تا ۷ روز نگهداری می‌شود و پس از آن به صورت دائمی پاکسازی خواهد شد.
          </p>
        </div>

        <button
          type="button"
          onClick={onDeleteClick}
          disabled={disabled}
          className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>حذف حساب کاربری</span>
        </button>
      </div>
    </div>
  );
};
