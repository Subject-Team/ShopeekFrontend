import { describe, it, expect } from 'vitest';
import {
  gregorianToJalali,
  jalaliToGregorian,
  getJalaliMonthDays,
  isJalaliLeapYear,
  formatJalaliNumeric,
  formatJalaliRangeLabel,
  getDayDifference,
  toIsoDate,
  jalaliToDate,
  toJalali
} from '../jalali';

describe('jalali calendar utilities', () => {
  it('converts Gregorian to Jalali correctly', () => {
    // 2026-08-31 is 1405-06-09 (9 Shahrivar 1405)
    const j = gregorianToJalali(2026, 8, 31);
    expect(j).toEqual({ jy: 1405, jm: 6, jd: 9 });

    // 2026-03-21 is 1405-01-01 (Nowruz)
    const nowruz = gregorianToJalali(2026, 3, 21);
    expect(nowruz).toEqual({ jy: 1405, jm: 1, jd: 1 });
  });

  it('converts Jalali back to Gregorian correctly', () => {
    const g = jalaliToGregorian(1405, 6, 9);
    expect(g).toEqual({ gy: 2026, gm: 8, gd: 31 });

    const gNowruz = jalaliToGregorian(1405, 1, 1);
    expect(gNowruz).toEqual({ gy: 2026, gm: 3, gd: 21 });
  });

  it('calculates days in month correctly', () => {
    expect(getJalaliMonthDays(1405, 1)).toBe(31);
    expect(getJalaliMonthDays(1405, 6)).toBe(31);
    expect(getJalaliMonthDays(1405, 7)).toBe(30);
    expect(getJalaliMonthDays(1405, 11)).toBe(30);
    expect(getJalaliMonthDays(1405, 12)).toBe(29); // 1405 is not leap
  });

  it('calculates day difference', () => {
    expect(getDayDifference('2026-08-25', '2026-08-31')).toBe(7);
    expect(getDayDifference('2026-08-31', '2026-08-31')).toBe(1);
  });

  it('formats range label for same month and intermonth correctly', () => {
    // Same month: 2 ta 9 Shahrivar
    // 2026-08-24 is 1405-06-02
    // 2026-08-31 is 1405-06-09
    const sameMonth = formatJalaliRangeLabel('2026-08-24', '2026-08-31');
    expect(sameMonth).toBe('۲ تا ۹ شهریور');

    // Intermonth: 20 Mordad ta 10 Shahrivar
    // 1405-05-20 is 2026-08-11
    // 1405-06-10 is 2026-09-01
    const interMonth = formatJalaliRangeLabel('2026-08-11', '2026-09-01');
    expect(interMonth).toBe('۲۰ مرداد تا ۱۰ شهریور');
  });
});
