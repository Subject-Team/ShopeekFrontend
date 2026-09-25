// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LastInvoicesCard } from '../LastInvoicesCard';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  fetchInvoices: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockInvoicesResponse = {
  items: [
    {
      id: 'inv-1',
      transaction_reference: 'INV-1001',
      product_name: 'قهوه اسپرسو',
      customer_id: 'cust-1',
      customer_name: 'سارا رضایی',
      total_amount: 150000,
      currency: 'IRR',
      transaction_date: '2026-09-24T10:00:00Z',
      created_at: '2026-09-24T10:00:00Z',
    },
    {
      id: 'inv-2',
      transaction_reference: 'INV-1002',
      product_name: 'دانه قهوه',
      customer_id: 'cust-2',
      customer_name: 'علی محمدی',
      total_amount: 320000,
      currency: 'IRR',
      transaction_date: '2026-09-23T14:30:00Z',
      created_at: '2026-09-23T14:30:00Z',
    },
  ],
  total: 2,
  limit: 5,
  offset: 0,
};

describe('[component] LastInvoicesCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then lists the invoices', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('آخرین فاکتورها')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('قهوه اسپرسو')).toBeInTheDocument();
      expect(screen.getByText('سارا رضایی')).toBeInTheDocument();
      expect(screen.getByText('دانه قهوه')).toBeInTheDocument();
      expect(screen.getByText('علی محمدی')).toBeInTheDocument();
      expect(screen.getByText('INV-1001')).toBeInTheDocument();
    });
  });

  it('triggers onOpenInvoiceModal when clicking "ثبت فاکتور مستقیم"', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);
    const onOpenModal = vi.fn();

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={onOpenModal} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('قهوه اسپرسو')).toBeInTheDocument();
    });

    const createBtn = screen.getByText('ثبت فاکتور مستقیم');
    fireEvent.click(createBtn);
    expect(onOpenModal).toHaveBeenCalledTimes(1);
  });

  it('hides "ثبت فاکتور مستقیم" button when readOnly is true', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} readOnly={true} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('قهوه اسپرسو')).toBeInTheDocument();
    });

    expect(screen.queryByText('ثبت فاکتور مستقیم')).not.toBeInTheDocument();
  });

  it('navigates to /dashboard/ingestion when clicking "ورود داده‌ها"', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} />
      </MemoryRouter>
    );

    const ingestionBtn = screen.getByText('ورود داده‌ها');
    fireEvent.click(ingestionBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ingestion');
  });

  it('navigates to /dashboard/invoices when clicking "مشاهده همه"', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} />
      </MemoryRouter>
    );

    const viewAllBtn = screen.getByText('مشاهده همه');
    fireEvent.click(viewAllBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/invoices');
  });

  it('displays historical archive notice and blurred state when isHistorical is true', async () => {
    (api.fetchInvoices as any).mockResolvedValue(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard
          onOpenInvoiceModal={vi.fn()}
          isHistorical={true}
          startDate="2026-08-01"
          endDate="2026-08-15"
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('درحال مشاهده اطلاعات آرشیوی هستید.')).toBeInTheDocument();
      expect(
        screen.getByText(/برای دسترسی به فاکتورهای اخیر بازه زمانی را تغییر دهید/i)
      ).toBeInTheDocument();
    });

    const invoicesLinkBtn = screen.getByText('صفحه فاکتورها');
    fireEvent.click(invoicesLinkBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/invoices');
  });

  it('renders empty state when no invoices are returned', async () => {
    (api.fetchInvoices as any).mockResolvedValue({ items: [], total: 0, limit: 5, offset: 0 });

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('در این بازه زمانی فاکتوری یافت نشد.')).toBeInTheDocument();
    });
  });

  it('renders error state and retries on button click', async () => {
    (api.fetchInvoices as any).mockRejectedValueOnce(new Error('خطا در برقراری ارتباط'));
    (api.fetchInvoices as any).mockResolvedValueOnce(mockInvoicesResponse);

    render(
      <MemoryRouter>
        <LastInvoicesCard onOpenInvoiceModal={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('خطا در برقراری ارتباط')).toBeInTheDocument();
    });

    const retryBtn = screen.getByText('تلاش دوباره');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('قهوه اسپرسو')).toBeInTheDocument();
    });
  });
});
