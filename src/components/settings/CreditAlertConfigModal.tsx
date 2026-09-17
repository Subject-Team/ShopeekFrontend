import React from 'react';
import { CREDIT_ALERT_SITES } from '../../config/credits';
import { toGroupedPersianDigits } from '../../utils/persian';

interface CreditAlertConfigModalProps {
  open: boolean;
  suppressedSites: string[];
  onToggleSite: (siteKey: string, show: boolean) => void;
  onClose: () => void;
}

/** Per-site alert on/off configuration (reached from the settings row gear icon). */
export const CreditAlertConfigModal: React.FC<CreditAlertConfigModalProps> = ({
  open,
  suppressedSites,
  onToggleSite,
  onClose,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const alertCount = CREDIT_ALERT_SITES.length - suppressedSites.length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-alert-config-title"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 id="credit-alert-config-title" className="font-extrabold text-slate-900 dark:text-white text-sm">
              تنظیم هشدار برداشت اعتبار
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              هشدار برای {toGroupedPersianDigits(alertCount)} از {toGroupedPersianDigits(CREDIT_ALERT_SITES.length)} مورد فعال است
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          {CREDIT_ALERT_SITES.map((site) => {
            const isOn = !suppressedSites.includes(site.key);
            return (
              <div
                key={site.key}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{site.label}</span>
                <button
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`هشدار ${site.label}`}
                  onClick={() => onToggleSite(site.key, !isOn)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 cursor-pointer ${isOn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all ${isOn ? 'start-0.5' : 'start-[calc(100%-1.375rem)]'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            پایان
          </button>
        </div>
      </div>
    </div>
  );
};
