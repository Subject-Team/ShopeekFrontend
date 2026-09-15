// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InvoicesPage } from '../InvoicesPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchInvoices: vi.fn(),
  fetchSalesSuggestions: vi.fn(),
  fetchMeApi: vi.fn(),
}));

describe('[page] InvoicesPage (فاکتورهای فروش)', () => {
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
    (api.fetchSalesSuggestions as any).mockResolvedValue({
      products: { last: null, top3: [], names: [] },
      customers: { last: null, top3: [], items: [] },
    });
    (api.fetchInvoices as any).mockResolvedValue({
      items: [
        {
          id: 'inv-1',
          transaction_reference: 'INV-1001',
          product_name: 'چای',
          customer_name: 'علی',
          total_amount: 2500000,
          currency: 'IRR',
          transaction_date: '2026-03-21T10:00:00',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  const renderPage = async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/invoices']}>
        <AuthProvider>
          <GuideProvider>
            <PageContextProvider>
              <ToastProvider>
                <InvoicesPage />
              </ToastProvider>
            </PageContextProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    await act(async () => {});
  };

  it('renders the invoices header and loads the list', async () => {
    await renderPage();

    expect(screen.getByText('فاکتورهای فروش')).toBeInTheDocument();
    await waitFor(() => {
      expect(api.fetchInvoices).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, offset: 0 })
      );
      expect(screen.getByText('چای')).toBeInTheDocument();
    });
  });

  it('opens the direct invoice modal from the CTA', async () => {
    await renderPage();

    const cta = screen.getAllByText(/ثبت فاکتور مستقیم/i)[0];
    fireEvent.click(cta.closest('button')!);

    await waitFor(() => {
      expect(api.fetchSalesSuggestions).toHaveBeenCalled();
    });
  });

  it('hides the direct invoice CTA for read-only users', async () => {
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'Test User',
      is_subscription_active: false,
      remaining_days: 0,
      is_read_only: true,
    });

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('چای')).toBeInTheDocument();
    });
    expect(screen.queryByText(/ثبت فاکتور مستقیم/i)).not.toBeInTheDocument();
  });
});
