import React from 'react';
import { getPersianDayOfWeek } from "../../utils/persian/date";
import { toIsoDate } from "../../utils/persian/date";
import { jalaliToGregorian } from "../../utils/persian/date";
import { getJalaliMonthDays } from "../../utils/persian/date";
import { PERSIAN_WEEKDAY_NAMES } from "../../utils/persian/date";

interface JalaliCalendarProps {
  viewYear: number;
  viewMonth: number;
  weekdayClassName?: string;
  gridClassName?: string;
  renderDay: (day: number, iso: string, isCurrentMonth: boolean) => React.ReactNode;
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

  // Previous month padding
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevMonthDays = getJalaliMonthDays(prevYear, prevMonth);

  // Next month padding (fixed 6 rows = 42 cells total)
  const totalCells = 42;
  const nextMonthCellsCount = totalCells - (startDow + daysInMonth);

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
        {/* Leading days from previous month */}
        {Array.from({ length: startDow }).map((_, i) => {
          const day = prevMonthDays - startDow + 1 + i;
          const iso = toIsoDate(new Date(gy, gm - 1, gd - (startDow - i)));
          return renderDay(day, iso, false);
        })}
        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toIsoDate(new Date(gy, gm - 1, gd + day - 1));
          return renderDay(day, iso, true);
        })}
        {/* Trailing days from next month */}
        {Array.from({ length: nextMonthCellsCount }).map((_, i) => {
          const day = i + 1;
          const iso = toIsoDate(new Date(gy, gm - 1, gd + daysInMonth + i));
          return renderDay(day, iso, false);
        })}
      </div>
    </>
  );
};

