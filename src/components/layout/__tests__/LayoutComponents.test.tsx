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

describe('Layout Components', () => {
  it('renders PublicHeader with brand and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PublicHeader />
      </MemoryRouter>
    );

    expect(screen.getAllByText('شاپیک').length).toBeGreaterThan(0);
  });

  it('renders MainFooter with copyright and social links', () => {
    render(
      <MemoryRouter>
        <MainFooter />
      </MemoryRouter>
    );

    expect(screen.getByText(/تمامی حقوق محفوظ است/i)).toBeInTheDocument();
  });

  it('renders MinimalFooter', () => {
    render(
      <MemoryRouter>
        <MinimalFooter />
      </MemoryRouter>
    );

    expect(screen.getByText(/شاپیک/i)).toBeInTheDocument();
  });

  it('renders Sidebar with navigation items and guide launcher', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <GuideProvider>
            <PageContextProvider>
              <Sidebar isOpen={true} setIsOpen={vi.fn()} />
            </PageContextProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('داشبورد اصلی')).toBeInTheDocument();
    expect(screen.getByText('تحلیل و آمار فروش')).toBeInTheDocument();
    expect(screen.getByText(/مدیریت مشتریان/i)).toBeInTheDocument();
    expect(screen.getByText(/ورود داده‌ها/i)).toBeInTheDocument();
    expect(screen.getByText('راهنمای سامانه')).toBeInTheDocument();
  });

  it('renders Topbar with user profile, date filter, theme toggle, and chat launcher', () => {
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

    expect(screen.getByText('۱۴ روز')).toBeInTheDocument();
    expect(screen.getByText('۷ روز')).toBeInTheDocument();
    expect(screen.getByText('۳۰ روز')).toBeInTheDocument();

    // Click date filter
    fireEvent.click(screen.getByText('۷ روز'));
    fireEvent.click(screen.getByText('۳۰ روز'));

    // Click theme toggle
    const themeBtn = screen.getByTitle(/تغییر به حالت/i);
    fireEvent.click(themeBtn);

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
