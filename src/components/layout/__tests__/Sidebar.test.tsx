// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { renderWithProviders } from '../../../test/testUtils';
import { ThemeProvider } from '../../../context/ThemeContext';
import { GuideProvider } from '../../../context/GuideContext';
import { PageContextProvider } from '../../../context/PageContext';
import { AuthProvider } from '../../../context/AuthContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', async () => {
  const actual = await vi.importActual<any>('../../../services/api');
  return {
    ...actual,
    fetchMeApi: vi.fn(),
    fetchBillingOverview: vi.fn().mockResolvedValue(null),
  };
});

vi.mock('../../../services/api/credits', async () => {
  const actual = await vi.importActual<any>('../../../services/api/credits');
  return {
    ...actual,
    fetchCreditAlertPrefs: vi.fn().mockResolvedValue({
      alert_threshold: 0,
      suppress_all_alerts: false,
      suppressed_feature_keys: [],
    }),
  };
});

describe('[component] Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders standard navigation items without admin link for guest / unauthenticated users', async () => {
    (api.fetchMeApi as any).mockRejectedValue(new Error('no token'));
    await renderWithProviders(<Sidebar isOpen={true} setIsOpen={vi.fn()} />, { withTheme: true });

    expect(screen.getByText('داشبورد اصلی')).toBeInTheDocument();
    expect(screen.getByText('تحلیل و آمار فروش')).toBeInTheDocument();
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
  });

  it('renders standard navigation items without admin link for regular users', async () => {
    const regularUser = { id: 'u-reg', email: 'user@test.ir', full_name: 'Regular User', role: 'User' };
    localStorage.setItem('shopeek_token', 'test-token');
    localStorage.setItem('shopeek_user', JSON.stringify(regularUser));
    (api.fetchMeApi as any).mockResolvedValue(regularUser);

    await renderWithProviders(<Sidebar isOpen={true} setIsOpen={vi.fn()} />, { withTheme: true });

    expect(screen.getByText('داشبورد اصلی')).toBeInTheDocument();
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
  });

  it('hides admin link by default while loading so users do not see noise', () => {
    const adminUser = { id: 'u-adm', email: 'admin@test.ir', full_name: 'Admin User', role: 'Admin' };
    localStorage.setItem('shopeek_token', 'admin-token');
    localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
    // Hang fetchMeApi promise so isLoading stays true during the initial render pass
    (api.fetchMeApi as any).mockReturnValue(new Promise(() => {}));

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

    // Even though admin user is in localStorage, isLoading is true on mount,
    // so the admin link is hidden by default to avoid noise
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
    expect(screen.getByText('داشبورد اصلی')).toBeInTheDocument();
  });

  it('renders admin link above "داشبورد اصلی" when user is Admin', async () => {
    const adminUser = { id: 'u-adm', email: 'admin@test.ir', full_name: 'Admin User', role: 'Admin' };
    localStorage.setItem('shopeek_token', 'admin-token');
    localStorage.setItem('shopeek_user', JSON.stringify(adminUser));
    (api.fetchMeApi as any).mockResolvedValue(adminUser);

    const setIsOpen = vi.fn();
    await renderWithProviders(<Sidebar isOpen={true} setIsOpen={setIsOpen} />, { withTheme: true });

    const adminLink = screen.getByRole('link', { name: /پنل مدیریت/i });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');

    const dashboardLink = screen.getByRole('link', { name: /داشبورد اصلی/i });
    expect(dashboardLink).toBeInTheDocument();

    // Verify ordering: admin link should appear before dashboard link in DOM
    const navLinks = screen.getAllByRole('link');
    const adminIndex = navLinks.indexOf(adminLink);
    const dashboardIndex = navLinks.indexOf(dashboardLink);
    expect(adminIndex).toBeLessThan(dashboardIndex);

    // Clicking admin link closes mobile sidebar
    fireEvent.click(adminLink);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
