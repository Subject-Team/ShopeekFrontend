// @test-type page
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomersPage } from '../CustomersPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchCustomers: vi.fn(),
  fetchCustomerDetail: vi.fn(),
  createCustomer: vi.fn(),
  fetchMeApi: vi.fn(),
}));

const CUSTOMER = {
  id: 'c-1',
  name: 'مشتری نمونه',
  email: 'customer@example.com',
  phone: '09120000000',
  address: 'تهران',
  transactions_count: 3,
  total_spent: 5000000,
  last_transaction_at: '2026-08-01',
  created_at: '2026-07-01',
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/customers']}>
      <AuthProvider>
        <GuideProvider>
          <PageContextProvider>
            <ToastProvider>
              <CustomersPage />
            </ToastProvider>
          </PageContextProvider>
        </GuideProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('[page] CustomersPage', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => consoleError.mockRestore());

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
    });
    (api.fetchCustomers as any).mockResolvedValue([CUSTOMER]);
  });

  it('shows a loading spinner while the customers request is in flight', () => {
    let resolveCustomers: (value: unknown) => void = () => {};
    (api.fetchCustomers as any).mockReturnValue(
      new Promise((resolve) => {
        resolveCustomers = resolve;
      })
    );

    const { container } = renderPage();

    expect(screen.getByText('در حال بارگذاری مشتریان...')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('هنوز مشتری ثبت نشده است')).not.toBeInTheDocument();

    resolveCustomers([CUSTOMER]);
  });

  it('renders the customer list after a successful load', async () => {
    renderPage();

    expect((await screen.findAllByText('مشتری نمونه')).length).toBeGreaterThan(0);
    expect(screen.getByText('لیست مشتریان و ارزش طول عمر (LTV)')).toBeInTheDocument();
    expect(screen.queryByText('در حال بارگذاری مشتریان...')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error card with retry instead of an empty list when the request fails', async () => {
    (api.fetchCustomers as any).mockRejectedValue(new Error('boom'));

    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('دریافت لیست مشتریان ممکن نشد.');
    expect(screen.getByText('تلاش مجدد')).toBeInTheDocument();
    expect(screen.queryByText('هنوز مشتری ثبت نشده است')).not.toBeInTheDocument();
  });

  it('refetches the customers when retry is pressed after a failure', async () => {
    (api.fetchCustomers as any).mockRejectedValueOnce(new Error('boom'));

    renderPage();

    fireEvent.click(await screen.findByText('تلاش مجدد'));

    await waitFor(() => {
      expect(api.fetchCustomers).toHaveBeenCalledTimes(2);
    });
    expect((await screen.findAllByText('مشتری نمونه')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a friendly empty state with a create CTA when there are no customers', async () => {
    (api.fetchCustomers as any).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('هنوز مشتری ثبت نشده است')).toBeInTheDocument();
    expect(
      screen.getByText(/با ثبت اولین مشتری، ارزش طول عمر و سابقه خرید او اینجا نمایش داده شود/)
    ).toBeInTheDocument();
    expect(screen.getByText('ثبت اولین مشتری')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the empty-state CTA for read-only users', async () => {
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'Test User',
      is_subscription_active: false,
      is_read_only: true,
    });
    (api.fetchCustomers as any).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('هنوز مشتری ثبت نشده است')).toBeInTheDocument();
    expect(screen.queryByText('ثبت اولین مشتری')).not.toBeInTheDocument();
  });
});
