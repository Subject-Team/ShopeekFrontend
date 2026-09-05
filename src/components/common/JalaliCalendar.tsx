import React from 'react';
import {
  getJalaliMonthDays,
  jalaliToGregorian,
  toIsoDate,
  getPersianDayOfWeek,
  PERSIAN_WEEKDAY_NAMES,
} from '../../utils/jalali';

interface JalaliCalendarProps {
  viewYear: number;
  viewMonth: number;
  weekdayClassName?: string;
  gridClassName?: string;
  renderDay: (day: number, iso: string) => React.ReactNode;
}

/**
 * Shared Jalali month grid: weekday headers + day cells.
 * Consumers own the month-navigation header and pass a `renderDay` callback
 * that renders each day button with their own selection/disabled logic.
 */
export const JalaliCalendar: React.FC<JalaliCalendarProps> = ({
  viewYear,
  viewMonth,
  weekdayClassName = 'text-[11px] font-medium text-slate-400 py-1',
  gridClassName = 'grid grid-cols-7 gap-1',
  renderDay,
}) => {
  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const { gy, gm, gd } = jalaliToGregorian(viewYear, viewMonth, 1);
  const startDow = getPersianDayOfWeek(new Date(gy, gm - 1, gd));

  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {PERSIAN_WEEKDAY_NAMES.map((d, i) => (
          <div key={i} className={weekdayClassName}>
            {d}
          </div>
        ))}
      </div>
      <div className={gridClassName}>
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`pad-${i}`} className="h-8 w-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toIsoDate(new Date(gy, gm - 1, gd + day - 1));
          return renderDay(day, iso);
        })}
      </div>
    </>
  );
};
