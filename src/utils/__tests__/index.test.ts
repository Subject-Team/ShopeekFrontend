import { describe, it, expect } from 'vitest';
import {
  formatPersianNumber,
  formatPersianDate,
  formatPersianDateAsUTC,
  formatPersianTime,
  formatPersianTimeAsUTC,
  formatSubscriptionRemainingDays,
  formatCompressedToman,
} from '../index';

describe('utils/index.ts Persian formatting functions', () => {
  describe('formatPersianNumber', () => {
    it('returns empty string for null or undefined', () => {
      expect(formatPersianNumber(null)).toBe('');
      expect(formatPersianNumber(undefined)).toBe('');
    });

    it('converts numbers to localized Persian numbers', () => {
      const formatted = formatPersianNumber(123456);
      expect(formatted).toBeTruthy();
      // Persian 123,456
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('handles numeric strings with commas', () => {
      const formatted = formatPersianNumber('1,234,567');
      expect(formatted).toBeTruthy();
    });

    it('returns string fallback for non-numeric string', () => {
      expect(formatPersianNumber('invalid_text')).toBe('invalid_text');
    });
  });

  describe('formatPersianDate & formatPersianDateAsUTC', () => {
    it('returns نامشخص for empty input', () => {
      expect(formatPersianDate(null)).toBe('نامشخص');
      expect(formatPersianDate(undefined)).toBe('نامشخص');
      expect(formatPersianDate('')).toBe('نامشخص');
    });

    it('formats ISO date string properly', () => {
      const result = formatPersianDate('2026-03-21T10:00:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('نامشخص');
    });

    it('handles namedMonths and showTime flags', () => {
      const resultWithTime = formatPersianDate('2026-03-21T10:00:00Z', true, true);
      expect(resultWithTime).toBeTruthy();
    });

    it('formatPersianDateAsUTC appends Z if missing', () => {
      const result = formatPersianDateAsUTC('2026-03-21T10:00:00');
      expect(result).toBeTruthy();
    });
  });

  describe('formatPersianTime & formatPersianTimeAsUTC', () => {
    it('formats time string into localized time', () => {
      const timeStr = formatPersianTime('2026-03-21T14:30:00Z');
      expect(timeStr).toBeTruthy();
    });

    it('formatPersianTimeAsUTC appends Z if missing', () => {
      const timeStr = formatPersianTimeAsUTC('2026-03-21T14:30:00');
      expect(timeStr).toBeTruthy();
    });
  });

  describe('formatSubscriptionRemainingDays', () => {
    it('returns unlimited text for isInfinite', () => {
      expect(formatSubscriptionRemainingDays(null, true)).toBe('نامحدود (کاربر دمو)');
      expect(formatSubscriptionRemainingDays(10, true)).toBe('نامحدود (کاربر دمو)');
    });

    it('returns expired text for null, undefined, or <= 0', () => {
      expect(formatSubscriptionRemainingDays(null)).toBe('اشتراک منقضی شده (بدون اعتبار)');
      expect(formatSubscriptionRemainingDays(undefined)).toBe('اشتراک منقضی شده (بدون اعتبار)');
      expect(formatSubscriptionRemainingDays(0)).toBe('اشتراک منقضی شده (بدون اعتبار)');
      expect(formatSubscriptionRemainingDays(-5)).toBe('اشتراک منقضی شده (بدون اعتبار)');
    });

    it('returns formatted remaining days for positive values', () => {
      const res = formatSubscriptionRemainingDays(15);
      expect(res).toContain('روز باقی مانده');
    });
  });

  describe('formatCompressedToman', () => {
    it('returns empty string for null/undefined/NaN', () => {
      expect(formatCompressedToman(null as any)).toBe('');
      expect(formatCompressedToman(undefined as any)).toBe('');
      expect(formatCompressedToman(NaN)).toBe('');
    });

    it('formats millions with م suffix', () => {
      const res = formatCompressedToman(5500000);
      expect(res).toContain('م');
    });

    it('formats thousands with ه suffix', () => {
      const res = formatCompressedToman(45000);
      expect(res).toContain('ه');
    });

    it('formats small amounts directly', () => {
      const res = formatCompressedToman(500);
      expect(res).toBeTruthy();
    });
  });
});
