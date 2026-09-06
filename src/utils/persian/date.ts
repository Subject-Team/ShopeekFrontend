/**
 * Jalali (Solar Hijri) calendar conversion and helper utilities.
 * Pure mathematical algorithms with zero external dependencies.
 */

import { toPersianDigits } from ".";

/** Jalali calendar date parts: year, month 1-12, day 1-31. */
export interface JalaliDate {
  jy: number; // Jalali year (e.g. 1405)
  jm: number; // Jalali month (1 to 12)
  jd: number; // Jalali day of month (1 to 31)
};

/** Persian month names, indexed by Jalali month minus 1 (فروردین = index 0). */
export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** Single-letter Persian weekday abbreviations, Saturday-first (ش = شنبه). */
export const PERSIAN_WEEKDAY_NAMES = [
  'ش', // شنبه (Saturday = 0)
  'ی', // یکشنبه (Sunday = 1)
  'د', // دوشنبه (Monday = 2)
  'س', // سه‌شنبه (Tuesday = 3)
  'چ', // چهارشنبه (Wednesday = 4)
  'پ', // پنج‌شنبه (Thursday = 5)
  'ج', // جمعه (Friday = 6)
];

/**
 * Checks if a given Jalali year is a leap year (کبیسه).
 */
export function isJalaliLeapYear(jy: number): boolean {
  const mod = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(mod);
};

/**
 * Returns the number of days in a given Jalali month.
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
};

/**
 * Converts Gregorian date (year, month 1-12, day 1-31) to Jalali.
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
};

/**
 * Converts Jalali date (year, month 1-12, day 1-31) to Gregorian date { gy, gm, gd }.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number; } {
  const jy_adj = jy + 1595;
  let days = -355668 +
    365 * jy_adj +
    Math.floor(jy_adj / 33) * 8 +
    Math.floor(((jy_adj % 33) + 3) / 4) +
    jd;

  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += (jm - 7) * 30 + 186;
  }

  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const gd_calc = days + 1;
  const isGregorianLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const sal_a = [0, 31, isGregorianLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let gm = 0;
  let running_day = gd_calc;
  for (gm = 1; gm <= 12; gm++) {
    const v = sal_a[gm];
    if (running_day <= v) break;
    running_day -= v;
  }

  return { gy, gm, gd: running_day };
};

/**
 * Helper to convert Date object or 'YYYY-MM-DD' ISO string into JalaliDate.
 */
export function toJalali(date: Date | string): JalaliDate {
  let d: Date;
  if (typeof date === 'string') {
    const [y, m, day] = date.split('T')[0].split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = date;
  }
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

/**
 * Formats a Date or 'YYYY-MM-DD' string to a Jalali date string (e.g. '1405/06/09').
 */
export function formatJalaliNumeric(date: Date | string): string {
  const j = toJalali(date);
  const mm = String(j.jm).padStart(2, '0');
  const dd = String(j.jd).padStart(2, '0');
  return `${j.jy}/${mm}/${dd}`;
};

/**
 * Returns Gregorian date as 'YYYY-MM-DD' string.
 */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Converts JalaliDate to Gregorian Date object.
 */
export function jalaliToDate(j: JalaliDate): Date {
  const { gy, gm, gd } = jalaliToGregorian(j.jy, j.jm, j.jd);
  return new Date(gy, gm - 1, gd);
};

/**
 * Returns weekday index in Persian week:
 * Saturday = 0, Sunday = 1, ..., Friday = 6.
 */
export function getPersianDayOfWeek(date: Date): number {
  const jsDay = date.getDay(); // 0 is Sunday, 6 is Saturday
  return (jsDay + 1) % 7;
};

/**
 * Calculates absolute day difference between two 'YYYY-MM-DD' strings (inclusive: dayCount = diff + 1).
 */
export function getDayDifference(startIso: string, endIso: string): number {
  const s = new Date(startIso + 'T00:00:00');
  const e = new Date(endIso + 'T00:00:00');
  const diffTime = e.getTime() - s.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/** Quick presets shown verbatim when the range ends today and spans exactly that many days. */
const RANGE_PRESET_LABELS: ReadonlyArray<{ days: number; label: string }> = [
  { days: 7, label: '۷ روز اخیر' },
  { days: 14, label: '۱۴ روز اخیر' },
  { days: 30, label: '۳۰ روز اخیر' },
];

/**
 * True when the range ends today and matches a quick preset span (7/14/30 days).
 */
export function isQuickPresetRange(startIso: string, endIso: string): boolean {
  if (endIso !== toIsoDate(new Date())) return false;
  const daysCount = getDayDifference(startIso, endIso);
  return RANGE_PRESET_LABELS.some((p) => p.days === daysCount);
};

/**
 * Formats date range according to user preference:
 * - Single day: "۱۲ شهریور"
 * - Quick preset ending today (7/14/30 days): shown as-is, e.g. "۷ روز اخیر"
 * - If same month: "۲ تا ۹ شهریور"
 * - If intermonth: "۲۰ مرداد تا ۱۰ شهریور"
 */
export function formatJalaliRangeLabel(startIso: string, endIso: string): string {
  if (startIso === endIso) {
    const j = toJalali(startIso);
    return `${toPersianDigits(j.jd)} ${PERSIAN_MONTH_NAMES[j.jm - 1]}`;
  }

  if (isQuickPresetRange(startIso, endIso)) {
    const daysCount = getDayDifference(startIso, endIso);
    const preset = RANGE_PRESET_LABELS.find((p) => p.days === daysCount);
    if (preset) return preset.label;
  }

  const jStart = toJalali(startIso);
  const jEnd = toJalali(endIso);

  const startMonth = PERSIAN_MONTH_NAMES[jStart.jm - 1];
  const endMonth = PERSIAN_MONTH_NAMES[jEnd.jm - 1];

  const startDay = toPersianDigits(jStart.jd);
  const endDay = toPersianDigits(jEnd.jd);

  if (jStart.jm === jEnd.jm && jStart.jy === jEnd.jy) {
    return `${startDay} تا ${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} تا ${endDay} ${endMonth}`;
};

/**
 * Formats a date input (ISO string or `Date`) as a Persian (Jalali) calendar
 * date via `Intl` with Persian digits.
 *
 * - `namedMonths` uses month names (مرداد) instead of numeric (۸).
 * - `showTime` appends the clock time (`hour12: false`).
 *
 * Returns `'نامشخص'` for empty input and the raw string when unparseable.
 * Note: for backend timestamps stored without a `Z` suffix, prefer
 * `utcStringToPersianDate` so they are interpreted as UTC.
 */
export const toPersianDate = (
  dateInput: string | Date | null | undefined,
  namedMonths: boolean = false,
  showTime: boolean = false
): string => {
  if (!dateInput) return 'نامشخص';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: namedMonths ? 'long' : 'numeric',
      day: 'numeric',
    };

    if (showTime) {
      options.hour = 'numeric';
      options.minute = 'numeric';
      options.second = 'numeric';
      options.hour12 = false;
    }

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats a UTC-naive or ISO datetime string as a Persian (Jalali) calendar
 * date via `Intl` — e.g. `'2026-03-21T10:00:00'` → `'۱ فروردین ۱۴۰۵'` when
 * `namedMonths` is true, otherwise numeric Persian digits with `/` separators.
 *
 * Appends `Z` when missing so legacy timestamp strings (stored without a
 * timezone suffix) are interpreted as UTC, matching backend persistence.
 * Returns `'نامشخص'` for empty input and the raw string when unparseable.
 */
export const utcStringToPersianDate = (
  dateStr: string,
  namedMonths: boolean = false,
  showTime: boolean = false
): string => {
  return toPersianDate(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z', namedMonths, showTime);
};

/**
 * Formats a time-of-day string (datetime or `HH:mm[:ss]`) as a localized
 * Persian-digit clock time via `toLocaleTimeString('fa-IR')`.
 */
export const toPersianTime = (timeStr: string): string => {
  return new Date(timeStr).toLocaleTimeString('fa-IR');
};

/**
 * Like `toPersianTime`, but appends `Z` when missing so legacy timestamp
 * strings without a timezone suffix are interpreted as UTC.
 */
export const utcStringToPersianTime = (timeStr: string): string => {
  return toPersianTime(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
};
