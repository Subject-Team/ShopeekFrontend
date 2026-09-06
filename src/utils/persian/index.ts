/**
 * Persian digit & Toman currency formatting helpers.
 *
 * All UI-facing numbers in Shopeek must render as Persian digits; monetary
 * (Toman) values must additionally be thousand-grouped. These helpers are the
 * single source of truth for that behavior — do not format digits inline.
 */

/**
 * Converts ASCII (Latin) digits in a string or number to Persian digits (۰-۹).
 *
 * - Returns `''` for `null`/`undefined`.
 * - Leaves the input unchanged when it is not a numeric value
 *   (commas are ignored when checking, so `'1,234,567'` still converts).
 * - Preserves leading zeros (e.g. phone numbers like `۰۹۱۲...`).
 *
 * Use this for counts, percentages, dates and any non-monetary digits.
 */
export const toPersianDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return '';

  const str = String(input);

  if (str.length === 0 || isNaN(Number(str.replace(/,/g, '')))) return str;

  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
};

/**
 * Maps a Toman amount to its large-unit representation (thousand/million/billion).
 *
 * Returns `{ coefficient, unit }` where `coefficient` is the value expressed in
 * `unit` and `unit` is one of `'هزار' | 'میلیون' | 'میلیارد'`, or `null` when
 * the value is below 1,000 and needs no unit.
 */
export const tomaanWithUnit = (value: number): { coefficient: number; unit: string; } | null => {
  if (value >= 1000000000) return { coefficient: value / 1000000000, unit: 'میلیارد' };
  if (value >= 1000000) return { coefficient: value / 1000000, unit: 'میلیون' };
  if (value >= 1000) return { coefficient: value / 1000, unit: 'هزار' };
  return null;
};

/**
 * Renders a compact Toman amount with Persian digits and a Persian unit suffix.
 *
 * - `≥ 1,000,000` → millions with one decimal and suffix `م` (e.g. `۵٫۵م`).
 * - `≥ 1,000` → thousands rounded to integer with suffix `ه` (e.g. `۴۵ه`).
 * - Below 1,000 → the value itself, grouped.
 *
 * Returns `''` for `null`/`undefined`/`NaN`. Intended for chart axes and
 * other space-constrained spots, not for full amounts.
 */
export const shortTomaanWithUnit = (val: number) => {
  if (val === undefined || val === null || isNaN(val)) return '';

  if (val >= 1000000) {
    return `${toGroupedPersianDigits((val / 1000000).toFixed(1))}م`;
  }
  if (val >= 1000) {
    return `${toGroupedPersianDigits(Math.round(val / 1000).toString())}ه`;
  }
  return toGroupedPersianDigits(val.toString());
};

/**
 * Rounds a coefficient to one decimal place and renders it with Persian digits.
 *
 * Integer results drop the decimal separator (e.g. `2` → `۲`); fractional ones
 * keep a single decimal (e.g. `1.25` → `۱٫۳`). Companion to `tomaanWithUnit`.
 */
export const toOneDecimal = (coefficient: number): string => {
  const rounded = Math.round(coefficient * 10) / 10;
  if (Number.isInteger(rounded)) return toGroupedPersianDigits(rounded.toString());
  return toGroupedPersianDigits(rounded.toFixed(1));
};

/**
 * Formats a Toman amount for full display: thousand-grouped Persian digits,
 * with a large unit when the value reaches thousand/million/billion scale.
 *
 * Examples: `500` → `۵۰۰ تومان`, `1250000` → `۱٫۳ میلیون تومان`.
 * Returns `''` for `null`/`undefined`/`NaN`. This is the canonical formatter
 * for any Toman amount shown in the UI.
 */
export const formatTomaan = (realValue: number): string => {
  if (realValue === undefined || realValue === null || isNaN(realValue)) return '';
  const unit = tomaanWithUnit(realValue);
  if (!unit) return `${toGroupedPersianDigits(realValue.toString())} تومان`;
  return `${toOneDecimal(unit.coefficient)} ${unit.unit} تومان`;
};

/**
 * Converts a number (or numeric string, commas tolerated) into a
 * thousand-grouped string of Persian digits via `Intl.NumberFormat('fa-IR')`.
 *
 * Examples: `1234567` → `۱٬۲۳۴٬۵۶۷`, `'1,234,567'` → `۱٬۲۳۴٬۵۶۷`.
 * Non-numeric input is returned unchanged; `null`/`undefined` return `''`.
 * Use this for monetary and other large numeric values that need grouping.
 */
export const toGroupedPersianDigits = (input: number | string): string => {
  if (input === null || input === undefined) return '';

  const str = String(input);

  if (str.length === 0 || isNaN(Number(str.replace(/,/g, '')))) return str;

  return new Intl.NumberFormat('fa-IR').format(Number(str.replace(/,/g, '')));
};
