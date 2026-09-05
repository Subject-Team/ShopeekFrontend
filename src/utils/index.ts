/**
 * Utility functions for Persian formatting.
 */

/**
 * Converts English digits in a string or number to Persian digits
 * WITHOUT adding group separators or stripping leading zeros.
 * e.g. "09123456789" → "۰۹۱۲۳۴۵۶۷۸۹",  12345 → "۱۲۳۴۵"
 */
export const formatPersianNumber = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return '';

  const str = String(input);

  if (str.length === 0 || isNaN(Number(str.replace(/,/g, '')))) return str;

  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
};

/**
 * Formats a Date object or ISO date string into Persian Solar Jalali format.
 */
export const formatPersianDate = (
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

export const formatPersianDateAsUTC = (
  dateStr: string,
  namedMonths: boolean = false,
  showTime: boolean = false
): string => {
  return formatPersianDate(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z', namedMonths, showTime);
};

export const formatPersianTime = (timeStr: string): string => {
  return new Date(timeStr).toLocaleTimeString('fa-IR');
};

export const formatPersianTimeAsUTC = (timeStr: string): string => {
  return formatPersianTime(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
};

export const formatCompressedToman = (val: number) => {
  if (val === undefined || val === null || isNaN(val)) return '';

  if (val >= 1000000) {
    return `${formatPersianNumber((val / 1000000).toFixed(1))}م`;
  }
  if (val >= 1000) {
    return `${formatPersianNumber(Math.round(val / 1000).toString())}ه`;
  }
  return formatPersianNumber(val.toString());
};

const tomanUnit = (value: number): { coefficient: number; unit: string } | null => {
  if (value >= 1_000_000_000) return { coefficient: value / 1_000_000_000, unit: 'میلیارد' };
  if (value >= 1_000_000) return { coefficient: value / 1_000_000, unit: 'میلیون' };
  if (value >= 1_000) return { coefficient: value / 1_000, unit: 'هزار' };
  return null;
};

const formatCoefficient = (coefficient: number): string => {
  const rounded = Math.round(coefficient * 10) / 10;
  if (Number.isInteger(rounded)) return formatPersianNumber(rounded.toString());
  return formatPersianNumber(rounded.toFixed(1));
};

/**
 * Renders a real IRR amount as Persian commercial shorthand, e.g.
 * 2_000_000 -> «۲ میلیون تومان», 2_500_000 -> «۲٫۵ میلیون تومان».
 */
export const formatTomanWords = (realValue: number): string => {
  if (realValue === undefined || realValue === null || isNaN(realValue)) return '';
  const unit = tomanUnit(realValue);
  if (!unit) return `${formatPersianNumber(realValue.toString())} تومان`;
  return `${formatCoefficient(unit.coefficient)} ${unit.unit} تومان`;
};

/**
 * Renders a real IRR amount grouped with separators in Persian digits,
 * e.g. 2_000_000 -> '۲٬۰۰۰٬۰۰۰'.
 */
export const formatGroupedRealValue = (realValue: number): string => {
  if (realValue === undefined || realValue === null || isNaN(realValue)) return '';
  return new Intl.NumberFormat('fa-IR').format(realValue);
};
