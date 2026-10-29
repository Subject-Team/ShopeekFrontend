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
  fetchSettings: vi.fn(),
  previewSalesFile: vi.fn(),
  uploadSalesFile: vi.fn(),
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
    (api.fetchSettings as any).mockResolvedValue({
      telegram_sessions: [],
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

  it('renders the compact file upload card without sample data button', async () => {
    await renderPage();

    expect(screen.getByText(/بارگذاری فایل فاکتورها/i)).toBeInTheDocument();
    expect(screen.getByText(/شناسایی خودکار ستون‌ها و ورود دسته‌ای/i)).toBeInTheDocument();
    // Sample download button must be absent in compact mode
    expect(screen.queryByText(/بارگیری داده‌های نمونه فروش/i)).not.toBeInTheDocument();
  });

  it('renders the telegram bot card and shows connection status', async () => {
    (api.fetchSettings as any).mockResolvedValue({
      telegram_sessions: [
        { id: 'ts-1', telegram_chat_id: '12345678', created_at: '2026-03-20T10:00:00Z' },
      ],
    });

    await renderPage();

    expect(screen.getByText('ثبت فاکتور با ربات تلگرام')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/متصل به ربات/i)).toBeInTheDocument();
    });

    // Link button to bot
    const botLink = screen.getByRole('link', { name: /ورود به ربات Shopeek_Bot@/i });
    expect(botLink).toBeInTheDocument();
    expect(botLink).toHaveAttribute('href', 'https://t.me/Shopeek_Bot');
    expect(botLink).toHaveAttribute('target', '_blank');
  });

  it('opens telegram info modal when info icon is clicked', async () => {
    await renderPage();

    const infoBtn = screen.getByRole('button', { name: /راهنمای ربات تلگرام/i });
    fireEvent.click(infoBtn);

    await waitFor(() => {
      expect(screen.getByText(/راهنمای ثبت فاکتور با ربات تلگرام/i)).toBeInTheDocument();
      expect(screen.getByText(/ثبت سریع با متن روان/i)).toBeInTheDocument();
      expect(screen.getByText(/فروش ۲ عدد مانتو به خانم سارا احمدی/i)).toBeInTheDocument();
    });

    // Close button dismisses modal
    const closeBtn = screen.getByRole('button', { name: /^بستن$/ });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/راهنمای ثبت فاکتور با ربات تلگرام/i)).not.toBeInTheDocument();
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
