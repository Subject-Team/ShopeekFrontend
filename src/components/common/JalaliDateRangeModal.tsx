import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  toJalali,
  jalaliToGregorian,
  getJalaliMonthDays,
  toIsoDate,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_NAMES,
  getDayDifference,
  formatJalaliRangeLabel,
  getPersianDayOfWeek,
} from '../../utils/jalali';
import { formatPersianNumber } from '../../utils';

interface JalaliDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  onApply: (startIso: string, endIso: string) => void;
}

export const JalaliDateRangeModal: React.FC<JalaliDateRangeModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApply,
}) => {
  // Temporary selection inside modal
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  // Validation error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Month navigation in calendar
  const [viewYear, setViewYear] = useState<number>(() => toJalali(endDate).jy);
  const [viewMonth, setViewMonth] = useState<number>(() => toJalali(endDate).jm);

  // Today reference & limit constants
  const today = new Date();
  const todayIso = toIsoDate(today);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - 60);
  const minDateIso = toIsoDate(minDate);

  // Reset temporary state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempStart(startDate);
      setTempEnd(endDate);
      const jEnd = toJalali(endDate);
      setViewYear(jEnd.jy);
      setViewMonth(jEnd.jm);
      setErrorMessage(null);
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Build calendar matrix for current viewMonth
  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const { gy: firstGy, gm: firstGm, gd: firstGd } = jalaliToGregorian(viewYear, viewMonth, 1);
  const firstDayDate = new Date(firstGy, firstGm - 1, firstGd);
  const startDayOfWeek = getPersianDayOfWeek(firstDayDate); // 0 (Shanbeh) to 6 (Jomeh)

  // Handle day click
  const handleDayClick = (dayNumber: number) => {
    const { gy, gm, gd } = jalaliToGregorian(viewYear, viewMonth, dayNumber);
    const clickedDate = new Date(gy, gm - 1, gd);
    const clickedIso = toIsoDate(clickedDate);

    // Check future condition
    if (clickedIso > todayIso) {
      setErrorMessage('امکان انتخاب تاریخ‌های آینده وجود ندارد.');
      return;
    }

    // Check 60 days limit
    if (clickedIso < minDateIso) {
      setErrorMessage('تاریخ انتخابی نمی‌تواند بیش از ۶۰ روز گذشته باشد.');
      return;
    }

    // Selection logic:
    // If we have a range or no start selected, set start and clear end
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedIso);
      setTempEnd('');
      setErrorMessage(null);
      return;
    }

    // If tempStart is set and no tempEnd:
    if (tempStart && !tempEnd) {
      if (clickedIso < tempStart) {
        // Swap or restart with earlier date
        setTempStart(clickedIso);
        setTempEnd('');
        setErrorMessage(null);
        return;
      }

      // Check range length: max 30 days
      const daysCount = getDayDifference(tempStart, clickedIso);
      if (daysCount > 30) {
        setErrorMessage('حداکثر بازه زمانی قابل انتخاب ۳۰ روز است.');
        return;
      }

      setTempEnd(clickedIso);
      setErrorMessage(null);
    }
  };

  // Quick preset options
  const handlePreset = (days: number) => {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    const startIso = toIsoDate(start);
    const endIso = toIsoDate(end);

    setTempStart(startIso);
    setTempEnd(endIso);
    const jEnd = toJalali(endIso);
    setViewYear(jEnd.jy);
    setViewMonth(jEnd.jm);
    setErrorMessage(null);
  };

  const handleApply = () => {
    if (!tempStart || !tempEnd) {
      setErrorMessage('لطفاً تاریخ شروع و پایان بازه را در تقویم انتخاب کنید.');
      return;
    }

    if (tempStart > tempEnd) {
      setErrorMessage('تاریخ پایان باید پس از تاریخ شروع باشد.');
      return;
    }

    const daysCount = getDayDifference(tempStart, tempEnd);
    if (daysCount > 30) {
      setErrorMessage('حداکثر بازه زمانی قابل انتخاب ۳۰ روز است.');
      return;
    }

    if (tempStart < minDateIso) {
      setErrorMessage('تاریخ شروع نمی‌تواند بیش از ۶۰ روز گذشته باشد.');
      return;
    }

    if (tempEnd > todayIso) {
      setErrorMessage('امکان انتخاب تاریخ‌های آینده وجود ندارد.');
      return;
    }

    onApply(tempStart, tempEnd);
    onClose();
  };

  const handleDiscard = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setErrorMessage(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 dir-rtl">
      <div
        className={`w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border transition-colors duration-200 overflow-hidden ${
          errorMessage
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                انتخاب بازه زمانی (شمسی)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                حداکثر بازه ۳۰ روز · تا ۶۰ روز گذشته
              </p>
            </div>
          </div>
          <button
            onClick={handleDiscard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Range Preview Header */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            بازه انتخاب‌شده:
          </span>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {tempStart && tempEnd
              ? `${formatJalaliRangeLabel(tempStart, tempEnd)} (${formatPersianNumber(
                  getDayDifference(tempStart, tempEnd)
                )} روز)`
              : tempStart
              ? 'تاریخ پایان را انتخاب کنید'
              : 'تاریخ شروع را انتخاب کنید'}
          </span>
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="ماه بعد"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {PERSIAN_MONTH_NAMES[viewMonth - 1]} {formatPersianNumber(viewYear)}
          </span>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="ماه قبل"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-5 py-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {PERSIAN_WEEKDAY_NAMES.map((wd, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { gy, gm, gd } = jalaliToGregorian(viewYear, viewMonth, day);
              const currentIso = toIsoDate(new Date(gy, gm - 1, gd));

              const isFuture = currentIso > todayIso;
              const isOlderThanLimit = currentIso < minDateIso;
              const isDisabled = isFuture || isOlderThanLimit;

              const isStart = tempStart === currentIso;
              const isEnd = tempEnd === currentIso;
              const isInRange =
                tempStart && tempEnd && currentIso > tempStart && currentIso < tempEnd;
              const isToday = currentIso === todayIso;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative ${
                    isDisabled
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                      : isStart || isEnd
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105 z-10'
                      : isInRange
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-none'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  } ${isToday && !isStart && !isEnd ? 'border border-brand-500/50' : ''}`}
                >
                  {formatPersianNumber(day)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Presets (Last 7 / 14 / 30 days) */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-400 shrink-0">
              انتخاب سریع:
            </span>
            <div className="flex items-center gap-1.5 w-full justify-end">
              {[
                { days: 7, label: '۷ روز اخیر' },
                { days: 14, label: '۱۴ روز اخیر' },
                { days: 30, label: '۳۰ روز اخیر' },
              ].map((p) => {
                const isSelectedPreset =
                  tempEnd === todayIso &&
                  tempStart ===
                    toIsoDate(
                      new Date(today.getTime() - (p.days - 1) * 24 * 60 * 60 * 1000)
                    );
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => handlePreset(p.days)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                      isSelectedPreset
                        ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions: Accept / Discard */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!tempStart || !tempEnd || Boolean(errorMessage)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تأیید و اعمال بازه</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
