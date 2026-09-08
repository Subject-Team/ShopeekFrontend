import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, toAsciiDigits, PHONE_REGEX } from '../phone';

describe('phone utilities', () => {
  describe('toAsciiDigits', () => {
    it('converts Persian digits to ASCII', () => {
      expect(toAsciiDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
    });

    it('converts Arabic digits to ASCII', () => {
      expect(toAsciiDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    it('leaves ASCII characters untouched', () => {
      expect(toAsciiDigits('0912abc+')).toBe('0912abc+');
    });
  });

  describe('normalizePhoneNumber', () => {
    it('handles empty input', () => {
      expect(normalizePhoneNumber('')).toBe('');
    });

    it('keeps canonical 09XXXXXXXXX numbers unchanged', () => {
      expect(normalizePhoneNumber('09123456789')).toBe('09123456789');
    });

    it('normalizes +98 prefix to 09', () => {
      expect(normalizePhoneNumber('+989123456789')).toBe('09123456789');
      expect(normalizePhoneNumber('+98 912 345 6789')).toBe('09123456789');
      expect(normalizePhoneNumber('+98-912-345-6789')).toBe('09123456789');
    });

    it('normalizes 0098 prefix to 09', () => {
      expect(normalizePhoneNumber('00989123456789')).toBe('09123456789');
      expect(normalizePhoneNumber('0098 912 345 6789')).toBe('09123456789');
    });

    it('normalizes 98 prefix (12 digits) to 09', () => {
      expect(normalizePhoneNumber('989123456789')).toBe('09123456789');
    });

    it('normalizes 10-digit number starting with 9 to 09', () => {
      expect(normalizePhoneNumber('9123456789')).toBe('09123456789');
    });

    it('normalizes redundant +9809 prefix to 09', () => {
      expect(normalizePhoneNumber('+9809123456789')).toBe('09123456789');
      expect(normalizePhoneNumber('009809123456789')).toBe('09123456789');
    });

    it('normalizes Persian digits to canonical ASCII 09XXXXXXXXX', () => {
      expect(normalizePhoneNumber('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
      expect(normalizePhoneNumber('+۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
      expect(normalizePhoneNumber('۰۰۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    });

    it('handles interactive typing states smoothly', () => {
      // User types +
      expect(normalizePhoneNumber('+')).toBe('+');
      // User types +9
      expect(normalizePhoneNumber('+9')).toBe('+9');
      // User types +98 -> transforms to 0
      expect(normalizePhoneNumber('+98')).toBe('0');
      // User types 0098 -> transforms to 0
      expect(normalizePhoneNumber('0098')).toBe('0');
      // User types single 9 -> auto prefix to 09
      expect(normalizePhoneNumber('9')).toBe('09');
    });

    it('caps output at 11 digits', () => {
      expect(normalizePhoneNumber('09123456789999')).toBe('09123456789');
      expect(normalizePhoneNumber('+989123456789999')).toBe('09123456789');
    });

    it('validates normalized numbers against PHONE_REGEX', () => {
      const normalized = normalizePhoneNumber('+98 912 345 6789');
      expect(PHONE_REGEX.test(normalized)).toBe(true);

      const persianNormalized = normalizePhoneNumber('+۹۸۹۱۲۳۴۵۶۷۸۹');
      expect(PHONE_REGEX.test(persianNormalized)).toBe(true);
    });
  });
});
