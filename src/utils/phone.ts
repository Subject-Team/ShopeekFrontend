/**
 * Iranian phone number utilities:
 * Converts Persian/Arabic digits, strips formatting characters,
 * and normalizes prefixes (+98, 0098, 98, etc.) to standard 09XXXXXXXXX format.
 */

export const PHONE_REGEX = /^09\d{9}$/;

const PERSIAN_ARABIC_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/**
 * Converts Persian/Arabic digits to ASCII digits.
 */
export const toAsciiDigits = (str: string): string => {
  return str.replace(/[۰-۹٠-٩]/g, (ch) => PERSIAN_ARABIC_DIGITS[ch] ?? ch);
};

/**
 * Normalizes an Iranian phone number string:
 * - Translates Persian/Arabic numerals to ASCII.
 * - Handles leading prefixes:
 *   - +989... or +9809... -> 09...
 *   - 00989... or 009809... -> 09...
 *   - 989... or 9809... -> 09...
 *   - 9... (10 digits starting with 9) -> 09...
 *   - Partial typing: allows "+", "+9", "+98" (normalizes +98 -> 0)
 * - Restricts to digits and at most 11 characters (09XXXXXXXXX) once normalized.
 */
export const normalizePhoneNumber = (raw: string): string => {
  if (!raw) return '';

  const translated = toAsciiDigits(raw).trim();
  const hasPlus = translated.startsWith('+');

  // If user is just typing '+', or '+9', allow them to continue typing
  if (translated === '+' || translated === '+9') {
    return translated;
  }

  // If user typed '+98', immediately normalize it to '0'
  if (translated === '+98') {
    return '0';
  }

  // If user typed '0098', immediately normalize it to '0'
  if (translated === '0098') {
    return '0';
  }

  // Extract all digits
  let digits = translated.replace(/\D/g, '');

  if (hasPlus && digits.startsWith('9809')) {
    digits = digits.slice(2);
  } else if (hasPlus && digits.startsWith('98')) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('009809')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('0098')) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('9809') && digits.length >= 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('989') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('9') && digits.length >= 10) {
    digits = '0' + digits;
  } else if (digits === '9') {
    // Typing single 9 -> auto prefix with 0
    digits = '09';
  }

  // Cap at 11 digits (09XXXXXXXXX)
  return digits.slice(0, 11);
};
