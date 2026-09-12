import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RestrictionBanner } from '../RestrictionBanner';
import { User } from '../../../types';

const baseUser = (overrides: Partial<User>): User => ({
  id: 'u-1',
  email: 'test@shopeek.ir',
  full_name: 'کاربر تست',
  role: 'User',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('RestrictionBanner', () => {
  const renderBanner = (user: User | null, debt?: number) =>
    render(
      <MemoryRouter>
        <RestrictionBanner user={user} debt={debt} />
      </MemoryRouter>
    );

  it('renders nothing for a null user', () => {
    const { container } = renderBanner(null);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a full-access user', () => {
    const { container } = renderBanner(
      baseUser({ is_read_only: false, restriction_reasons: [] })
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the email-unverified explanation and resumption hint', () => {
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
    expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
  });

  it('shows the subscription-expired explanation and lists disabled capabilities', () => {
    renderBanner(
      baseUser({
        is_read_only: true,
        restriction_reasons: ['plan_expired'],
      })
    );

    expect(screen.getByText(/اشتراک\/طرح حساب شما منقضی شده است/)).toBeInTheDocument();
    expect(screen.getByText(/امکان ثبت تراکنش، ایجاد مشتری/)).toBeInTheDocument();
    expect(screen.getByText('تمدید از طریق صفحه اشتراک')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تمدید از طریق صفحه اشتراک' })).toHaveAttribute(
      'href',
      '/dashboard/subscription'
    );
    expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
  });

  it('renders a debt line with a settlement link when debt is positive', () => {
    renderBanner(
      baseUser({
        is_read_only: true,
        restriction_reasons: ['plan_expired'],
      }),
      50
    );

    expect(screen.getByText(/بدهی ۵۰ اعتبار/)).toBeInTheDocument();
    expect(screen.getByText(/تسویه برای ادامه استفاده الزامی است/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تسویه از طریق صفحه اشتراک' })).toHaveAttribute(
      'href',
      '/dashboard/subscription'
    );
  });

  it('omits the debt line when debt is zero or absent', () => {
    renderBanner(
      baseUser({
        is_read_only: true,
        restriction_reasons: ['plan_expired'],
      })
    );

    expect(screen.queryByText(/بدهی/)).not.toBeInTheDocument();
  });
});