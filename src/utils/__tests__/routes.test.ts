// @test-type unit
import { describe, it, expect } from 'vitest';
import { getPageTitle, getActivePageKey } from '../routes';

describe('[unit] routes utilities', () => {
  it('returns correct titles for registered routes', () => {
    expect(getPageTitle('/dashboard')).toBe('داشبورد اصلی');
    expect(getPageTitle('/dashboard/analytics')).toBe('تحلیل و آمار فروش');
    expect(getPageTitle('/dashboard/customers')).toBe('مدیریت مشتریان (CRM)');
    expect(getPageTitle('/dashboard/invoices')).toBe('فاکتورهای فروش');
    expect(getPageTitle('/dashboard/ingestion')).toBe('ورود داده‌ها');
    expect(getPageTitle('/dashboard/settings')).toBe('تنظیمات');
    expect(getPageTitle('/dashboard/subscription')).toBe('اشتراک و پرداخت');
    expect(getPageTitle('/admin')).toBe('پنل مدیریت');
  });

  it('handles trailing slashes gracefully', () => {
    expect(getPageTitle('/dashboard/')).toBe('داشبورد اصلی');
    expect(getPageTitle('/dashboard/analytics/')).toBe('تحلیل و آمار فروش');
  });

  it('returns "صفحه یافت نشد" for unregistered /dashboard subpaths', () => {
    expect(getPageTitle('/dashboard/non')).toBe('صفحه یافت نشد');
    expect(getPageTitle('/dashboard/invalid/subpath')).toBe('صفحه یافت نشد');
  });

  it('falls back to "داشبورد" for other unregistered paths', () => {
    expect(getPageTitle('/unknown')).toBe('داشبورد');
  });

  it('returns correct activePageKey for registered routes and empty string for unknown routes', () => {
    expect(getActivePageKey('/dashboard/analytics')).toBe('analytics');
    expect(getActivePageKey('/dashboard/invoices')).toBe('invoices');
    expect(getActivePageKey('/dashboard/non')).toBe('');
  });
});
