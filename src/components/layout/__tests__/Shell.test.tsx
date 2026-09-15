// @test-type component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Shell } from '../Shell';
import { AuthProvider } from '../../../context/AuthContext';
import { GuideProvider } from '../../../context/GuideContext';
import { PageContextProvider } from '../../../context/PageContext';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ToastProvider } from '../../../context/ToastContext';

const { MOCK_USER } = vi.hoisted(() => ({
  MOCK_USER: { id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' },
}));

vi.mock('../../../services/api', () => ({
  fetchMeApi: vi.fn().mockResolvedValue(MOCK_USER),
  fetchBillingOverview: vi.fn().mockResolvedValue({
    plan: {
      key: 'pro',
      name_fa: null,
      status: 'active',
      is_exempt: false,
      remaining_days: 12,
      next_payment_due: null,
      current_period_started_at: null,
    },
    wallet: {
      monthly_balance: 100,
      purchased_balance: 40,
      pending_session_charge: 0,
      pending_account_charge: 0,
    },
    usage: [],
    ledger: [],
    stats: { total_granted: 100, total_spent: 0, spend_by_feature: {} },
  }),
}));

describe('[component] Shell Component', () => {
  it('renders Shell with child contents and layout elements', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem('shopeek_user', JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir' }));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <PageContextProvider>
                <GuideProvider>
                  <Shell>
                    <div data-testid="dashboard-content">محتوای اصلی داشبورد</div>
                  </Shell>
                </GuideProvider>
              </PageContextProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    await act(async () => {});

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });
});