// @test-type component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicHeader } from '../PublicHeader';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';
import { MainFooter } from '../MainFooter';
import { MinimalFooter } from '../MinimalFooter';
import { SEO } from '../../common/SEO';
import { ScrollToTop } from '../../common/ScrollToTop';
import { AuthProvider } from '../../../context/AuthContext';
import { GuideProvider } from '../../../context/GuideContext';
import { PageContextProvider } from '../../../context/PageContext';
import { ThemeProvider } from '../../../context/ThemeContext';

describe('[component] Layout Components', () => {
  it('renders PublicHeader with brand and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PublicHeader />
      </MemoryRouter>
    );

    expect(screen.getAllByText('شاپیک').length).toBeGreaterThan(0);
  });

  it('renders PublicHeader with a plans link in the desktop nav', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PublicHeader />
      </MemoryRouter>
    );

    const plansLink = screen.getByRole('link', { name: 'طرح‌ها' });
    expect(plansLink).toHaveAttribute('href', '/plans');
  });

  it('renders MainFooter with copyright and social links', () => {
    render(
      <MemoryRouter>
        <MainFooter />
      </MemoryRouter>
    );

    expect(screen.getByText(/تمامی حقوق محفوظ است/i)).toBeInTheDocument();
  });

  it('renders MainFooter with a plans link', () => {
    render(
      <MemoryRouter>
        <MainFooter />
      </MemoryRouter>
    );

    const plansLink = screen.getByRole('link', { name: 'طرح‌ها و تعرفه‌ها' });
    expect(plansLink).toHaveAttribute('href', '/plans');
  });

  it('renders MinimalFooter', () => {
    render(
      <MemoryRouter>
        <MinimalFooter />
      </MemoryRouter>
    );

    expect(screen.getByText(/شاپیک/i)).toBeInTheDocument();
  });

  it('renders Sidebar with navigation items, guide launcher, theme toggle, and user controls', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ThemeProvider>
          <AuthProvider>
            <GuideProvider>
              <PageContextProvider>
                <Sidebar isOpen={true} setIsOpen={vi.fn()} />
              </PageContextProvider>
            </GuideProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('داشبورد اصلی')).toBeInTheDocument();
    expect(screen.getByText('تحلیل و آمار فروش')).toBeInTheDocument();
    expect(screen.getByText(/مدیریت مشتریان/i)).toBeInTheDocument();
    expect(screen.getByText(/ورود داده‌ها/i)).toBeInTheDocument();
    expect(screen.getByText('راهنمای سامانه')).toBeInTheDocument();
    expect(screen.getByTitle(/تغییر به حالت/i)).toBeInTheDocument();
  });

  it('opens account switcher popover in Sidebar and lists accounts', async () => {
    localStorage.setItem('shopeek_token', 'test-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'user1@shopeek.ir', full_name: 'کاربر اول', role: 'User' })
    );
    const accounts = [
      {
        user: { id: 'u-1', email: 'user1@shopeek.ir', full_name: 'کاربر اول', role: 'User' },
        token: 'test-token',
        lastActiveAt: Date.now(),
      },
      {
        user: { id: 'u-2', phone: '09120000000', full_name: 'کاربر دوم', role: 'User' },
        token: 'token-2',
        lastActiveAt: Date.now() - 5000,
      },
    ];
    localStorage.setItem('shopeek_accounts', JSON.stringify(accounts));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ThemeProvider>
          <AuthProvider>
            <GuideProvider>
              <PageContextProvider>
                <Sidebar isOpen={true} setIsOpen={vi.fn()} />
              </PageContextProvider>
            </GuideProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Find and click the switch icon button
    const switchBtn = screen.getByTitle('تغییر یا مدیریت حساب‌های متصل');
    expect(switchBtn).toBeInTheDocument();
    fireEvent.click(switchBtn);

    // Popover opens
    expect(screen.getByText('حساب‌های متصل')).toBeInTheDocument();
    expect(screen.getAllByText('کاربر اول').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /افزودن حساب کاربری جدید/ })).toHaveAttribute('href', '/login');
    expect(screen.getByText('خروج از تمام حساب‌ها')).toBeInTheDocument();

    // Switch account to second user
    fireEvent.click(screen.getByTitle('تغییر به حساب کاربر دوم'));
    expect(localStorage.getItem('shopeek_token')).toBe('token-2');
  });

  it('renders Topbar with subscription plan, remaining credits, date filter, and chat launcher', () => {
    const onMenu = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <GuideProvider>
            <PageContextProvider>
              <ThemeProvider>
                <Topbar onMenuClick={onMenu} />
              </ThemeProvider>
            </PageContextProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Subscription plan card and Remaining credits card are rendered
    expect(screen.getByTitle(/طرح اشتراک/i)).toHaveAttribute('href', '/dashboard/subscription');
    expect(screen.getByTitle('اعتبار باقی‌مانده')).toHaveAttribute('href', '/dashboard/subscription');

    // Date filter trigger button is rendered
    const dateBtn = screen.getByTitle(/انتخاب بازه زمانی/i);
    expect(dateBtn).toBeInTheDocument();
    fireEvent.click(dateBtn);

    // Modal opens showing Jalali calendar and presets (the Topbar button label
    // may also show the verbatim preset label when the current range is a preset)
    expect(screen.getByText('انتخاب بازه زمانی (شمسی)')).toBeInTheDocument();
    expect(screen.getAllByText('۷ روز اخیر').length).toBeGreaterThan(0);
    expect(screen.getAllByText('۱۴ روز اخیر').length).toBeGreaterThan(0);
    expect(screen.getAllByText('۳۰ روز اخیر').length).toBeGreaterThan(0);

    // Click 14-day preset and apply
    fireEvent.click(screen.getByText('۱۴ روز اخیر'));
    fireEvent.click(screen.getByText('تأیید و اعمال بازه'));

    // Click chat launcher
    const chatBtn = screen.getByTitle('دستیار هوشمند');
    fireEvent.click(chatBtn);
  });

  it('SEO and ScrollToTop components mount without error', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SEO title="شاپیک | عنوان تستی" description="توضیحات تستی" />
        <ScrollToTop />
      </MemoryRouter>
    );
  });
});
