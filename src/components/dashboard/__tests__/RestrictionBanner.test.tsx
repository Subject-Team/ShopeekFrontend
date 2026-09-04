import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RestrictionBanner } from '../RestrictionBanner';
import { User } from '../../../types';
import { ToastProvider } from '../../../context/ToastContext';

vi.mock('../../../services/api', () => ({
  resendVerificationApi: vi.fn().mockResolvedValue({ message: 'لینک ارسال شد.' }),
}));

const baseUser = (overrides: Partial<User>): User => ({
  id: 'u-1',
  email: 'test@shopeek.ir',
  full_name: 'کاربر تست',
  role: 'User',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('RestrictionBanner', () => {
  const renderBanner = (user: User | null) =>
    render(
      <MemoryRouter>
        <ToastProvider>
          <RestrictionBanner user={user} />
        </ToastProvider>
      </MemoryRouter>
    );

  it('renders nothing for a null user', () => {
    renderBanner(null);
    expect(screen.queryByText(/فقط.*خواندنی/)).not.toBeInTheDocument();
  });

  it('renders nothing for a full-access user', () => {
    renderBanner(
      baseUser({ is_read_only: false, restriction_reasons: [] })
    );
    expect(screen.queryByText(/فقط.*خواندنی/)).not.toBeInTheDocument();
  });

  it('shows the email-unverified explanation with resend link', () => {
    renderBanner(
      baseUser({
        is_read_only: true,
        restriction_reasons: ['email_unverified'],
      })
    );

    expect(screen.getAllByText(/دسترسی/).length).toBeGreaterThan(0);
    expect(screen.getByText(/فقط.*خواندنی/)).toBeInTheDocument();
    expect(screen.getByText(/ایمیل حساب شما تأیید نشده است/)).toBeInTheDocument();
    expect(screen.getByText(/پس از تأیید ایمیل/)).toBeInTheDocument();
    expect(screen.getByText(/ارسال مجدد لینک تأیید ایمیل/)).toBeInTheDocument();
  });

  it('shows the subscription-expired explanation and contact support', () => {
    renderBanner(
      baseUser({
        is_read_only: true,
        restriction_reasons: ['subscription_expired'],
      })
    );

    expect(screen.getByText(/اشتراک حساب کاربری شما به پایان رسیده است/)).toBeInTheDocument();
    expect(screen.getByText(/امکان ثبت تراکنش، ایجاد مشتری/)).toBeInTheDocument();
    expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
  });
});