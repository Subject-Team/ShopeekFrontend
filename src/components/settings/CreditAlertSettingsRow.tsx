import React from 'react';
import { Settings2 } from 'lucide-react';
import { CreditIcon } from '../icons';
import { CreditAlertConfigModal } from './CreditAlertConfigModal';

interface CreditAlertSettingsRowProps {
  suppressedSites: string[];
  onResetAll: () => void;
  onToggleSite: (siteKey: string, show: boolean) => void;
}

/** Settings-page row: reset all credit-spend alerts + per-site configuration. */
export const CreditAlertSettingsRow: React.FC<CreditAlertSettingsRowProps> = ({
  suppressedSites,
  onResetAll,
  onToggleSite,
}) => {
  const [configOpen, setConfigOpen] = React.useState(false);

  return (
    <div className="glass-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400">
            <CreditIcon size={16} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">هشدار برداشت اعتبار</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              پیش از برداشت اعتبار از کیف پول، مودال تأیید نمایش داده می‌شود.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAll}
            className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            بازنشانی و نمایش برای همه
          </button>
          <button
            onClick={() => setConfigOpen(true)}
            title="تنظیم هشدار برای هر بخش"
            aria-label="تنظیم هشدار برای هر بخش"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CreditAlertConfigModal
        open={configOpen}
        suppressedSites={suppressedSites}
        onToggleSite={onToggleSite}
        onClose={() => setConfigOpen(false)}
      />
    </div>
  );
};
