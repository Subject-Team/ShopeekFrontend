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

describe('FileUploader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <FileUploader />
      </ToastProvider>
    );

  it('renders upload zone and sample download button', () => {
    renderComponent();
    expect(screen.getByText(/بارگذاری و ورودی فایل فاکتورها/i)).toBeInTheDocument();
    expect(screen.getByText(/بارگیری داده‌های نمونه فروش/i)).toBeInTheDocument();
    expect(screen.getByText(/فایل Excel یا CSV خود را اینجا بکشید/i)).toBeInTheDocument();
  });

  it('rejects files larger than 10MB', async () => {
    renderComponent();

    // Create a 11MB dummy file
    const largeFile = new File(['a'.repeat(1024)], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const input = screen.getByLabelText(/انتخاب فایل/i) || document.querySelector('input[type="file"]');
    if (input) {
      fireEvent.change(input, { target: { files: [largeFile] } });
    }

    await waitFor(() => {
      expect(api.previewSalesFile).not.toHaveBeenCalled();
    });
  });

  it('downloads sample csv when clicking sample button', async () => {
    (api.getSampleCSV as any).mockResolvedValue({
      filename: 'sample.csv',
      content: 'col1,col2\nval1,val2',
    });
    (api.previewSalesFile as any).mockResolvedValue({
      headers: ['col1', 'col2'],
      detected_mapping: { col1: 'شماره فاکتور' },
      sample_rows: [{ col1: 'val1', col2: 'val2' }],
      source_type: 'CSV',
    });

    renderComponent();
    const sampleBtn = screen.getByText(/بارگیری داده‌های نمونه فروش/i);
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(api.getSampleCSV).toHaveBeenCalled();
    });
  });
});
