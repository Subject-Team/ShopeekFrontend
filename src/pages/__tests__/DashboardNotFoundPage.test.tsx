// @test-type page
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardNotFoundPage } from '../DashboardNotFoundPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('[page] DashboardNotFoundPage', () => {
  it('renders 404 badge, heading, and description', () => {
    render(
      <MemoryRouter>
        <DashboardNotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/کد خطا: ۴۰۴ \/ بخش نامعتبر/)).toBeInTheDocument();
    expect(screen.getAllByText('بخش مورد نظر در داشبورد یافت نشد').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/صفحه یا بخشی که به دنبال آن هستید وجود ندارد، حذف شده یا ممکن است نشانی واردشده به اشتباه تایپ شده باشد\./)
    ).toBeInTheDocument();
  });

  it('renders primary CTA linking back to /dashboard', () => {
    render(
      <MemoryRouter>
        <DashboardNotFoundPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /بازگشت به داشبورد اصلی/ });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('triggers navigate(-1) when clicking go back button', () => {
    mockNavigate.mockClear();

    render(
      <MemoryRouter>
        <DashboardNotFoundPage />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /بازگشت به صفحه قبل/ });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders quick links to key dashboard sections', () => {
    render(
      <MemoryRouter>
        <DashboardNotFoundPage />
      </MemoryRouter>
    );

    const invoicesLink = screen.getByRole('link', { name: /فاکتورهای فروش/ });
    expect(invoicesLink).toBeInTheDocument();
    expect(invoicesLink).toHaveAttribute('href', '/dashboard/invoices');

    const analyticsLink = screen.getByRole('link', { name: /تحلیل و آمار فروش/ });
    expect(analyticsLink).toBeInTheDocument();
    expect(analyticsLink).toHaveAttribute('href', '/dashboard/analytics');

    const customersLink = screen.getByRole('link', { name: /مدیریت مشتریان/ });
    expect(customersLink).toBeInTheDocument();
    expect(customersLink).toHaveAttribute('href', '/dashboard/customers');

    const ingestionLink = screen.getByRole('link', { name: /ورود داده‌ها/ });
    expect(ingestionLink).toBeInTheDocument();
    expect(ingestionLink).toHaveAttribute('href', '/dashboard/ingestion');
  });

  it('sets document title using SEO component', () => {
    render(
      <MemoryRouter>
        <DashboardNotFoundPage />
      </MemoryRouter>
    );

    expect(document.title).toContain('صفحه یافت نشد | داشبورد شاپیک');
  });
});
