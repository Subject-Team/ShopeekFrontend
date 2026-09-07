import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessProfileBanner, isProfileCompleted } from '../BusinessProfileBanner';
import type { BusinessProfile } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const incompleteProfile: BusinessProfile = {
  id: 'bp-1',
  category: null,
  category_other: null,
  monthly_orders: null,
  monthly_revenue: null,
  business_type: null,
  is_b2b: false,
  links: [],
  is_completed: false,
};

const completeProfile: BusinessProfile = {
  id: 'bp-2',
  category: 'apparel',
  category_other: null,
  monthly_orders: 80,
  monthly_revenue: 25000000,
  business_type: 'goods',
  is_b2b: false,
  links: [],
  is_completed: true,
};

describe('BusinessProfileBanner Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('correctly calculates isProfileCompleted', () => {
    expect(isProfileCompleted(null)).toBe(false);
    expect(isProfileCompleted(incompleteProfile)).toBe(false);

    // Incomplete if category is other without custom text
    expect(
      isProfileCompleted({
        ...completeProfile,
        category: 'other',
        category_other: '',
      })
    ).toBe(false);

    // Complete when category is other with custom text
    expect(
      isProfileCompleted({
        ...completeProfile,
        category: 'other',
        category_other: 'صنایع سفارشی',
      })
    ).toBe(true);

    // Complete profile
    expect(isProfileCompleted(completeProfile)).toBe(true);
  });

  it('renders reminder banner when profile is incomplete and not dismissed', () => {
    render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={incompleteProfile} />
      </MemoryRouter>
    );

    expect(screen.getByText('تکمیل اطلاعات تکمیلی کسب‌وکار')).toBeInTheDocument();
    expect(screen.getByText('تکمیل فرم اطلاعات')).toBeInTheDocument();
    expect(screen.getByText('بعداً یادآوری کن')).toBeInTheDocument();
  });

  it('does NOT render when profile is fully completed', () => {
    const { container } = render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={completeProfile} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('hides when user clicks dismiss and records timestamp in localStorage', () => {
    const { container } = render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={incompleteProfile} />
      </MemoryRouter>
    );

    expect(screen.getByText('تکمیل اطلاعات تکمیلی کسب‌وکار')).toBeInTheDocument();

    const dismissBtn = screen.getByText('بعداً یادآوری کن');
    fireEvent.click(dismissBtn);

    expect(container.firstChild).toBeNull();
    const stored = localStorage.getItem('shopeek_dismiss_business_profile_banner_time');
    expect(stored).toBeTruthy();
    expect(Number(stored)).toBeGreaterThan(0);
  });

  it('does NOT render if dismissed within the 7-day cooldown', () => {
    // 3 days ago
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem('shopeek_dismiss_business_profile_banner_time', String(threeDaysAgo));

    const { container } = render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={incompleteProfile} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('reappears if 7 days have passed since dismissal', () => {
    // 8 days ago
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem('shopeek_dismiss_business_profile_banner_time', String(eightDaysAgo));

    render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={incompleteProfile} />
      </MemoryRouter>
    );

    expect(screen.getByText('تکمیل اطلاعات تکمیلی کسب‌وکار')).toBeInTheDocument();
    // Cooldown flag should be cleaned up
    expect(localStorage.getItem('shopeek_dismiss_business_profile_banner_time')).toBeNull();
  });

  it('restores immediately when user edits form to incomplete state and dispatches event', () => {
    // Initially complete -> banner not shown
    render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={completeProfile} />
      </MemoryRouter>
    );

    expect(screen.queryByText('تکمیل اطلاعات تکمیلی کسب‌وکار')).toBeNull();

    // User edits form leaving it incomplete -> dispatches shopeek_business_profile_updated event
    act(() => {
      window.dispatchEvent(
        new CustomEvent('shopeek_business_profile_updated', {
          detail: incompleteProfile,
        })
      );
    });

    // Banner is restored!
    expect(screen.getByText('تکمیل اطلاعات تکمیلی کسب‌وکار')).toBeInTheDocument();
  });

  it('navigates to settings page with tab=business_profile when clicking CTA', () => {
    render(
      <MemoryRouter>
        <BusinessProfileBanner businessProfile={incompleteProfile} />
      </MemoryRouter>
    );

    const ctaBtn = screen.getByText('تکمیل فرم اطلاعات');
    fireEvent.click(ctaBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/settings?tab=business_profile');
  });
});
