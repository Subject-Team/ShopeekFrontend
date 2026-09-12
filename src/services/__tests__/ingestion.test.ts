import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadSalesFile, previewSalesFile, getSampleCSV } from '../api';

describe('ingestion API', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  const okJson = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
  const errJson = (status: number, body: unknown) => ({
    ok: false,
    status,
    json: async () => body,
  });
  const errNonJson = (status: number) => ({
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  });

  const mockFile = new File(['header\n1,2'], 'sales.csv', { type: 'text/csv' });

  it('uploadSalesFile throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'فرمت فایل نامعتبر است' }));
    await expect(uploadSalesFile(mockFile, { col1: 'mapped' })).rejects.toThrow('فرمت فایل نامعتبر است');
  });

  it('uploadSalesFile falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(uploadSalesFile(mockFile)).rejects.toThrow('خطا در پردازش فایل');
  });

  it('previewSalesFile throws the backend detail on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(400, { detail: 'ستون‌ها ناقص هستند' }));
    await expect(previewSalesFile(mockFile)).rejects.toThrow('ستون‌ها ناقص هستند');
  });

  it('previewSalesFile falls back to the generic message on a non-JSON error body', async () => {
    window.fetch = vi.fn().mockResolvedValue(errNonJson(500));
    await expect(previewSalesFile(mockFile)).rejects.toThrow('خطا در پیش‌نمایش فایل');
  });

  it('getSampleCSV returns the sample file', async () => {
    window.fetch = vi.fn().mockResolvedValue(okJson({ filename: 'sample.csv', content: 'a,b' }));
    const res = await getSampleCSV();
    expect(res.filename).toBe('sample.csv');
  });

  it('getSampleCSV throws on failure', async () => {
    window.fetch = vi.fn().mockResolvedValue(errJson(500, {}));
    await expect(getSampleCSV()).rejects.toThrow('خطا در دریافت فایل نمونه');
  });
});