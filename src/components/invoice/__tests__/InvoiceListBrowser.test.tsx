// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { InvoiceListBrowser } from '../InvoiceListBrowser';
import * as api from '../../../services/api';
import type { InvoicesResponse } from '../../../types';

vi.mock('../../../services/api', () => ({
  fetchInvoices: vi.fn(),
}));

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
let ioCallback: IOCallback | null = null;

class StubIntersectionObserver {
  constructor(cb: IOCallback) {
    ioCallback = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

const invoice = (i: number) => ({
  id: `inv-${i}`,
  transaction_reference: `INV-100${i}`,
  product_name: `محصول ${i}`,
  customer_name: `مشتری ${i}`,
  total_amount: 1000000 + i,
  currency: 'IRR',
  transaction_date: `2026-03-${String(20 - i).padStart(2, '0')}T10:00:00`,
});

const response = (
  items: ReturnType<typeof invoice>[],
  total: number
): InvoicesResponse => ({
  items,
  total,
  limit: 20,
  offset: 0,
});

describe('[component] InvoiceListBrowser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.IntersectionObserver = StubIntersectionObserver as any;
    ioCallback = null;
  });

  it('renders first page items with product, customer, amount and reference', async () => {
    (api.fetchInvoices as any).mockResolvedValue(response([invoice(1), invoice(2)], 2));

    render(<InvoiceListBrowser />);

    await waitFor(() => {
      expect(api.fetchInvoices).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, offset: 0 })
      );
    });
    expect(await screen.findByText('محصول 1')).toBeInTheDocument();
    expect(screen.getByText('محصول 2')).toBeInTheDocument();
    expect(screen.getByText('مشتری 1')).toBeInTheDocument();
    expect(screen.getByText('INV-1001')).toBeInTheDocument();
    expect(screen.getByText('۲ فاکتور')).toBeInTheDocument();
  });

  it('shows empty state when no invoices exist', async () => {
    (api.fetchInvoices as any).mockResolvedValue(response([], 0));

    render(<InvoiceListBrowser />);

    expect(await screen.findByText('فاکتوری یافت نشد.')).toBeInTheDocument();
  });

  it('shows error state with retry, and retry refetches', async () => {
    (api.fetchInvoices as any).mockRejectedValueOnce(new Error('خطا در دریافت لیست فاکتورها'));

    render(<InvoiceListBrowser />);

    expect(await screen.findByText('خطا در دریافت لیست فاکتورها')).toBeInTheDocument();

    (api.fetchInvoices as any).mockResolvedValue(response([invoice(1)], 1));
    fireEvent.click(screen.getByText('تلاش مجدد'));

    expect(await screen.findByText('محصول 1')).toBeInTheDocument();
    expect(api.fetchInvoices).toHaveBeenCalledTimes(2);
  });

  it('loads the next page when the sentinel intersects (infinite scroll)', async () => {
    const pageOne = [invoice(1), invoice(2)];
    (api.fetchInvoices as any).mockResolvedValueOnce(response(pageOne, 3));

    render(<InvoiceListBrowser />);
    expect(await screen.findByText('محصول 1')).toBeInTheDocument();
    expect(screen.queryByText('محصول 3')).not.toBeInTheDocument();

    (api.fetchInvoices as any).mockResolvedValueOnce(response([invoice(3)], 3));
    expect(ioCallback).not.toBeNull();
    await act(async () => {
      ioCallback?.([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(api.fetchInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({ offset: 2 })
      );
      expect(screen.getByText('محصول 3')).toBeInTheDocument();
    });
  });

  it('debounces search input and refetches with the search term', async () => {
    (api.fetchInvoices as any).mockResolvedValue(response([invoice(1)], 1));

    render(<InvoiceListBrowser />);
    await screen.findByText('محصول 1');
    expect(api.fetchInvoices).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText(/جستجو در محصول/), {
      target: { value: 'کیف' },
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    expect(api.fetchInvoices).toHaveBeenCalledTimes(2);
    expect(api.fetchInvoices).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'کیف', offset: 0 })
    );
  });

  it('applies a Jalali date range and clears it via نمایش همه', async () => {
    (api.fetchInvoices as any).mockResolvedValue(response([invoice(1)], 1));

    render(<InvoiceListBrowser />);
    await screen.findByText('محصول 1');
    expect(api.fetchInvoices).toHaveBeenCalledTimes(1);

    // Open range picker, pick start then end day (past days of current month)
    fireEvent.click(screen.getByRole('button', { name: /همه تاریخ‌ها/ }));
    fireEvent.click(screen.getByText('۱'));
    fireEvent.click(screen.getByText('۲'));

    await waitFor(() => {
      expect(api.fetchInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        })
      );
    });

    // Re-open the picker and clear the range
    fireEvent.click(screen.getByRole('button', { name: /تا/ }));
    fireEvent.click(screen.getByText('نمایش همه'));

    await waitFor(() => {
      expect(api.fetchInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({ startDate: undefined, endDate: undefined })
      );
    });
  });
});
