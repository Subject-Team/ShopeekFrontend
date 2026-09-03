import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InvoicePage } from '../InvoicePage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchKPISummary: vi.fn(),
  fetchRevenueTrend: vi.fn(),
  fetchLatestAdvisory: vi.fn(),
  fetchAdvisoryHistory: vi.fn(),
  fetchCustomers: vi.fn(),
  fetchCustomerDetail: vi.fn(),
  triggerManualAdvisory: vi.fn(),
  uploadSalesFile: vi.fn(),
  previewSalesFile: vi.fn(),
  getSampleCSV: vi.fn(),
  fetchMeApi: vi.fn(),
  fetchSalesSuggestions: vi.fn(),
  createInvoice: vi.fn(),
}));

const suggestionsFixture = {
  products: {
    last: 'چای',
    top3: ['چای', 'قهوه', 'شیرینی'],
    names: ['چای', 'قهوه', 'شیرینی'],
  },
  customers: {
    last: 'علی',
    top3: ['علی', 'مریم'],
    items: [
      { id: 'c-1', name: 'علی', email: 'ali@example.com' },
      { id: 'c-2', name: 'مریم' },
    ],
  },
};

describe('InvoicePage (ثبت فاکتور)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shopeek_token', 'mock-valid-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' })
    );
    vi.clearAllMocks();
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'Test User',
      is_subscription_active: true,
      remaining_days: 30,
    });
    (api.fetchSalesSuggestions as any).mockResolvedValue(suggestionsFixture);
    (api.createInvoice as any).mockResolvedValue({
      transaction_reference: 'INV-10001',
      product_name: 'چای',
      customer_name: 'علی',
      customer_email: 'ali@example.com',
      total_amount: 2000,
      transaction_date: 'today',
    });
  });

  const renderPage = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter initialEntries={['/dashboard/invoice']}>
        <AuthProvider>
          <GuideProvider>
            <PageContextProvider>
              <ToastProvider>{ui}</ToastProvider>
            </PageContextProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders the invoice page with product/customer/amount/date fields', async () => {
    renderPage(<InvoicePage />);

    await waitFor(() => {
      expect(screen.getAllByText(/ثبت فاکتور مستقیم/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/محصول/i)).toBeInTheDocument();
    expect(screen.getByText(/مشتری/i)).toBeInTheDocument();
    expect(screen.getByText(/مبلغ \(هزار تومان\)/i)).toBeInTheDocument();
    expect(screen.getByText(/تاریخ فاکتور/i)).toBeInTheDocument();
  });

  it('shows the realtime grouped value and Persian words as the amount is typed', async () => {
    renderPage(<InvoicePage />);
    await waitFor(() => {
      expect(screen.getAllByText(/ثبت فاکتور مستقیم/i).length).toBeGreaterThan(0);
    });

    const amountInput = screen.getByPlaceholderText(/مثلاً ۲۰۰۰ برای ۲ میلیون تومان/i);
    fireEvent.change(amountInput, { target: { value: '2000' } });

    await waitFor(() => {
      expect(screen.getByText('2,000,000')).toBeInTheDocument();
      expect(screen.getByText(/۲ میلیون تومان/i)).toBeInTheDocument();
    });
  });

  it('submits an invoice with expected payload via product/customer chips', async () => {
    renderPage(<InvoicePage />);
    await waitFor(() => {
      expect(screen.getAllByText(/ثبت فاکتور مستقیم/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/آخرین: چای/i)).toBeInTheDocument();
      expect(screen.getByText(/آخرین: علی/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('آخرین: چای'));
    fireEvent.click(screen.getByText('آخرین: علی'));

    const amountInput = screen.getByPlaceholderText(/مثلاً ۲۰۰۰ برای ۲ میلیون تومان/i);
    fireEvent.change(amountInput, { target: { value: '2000' } });

    fireEvent.click(screen.getByRole('button', { name: /ثبت فاکتور$/i }));

    await waitFor(() => {
      expect(api.createInvoice).toHaveBeenCalledWith({
        product_name: 'چای',
        customer_name: 'علی',
        total_amount: 2000,
        transaction_date: 'today',
      });
    });
  });
});
