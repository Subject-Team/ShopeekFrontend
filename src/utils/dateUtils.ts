/**
 * Utility functions for Persian digits and Solar (Jalali) date formatting.
 */

/**
 * Converts English digits (0-9) in a string or number to Persian digits (۰-۹).
 */
export const toPersianDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

/**
 * Formats a Date object or ISO date string into Solar Jalali (هجری شمسی) format.
 * Example output: "۲۲ مرداد ۱۴۰۵"
 */
export const formatJalaliDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'نامشخص';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'تاریخ نامعتبر';
    
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return 'تاریخ نامعتبر';
  }
};

/**
 * Returns a human-readable Persian remaining subscription text.
 */
export const formatDaysRemainingText = (
  remainingDays: number | null | undefined,
  isInfinite?: boolean
): string => {
  if (isInfinite) {
    return 'نامحدود (کاربر دمو)';
  }
  if (remainingDays === null || remainingDays === undefined || remainingDays <= 0) {
    return 'اشتراک منقضی شده (بدون اعتبار)';
  }
  return `${toPersianDigits(remainingDays)} روز باقی مانده`;
};
