import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { CreditIcon } from '../icons';
import { LOW_CREDIT_THRESHOLD } from '../../config/credits';
import { toGroupedPersianDigits } from '../../utils/persian';

interface CreditSpendConfirmModalProps {
  open: boolean;
  cost: number;
  remaining: number;
  actionLabel: string;
  quotaExhausted?: boolean;
  freeUnits?: number;
  onCancel: () => void;
  onConfirm: () => void;
  onDontShowAgain?: () => void;
}

/** Reusable pre-usage credit confirmation (#155) — mirrors the clear-chat modal shell. */
export const CreditSpendConfirmModal: React.FC<CreditSpendConfirmModalProps> = ({
  open,
  cost,
  remaining,
  actionLabel,
  quotaExhausted = true,
  freeUnits,
  onCancel,
  onConfirm,
  onDontShowAgain,
}) => {
  const [dontShowArmed, setDontShowArmed] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) setDontShowArmed(false);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = (): HTMLElement[] =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea'),
      ).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const after = remaining - cost;
  const insufficient = after < 0;
  const lowAfter = !insufficient && after <= LOW_CREDIT_THRESHOLD;

  const accent = insufficient
    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
    : lowAfter
      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-confirm-title"
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${accent}`}>
            <CreditIcon size={18} />
          </div>
          <h4 id="credit-confirm-title" className="font-extrabold text-slate-900 dark:text-white text-sm">
            برداشت اعتبار
          </h4>
        </div>

        {quotaExhausted && (
          <div className="flex items-start gap-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-3 py-2 text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-500" />
            <span>
              سهمیه پایه طرح اشتراک شما تکمیل شده است؛ به همین دلیل ادامه عملیات از اعتبار کیف پول شما برداشت می‌شود.
            </span>
          </div>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {actionLabel} <b className="text-slate-800 dark:text-slate-200">{toGroupedPersianDigits(cost)} اعتبار</b> برداشت می‌کند.
        </p>

        {freeUnits !== undefined && freeUnits > 0 && (
          <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 leading-relaxed">
            {toGroupedPersianDigits(freeUnits)} مورد در سهمیه رایگان پردازش می‌شود.
          </p>
        )}

        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 px-3 py-2.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            اعتبار فعلی: <b className="text-slate-800 dark:text-slate-200">{toGroupedPersianDigits(remaining)}</b>
          </span>
          <span
            className={`font-bold ${
              insufficient
                ? 'text-rose-600 dark:text-rose-400'
                : lowAfter
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            پس از عملیات: {toGroupedPersianDigits(after)}
          </span>
        </div>

        {insufficient && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 px-3 py-2.5">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
              اعتبار کافی نیست.
            </span>
            <Link
              to="/dashboard/subscription"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors shrink-0"
            >
              شارژ اعتبار در صفحه اشتراک
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {onDontShowAgain ? (
            <button
              onClick={() => {
                if (dontShowArmed) {
                  setDontShowArmed(false);
                  onDontShowAgain();
                  return;
                }
                setDontShowArmed(true);
              }}
              onBlur={() => setDontShowArmed(false)}
              title="قابل تغییر از تنظیمات"
              className={`text-[11px] font-bold rounded-xl px-3 py-2 border transition-colors ${
                dontShowArmed
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              {dontShowArmed ? 'مطمئن هستید؟' : 'دیگر نشان نده'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              disabled={insufficient}
              title={insufficient ? 'اعتبار کافی نیست' : undefined}
              className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                insufficient
                  ? 'bg-rose-600 shadow-rose-500/25'
                  : lowAfter
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
              }`}
            >
              {insufficient ? 'اعتبار کافی نیست' : `تأیید و ${toGroupedPersianDigits(cost)} اعتبار برداشت`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
