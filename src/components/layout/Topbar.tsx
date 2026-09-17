import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkle,
  Menu,
  Calendar,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { CreditIcon } from '../icons';
import { usePageContext } from '../../context/PageContext';
import { useAuth } from '../../context/AuthContext';
import { getPageTitle } from '../../utils/routes';
import { JalaliDateRangeModal } from '../common/JalaliDateRangeModal';
import { formatJalaliRangeLabel } from '../../utils/persian/date';
import { toGroupedPersianDigits } from '../../utils/persian';
import { planLabel } from '../../config/plansDisplay';
import { LOW_CREDIT_THRESHOLD } from '../../config/credits';
import { useBillingContext } from '../../context/BillingContext';
import type { BillingOverview } from '../../types';

interface TopbarProps {
  onMenuClick: () => void;
  billing?: BillingOverview | null;
}

const getPlanDisplay = (key: string | null | undefined): string => {
  if (key === 'trial') return 'آزمایشی';
  if (key === 'lite') return 'لایت';
  if (key === 'pro') return 'پرو';
  if (key === 'lifetime') return 'نامحدود';
  return key ? planLabel(key) : 'آزمایشی';
};

const getPlanActionLabel = (key: string | null | undefined): string => {
  if (key === 'trial') return 'خرید اشتراک';
  if (key === 'lite') return 'ارتقای اشتراک';
  return 'تمدید اشتراک';
};

type CreditChipState = 'normal' | 'low' | 'debt';

const CREDIT_CHIP_CLASSES: Record<CreditChipState, string> = {
  normal:
    'border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100/80 dark:hover:bg-sky-900/60',
  low: 'border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/60',
  debt: 'border-rose-300/80 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100/80 dark:hover:bg-rose-900/60',
};

const CREDIT_PILL_CLASSES: Record<CreditChipState, string> = {
  normal: 'bg-sky-600 dark:bg-sky-500 group-hover:bg-sky-700 dark:group-hover:bg-sky-400',
  low: 'bg-amber-500 dark:bg-amber-500 group-hover:bg-amber-600 dark:group-hover:bg-amber-400',
  debt: 'bg-rose-600 dark:bg-rose-500 group-hover:bg-rose-700 dark:group-hover:bg-rose-400',
};

const CREDIT_ICON_CLASSES: Record<CreditChipState, string> = {
  normal: 'text-sky-600 dark:text-sky-400',
  low: 'text-amber-600 dark:text-amber-400',
  debt: 'text-rose-600 dark:text-rose-400',
};

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, billing: propsBilling }) => {
  const {
    startDate,
    endDate,
    isHistorical,
    setDateRange,
    setIsChatOpen,
  } = usePageContext();
  const { user } = useAuth();
  const { billing: contextBilling } = useBillingContext();
  const billing = propsBilling !== undefined ? propsBilling : contextBilling;
  const location = useLocation();
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

  const showDateFilter =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/' ||
    location.pathname === '/dashboard/analytics';

  const getDateButtonLabel = () => {
    return formatJalaliRangeLabel(startDate, endDate);
  };

  const isExempt = billing?.plan?.is_exempt === true || user?.role === 'Admin' || user?.plan_key === 'lifetime';
  const planKey = isExempt ? 'lifetime' : (billing?.plan?.key ?? user?.plan_key ?? 'trial');
  const planDisplay = isExempt ? 'نامحدود' : (billing?.plan?.name_fa || getPlanDisplay(planKey));
  const planActionLabel = getPlanActionLabel(planKey);

  const wallet = billing?.wallet;
  const remainingCredits = wallet ? wallet.purchased_balance + wallet.monthly_balance : 0;
  const chipState: CreditChipState =
    (wallet?.purchased_balance ?? 0) < 0
      ? 'debt'
      : wallet !== null && remainingCredits <= LOW_CREDIT_THRESHOLD
        ? 'low'
        : 'normal';

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 lg:px-8 flex items-center justify-between transition-colors duration-200 dir-rtl">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="باز کردن منو"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-sm md:text-base lg:text-lg truncate max-w-[120px] md:max-w-[200px] lg:max-w-[280px]">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subscription Plan Card */}
        <Link
          to="/dashboard/subscription"
          data-guide="topbar-subscription"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-brand-200/80 dark:border-brand-900/60 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100/80 dark:hover:bg-brand-900/60 transition-all text-xs font-bold shadow-2xs group shrink-0"
          title={`طرح اشتراک: ${planDisplay}`}
        >
          <CreditCard className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
          <span>{planDisplay}</span>
          {!isExempt && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-brand-600 dark:bg-brand-500 text-white text-[11px] font-bold group-hover:bg-brand-700 dark:group-hover:bg-brand-400 transition-colors shadow-2xs">
              {planActionLabel}
            </span>
          )}
        </Link>

        {/* Remaining Credits Card */}
        <Link
          to="/dashboard/subscription"
          data-guide="topbar-credits"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold shadow-2xs group shrink-0 ${CREDIT_CHIP_CLASSES[chipState]}`}
          title="اعتبار باقی‌مانده"
        >
          <CreditIcon size={14} className={`${CREDIT_ICON_CLASSES[chipState]} shrink-0`} />
          <span>{isExempt ? 'نامحدود' : toGroupedPersianDigits(remainingCredits)}</span>
          {!isExempt && (
            <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-white text-[11px] font-bold transition-colors shadow-2xs ${CREDIT_PILL_CLASSES[chipState]}`}>
              خرید اعتبار
            </span>
          )}
        </Link>

        {/* Date Range Selector Trigger */}
        {showDateFilter && (
          <div data-guide="date-filter" className="relative shrink-0">
            <button
              onClick={() => setIsDateModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                isHistorical
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
              title={isHistorical ? 'در حال مشاهده آمار گذشته' : 'انتخاب بازه زمانی'}
            >
              <Calendar className={`w-3.5 h-3.5 ${isHistorical ? 'text-amber-500' : 'text-slate-400'}`} />
              {/* Hide text label on mobile screens to prevent topbar overflow */}
              <span className="hidden md:inline">
                {getDateButtonLabel()}
              </span>
              {isHistorical && (
                <span className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md font-medium">
                  آرشیو
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Jalali Calendar Modal */}
            <JalaliDateRangeModal
              isOpen={isDateModalOpen}
              onClose={() => setIsDateModalOpen(false)}
              startDate={startDate}
              endDate={endDate}
              onApply={(newStart, newEnd) => setDateRange(newStart, newEnd)}
            />
          </div>
        )}

        {/* Floating Chat Drawer Trigger */}
        <button
          data-guide="chat-trigger"
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all duration-200 shrink-0"
          title="دستیار هوشمند"
        >
          <Sparkle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:inline">دستیار هوشمند</span>
        </button>
      </div>
    </header>
  );
};
