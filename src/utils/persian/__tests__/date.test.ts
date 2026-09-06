import { describe, it, expect } from 'vitest';
import {
  formatJalaliRangeLabel,
  isQuickPresetRange,
  getDayDifference,
  jalaliToDate,
  toIsoDate,
  formatJalaliNumeric,
  toJalali,
  jalaliToGregorian,
  gregorianToJalali,
  getJalaliMonthDays,
  isJalaliLeapYear,
  toPersianDate,
  utcStringToPersianDate,
  toPersianTime,
  utcStringToPersianTime,
} from '../date';

describe('utils/persian/date jalali calendar math', () => {
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

  it('flags Jalali leap years via the 33-year cycle', () => {
    expect(isJalaliLeapYear(1403)).toBe(true);
    expect(isJalaliLeapYear(1405)).toBe(false);
  });

  it('round-trips Date objects through toJalali/jalaliToDate/toIsoDate', () => {
    const date = new Date(2026, 7, 31); // 2026-08-31
    expect(toJalali(date)).toEqual({ jy: 1405, jm: 6, jd: 9 });
    expect(toJalali('2026-08-31')).toEqual({ jy: 1405, jm: 6, jd: 9 });
    expect(toIsoDate(jalaliToDate({ jy: 1405, jm: 6, jd: 9 }))).toBe('2026-08-31');
  });

  it('formats Jalali numeric dates zero-padded', () => {
    expect(formatJalaliNumeric('2026-08-31')).toBe('1405/06/09');
    expect(formatJalaliNumeric(new Date(2026, 2, 21))).toBe('1405/01/01');
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

  it('formats single-day ranges as a bare Jalali date', () => {
    // 2026-09-03 is 1405-06-12 (12 Shahrivar)
    expect(formatJalaliRangeLabel('2026-09-03', '2026-09-03')).toBe('۱۲ شهریور');
  });

  it('formats quick preset ranges (7/14/30 days ending today) with their verbatim label', () => {
    const today = toIsoDate(new Date());

    const start7 = toIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
    expect(formatJalaliRangeLabel(start7, today)).toBe('۷ روز اخیر');

    const start14 = toIsoDate(new Date(Date.now() - 13 * 24 * 60 * 60 * 1000));
    expect(formatJalaliRangeLabel(start14, today)).toBe('۱۴ روز اخیر');

    const start30 = toIsoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
    expect(formatJalaliRangeLabel(start30, today)).toBe('۳۰ روز اخیر');
  });

  it('does not apply preset label when the same span does not end today', () => {
    expect(formatJalaliRangeLabel('2026-08-25', '2026-08-31')).toBe('۳ تا ۹ شهریور');
    expect(isQuickPresetRange('2026-08-25', '2026-08-31')).toBe(false);
  });
});

describe('utils/persian/date date helpers', () => {
  describe('toPersianDate & utcStringToPersianDate', () => {
    it('returns نامشخص for empty input', () => {
      expect(toPersianDate(null)).toBe('نامشخص');
      expect(toPersianDate(undefined)).toBe('نامشخص');
      expect(toPersianDate('')).toBe('نامشخص');
    });

    it('formats ISO date string properly', () => {
      const result = toPersianDate('2026-03-21T10:00:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('نامشخص');
    });

    it('handles namedMonths and showTime flags', () => {
      const resultWithTime = toPersianDate('2026-03-21T10:00:00Z', true, true);
      expect(resultWithTime).toBeTruthy();
    });

    it('utcStringToPersianDate appends Z if missing', () => {
      const result = utcStringToPersianDate('2026-03-21T10:00:00');
      expect(result).toBeTruthy();
    });
  });

  describe('toPersianTime & utcStringToPersianTime', () => {
    it('formats time string into localized time', () => {
      const timeStr = toPersianTime('2026-03-21T14:30:00Z');
      expect(timeStr).toBeTruthy();
    });

    it('utcStringToPersianTime appends Z if missing', () => {
      const timeStr = utcStringToPersianTime('2026-03-21T14:30:00');
      expect(timeStr).toBeTruthy();
    });
  });
});
