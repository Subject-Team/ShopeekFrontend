import React from 'react';
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
  const renderBanner = (user: User | null) =>
    render(
      <MemoryRouter>
        <RestrictionBanner user={user} />
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
        restriction_reasons: ['subscription_expired'],
      })
    );

    expect(screen.getByText(/اشتراک حساب کاربری شما به پایان رسیده است/)).toBeInTheDocument();
    expect(screen.getByText(/امکان ثبت تراکنش، ایجاد مشتری/)).toBeInTheDocument();
    expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
  });
});