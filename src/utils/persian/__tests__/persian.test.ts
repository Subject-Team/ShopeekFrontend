import { describe, it, expect } from 'vitest';
import {
  toPersianDigits,
  toGroupedPersianDigits,
  tomaanWithUnit,
  toOneDecimal,
  formatTomaan,
  shortTomaanWithUnit,
} from '..';

describe('utils/persian formatting functions', () => {
  describe('toPersianDigits', () => {
    it('returns empty string for null or undefined', () => {
      expect(toPersianDigits(null)).toBe('');
      expect(toPersianDigits(undefined)).toBe('');
    });

    it('converts numbers to Persian digits without separators', () => {
      expect(toPersianDigits(123456)).toBe('۱۲۳۴۵۶');
    });

    it('converts phone numbers preserving leading zero and no splitting', () => {
      expect(toPersianDigits('09123456789')).toBe('۰۹۱۲۳۴۵۶۷۸۹');
    });

    it('handles numeric strings with commas', () => {
      expect(toPersianDigits('1,234,567')).toBe('۱,۲۳۴,۵۶۷');
    });

    it('returns string fallback for non-numeric string', () => {
      expect(toPersianDigits('invalid_text')).toBe('invalid_text');
    });
  });

  describe('toGroupedPersianDigits', () => {
    it('returns empty string for null or undefined', () => {
      expect(toGroupedPersianDigits(null as any)).toBe('');
      expect(toGroupedPersianDigits(undefined as any)).toBe('');
    });

    it('groups thousands with Persian digits', () => {
      expect(toGroupedPersianDigits(1234567)).toBe('۱٬۲۳۴٬۵۶۷');
    });

    it('normalizes pre-comma-grouped numeric strings', () => {
      expect(toGroupedPersianDigits('1,234,567')).toBe('۱٬۲۳۴٬۵۶۷');
    });

    it('renders decimal fractions with the Persian decimal separator', () => {
      expect(toGroupedPersianDigits('1.5')).toBe('۱٫۵');
    });

    it('returns non-numeric input unchanged', () => {
      expect(toGroupedPersianDigits('invalid_text')).toBe('invalid_text');
    });
  });

  describe('tomaanWithUnit', () => {
    it('returns null below one thousand', () => {
      expect(tomaanWithUnit(500)).toBeNull();
    });

    it('maps thousands, millions and billions', () => {
      expect(tomaanWithUnit(1500)).toEqual({ coefficient: 1.5, unit: 'هزار' });
      expect(tomaanWithUnit(2500000)).toEqual({ coefficient: 2.5, unit: 'میلیون' });
      expect(tomaanWithUnit(3000000000)).toEqual({ coefficient: 3, unit: 'میلیارد' });
    });
  });

  describe('toOneDecimal', () => {
    it('drops the decimal separator for integers', () => {
      expect(toOneDecimal(2)).toBe('۲');
      expect(toOneDecimal(10)).toBe('۱۰');
    });

    it('keeps one decimal for fractions', () => {
      expect(toOneDecimal(1.25)).toBe('۱٫۳');
      expect(toOneDecimal(45.5)).toBe('۴۵٫۵');
    });
  });

  describe('formatTomaan', () => {
    it('returns empty string for null/undefined/NaN', () => {
      expect(formatTomaan(null as any)).toBe('');
      expect(formatTomaan(undefined as any)).toBe('');
      expect(formatTomaan(NaN)).toBe('');
    });

    it('formats sub-thousand amounts grouped without a unit', () => {
      expect(formatTomaan(500)).toBe('۵۰۰ تومان');
      expect(formatTomaan(999)).toBe('۹۹۹ تومان');
    });

    it('appends thousand/million/billion units with one decimal', () => {
      expect(formatTomaan(1500)).toBe('۱٫۵ هزار تومان');
      expect(formatTomaan(1250000)).toBe('۱٫۳ میلیون تومان');
      expect(formatTomaan(1000000)).toBe('۱ میلیون تومان');
      expect(formatTomaan(3000000000)).toBe('۳ میلیارد تومان');
    });
  });

  describe('shortTomaanWithUnit', () => {
    it('returns empty string for null/undefined/NaN', () => {
      expect(shortTomaanWithUnit(null as any)).toBe('');
      expect(shortTomaanWithUnit(undefined as any)).toBe('');
      expect(shortTomaanWithUnit(NaN)).toBe('');
    });

    it('formats millions with م suffix', () => {
      expect(shortTomaanWithUnit(5500000)).toBe('۵٫۵م');
    });

    it('formats thousands with ه suffix', () => {
      expect(shortTomaanWithUnit(45000)).toBe('۴۵ه');
    });

    it('formats small amounts directly', () => {
      expect(shortTomaanWithUnit(500)).toBe('۵۰۰');
    });
  });
});
