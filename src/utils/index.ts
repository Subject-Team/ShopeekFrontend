/**
 * Utility functions for Persian formatting.
 */

/**
 * Converts Persian and Arabic digits in a string to standard English ASCII digits.
 */
export const normalizeDigits = (text: string): string => {
  if (!text) return '';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let res = text;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianDigits[i], 'g'), String(i));
    res = res.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return res;
};

/**
 * Converts English digits in a string or number to Persian digits with separators.
 */
export const formatPersianNumber = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return '';

  const num = typeof input === "string" ? parseFloat(input.replace(/,/g, "")) : input;

  if (isNaN(num)) return String(input);

  return num.toLocaleString("fa-IR");
};

export const toPersianDigits = (text: string): string => {
  if (!text) return '';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const englishDigits = '0123456789';
  let res = text;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
    res = res.replace(new RegExp(arabicDigits[i], 'g'), persianDigits[i]);
  }
  return res;
}

export const toPersianPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 11) return phone;

  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 11);

  return `${part1} ${part2} ${part3}`;
}

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
  return formatPersianDate(dateStr.endsWith('Z')? dateStr : dateStr + 'Z', namedMonths, showTime)
}

export const formatPersianTime = (timeStr: string): string => {
  return new Date(timeStr).toLocaleTimeString('fa-IR')
}

export const formatPersianTimeAsUTC = (timeStr: string): string => {
  return formatPersianTime(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z')
}

/**
 * Returns a human-readable Persian remaining subscription text.
 */
export const formatSubscriptionRemainingDays = (
  remainingDays: number | null | undefined,
  isInfinite?: boolean
): string => {
  if (isInfinite) {
    return 'نامحدود (کاربر دمو)';
  }
  if (remainingDays === null || remainingDays === undefined || remainingDays <= 0) {
    return 'اشتراک منقضی شده (بدون اعتبار)';
  }
  return `${formatPersianNumber(remainingDays)} روز باقی مانده`;
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
