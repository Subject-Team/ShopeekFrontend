import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from '../FileUploader';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  uploadSalesFile: vi.fn(),
  previewSalesFile: vi.fn(),
  getSampleCSV: vi.fn(),
}));

const bytes = (...byteValues: number[]) => new Uint8Array(byteValues);

const makeFile = (parts: BlobPart[], name: string, size?: number) => {
  const file = new File(parts, name);
  if (size !== undefined) Object.defineProperty(file, 'size', { value: size });
  return file;
};

const VALID_CSV = makeFile([new TextEncoder().encode('col1,col2\nval1,val2')], 'sales.csv');

describe('FileUploader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.previewSalesFile as any).mockResolvedValue({
      headers: ['col1', 'col2'],
      detected_mapping: { col1: 'شماره فاکتور', col2: 'مبلغ' },
      sample_rows: [{ col1: 'val1', col2: 'val2' }],
      source_type: 'CSV',
    });
    (api.uploadSalesFile as any).mockResolvedValue({ message: '۲ تراکنش با موفقیت ثبت شد.' });
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <FileUploader />
      </ToastProvider>
    );

  const getFileInput = (container: HTMLElement) =>
    container.querySelector('input[type="file"]') as HTMLInputElement;

  const getDropZone = (container: HTMLElement) =>
    container.querySelector('[data-guide="ingestion-upload-zone"]') as HTMLElement;

  const pickFile = async (container: HTMLElement, file: File) => {
    fireEvent.change(getFileInput(container), { target: { files: [file] } });
  };

  it('renders upload zone and sample download button', () => {
    const { container } = renderComponent();
    expect(screen.getByText(/بارگذاری و ورودی فایل فاکتورها/i)).toBeInTheDocument();
    expect(screen.getByText(/بارگیری داده‌های نمونه فروش/i)).toBeInTheDocument();
    expect(screen.getByText(/فایل Excel یا CSV خود را اینجا بکشید/i)).toBeInTheDocument();
    expect(getDropZone(container)).toBeInTheDocument();
  });

  it('rejects files larger than 10MB', async () => {
    const { container } = renderComponent();

    // Create a 11MB dummy file
    const largeFile = makeFile(['a'.repeat(1024)], 'large.csv', 11 * 1024 * 1024);

    await pickFile(container, largeFile);

    await waitFor(() => {
      expect(api.previewSalesFile).not.toHaveBeenCalled();
    });
    expect(await screen.findByText(/بیش از سقف مجاز/i)).toBeInTheDocument();
  });

  it('rejects empty files before any network call', async () => {
    const { container } = renderComponent();

    await pickFile(container, makeFile([''], 'empty.csv', 0));

    expect(await screen.findByText(/فایل انتخاب‌شده خالی است/i)).toBeInTheDocument();
    expect(api.previewSalesFile).not.toHaveBeenCalled();
  });

  it.each([
    ['windows executable', bytes(0x4d, 0x5a, 0x90, 0x00), /فایل اجرایی ویندوز/i],
    ['linux executable', bytes(0x7f, 0x45, 0x4c, 0x46), /فایل اجرایی لینوکس/i],
    ['pdf document', bytes(0x25, 0x50, 0x44, 0x46), /PDF به جای فایل متنی/i],
    ['zip archive', bytes(0x50, 0x4b, 0x03, 0x04), /فایل فشرده Zip به جای فایل متنی/i],
    ['binary null bytes', bytes(0x61, 0x2c, 0x62, 0x00, 0x63), /فایل باینری است/i],
  ])('rejects %s disguised as CSV via magic bytes', async (_label, headerBytes, expectedError) => {
    const { container } = renderComponent();

    await pickFile(container, makeFile([headerBytes], 'evil.csv'));

    expect(await screen.findByText(expectedError)).toBeInTheDocument();
    expect(api.previewSalesFile).not.toHaveBeenCalled();
  });

  it('rejects an excel file whose header is not an OpenXML zip', async () => {
    const { container } = renderComponent();

    await pickFile(container, makeFile([bytes(0x00, 0x01, 0x02, 0x03)], 'report.xlsx'));

    expect(await screen.findByText(/ساختار فایل اکسل نامعتبر است/i)).toBeInTheDocument();
    expect(api.previewSalesFile).not.toHaveBeenCalled();
  });

  it('shows column mapping and sample rows after a successful preview', async () => {
    const onSuccess = vi.fn();
    const { container } = render(
      <ToastProvider>
        <FileUploader onSuccess={onSuccess} />
      </ToastProvider>
    );

    await pickFile(container, VALID_CSV);

    expect(await screen.findByText(/نگاشت ستون‌های شناسايی شده/i)).toBeInTheDocument();
    expect(screen.getByText('sales.csv')).toBeInTheDocument();
    expect(screen.getByText(/تایید و ثبت نهایی فاکتورها/i)).toBeInTheDocument();
    expect(screen.getByText(/ستون‌ها و سربرگ‌های فایل با موفقیت شناسایی شدند/i)).toBeInTheDocument();
    expect(api.previewSalesFile).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('resets back to the dropzone when clicking change-file', async () => {
    const { container } = renderComponent();

    await pickFile(container, VALID_CSV);
    fireEvent.click(await screen.findByText('تغییر فایل'));

    expect(getDropZone(container)).toBeInTheDocument();
    expect(api.uploadSalesFile).not.toHaveBeenCalled();
  });

  it('uploads the file with detected mapping and reports success', async () => {
    const onSuccess = vi.fn();
    const { container } = render(
      <ToastProvider>
        <FileUploader onSuccess={onSuccess} />
      </ToastProvider>
    );

    await pickFile(container, VALID_CSV);
    fireEvent.click(await screen.findByText(/تایید و ثبت نهایی فاکتورها/i));

    await waitFor(() => {
      expect(api.uploadSalesFile).toHaveBeenCalledWith(
        expect.any(File),
        { col1: 'شماره فاکتور', col2: 'مبلغ' }
      );
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/۲ تراکنش با موفقیت ثبت شد/i)).toBeInTheDocument();
    // Back to the empty dropzone after successful processing
    expect(getDropZone(container)).toBeInTheDocument();
  });

  it('shows an error toast when processing fails', async () => {
    (api.uploadSalesFile as any).mockRejectedValue(new Error('پردازش ناموفق بود'));
    const { container } = renderComponent();

    await pickFile(container, VALID_CSV);
    fireEvent.click(await screen.findByText(/تایید و ثبت نهایی فاکتورها/i));

    expect(await screen.findByText(/پردازش ناموفق بود/i)).toBeInTheDocument();
  });

  it('shows a fallback error when preview fails without a message', async () => {
    (api.previewSalesFile as any).mockRejectedValue({ message: '' });
    const { container } = renderComponent();

    await pickFile(container, VALID_CSV);

    expect(await screen.findByText(/خطا در پیش‌نمایش فایل/i)).toBeInTheDocument();
    expect(getDropZone(container)).toBeInTheDocument();
  });

  it('highlights the dropzone while dragging over it', () => {
    const { container } = renderComponent();
    const zone = getDropZone(container);

    fireEvent.dragOver(zone);
    expect(zone.className).toContain('border-brand-500');

    fireEvent.dragLeave(zone);
    expect(zone.className).toContain('border-slate-300');
  });

  it('handles dropping a file onto the zone', async () => {
    const { container } = renderComponent();
    const zone = getDropZone(container);

    fireEvent.drop(zone, { dataTransfer: { files: [VALID_CSV] } });

    expect(await screen.findByText(/نگاشت ستون‌های شناسايی شده/i)).toBeInTheDocument();
  });

  it('ignores drop events without files', () => {
    const { container } = renderComponent();
    const zone = getDropZone(container);

    fireEvent.drop(zone, { dataTransfer: { files: [] } });

    expect(api.previewSalesFile).not.toHaveBeenCalled();
    expect(getDropZone(container)).toBeInTheDocument();
  });

  it('downloads sample csv when clicking sample button', async () => {
    (api.getSampleCSV as any).mockResolvedValue({
      filename: 'sample.csv',
      content: 'col1,col2\nval1,val2',
    });

    renderComponent();
    const sampleBtn = screen.getByText(/بارگیری داده‌های نمونه فروش/i);
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(api.getSampleCSV).toHaveBeenCalled();
      expect(api.previewSalesFile).toHaveBeenCalled();
    });
  });

  it('shows an error toast when sample download fails', async () => {
    (api.getSampleCSV as any).mockRejectedValue(new Error('offline'));
    renderComponent();

    fireEvent.click(screen.getByText(/بارگیری داده‌های نمونه فروش/i));

    expect(await screen.findByText(/خطا در دریافت داده نمونه/i)).toBeInTheDocument();
  });
});

