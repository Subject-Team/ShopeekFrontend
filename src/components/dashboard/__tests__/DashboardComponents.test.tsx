import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdvisoryCard } from '../AdvisoryCard';
import { AdvisoryHistoryModal } from '../AdvisoryHistoryModal';
import { KpiCard } from '../KpiCard';
import { RevenueChart } from '../RevenueChart';
import { SubscriptionStatusCard } from '../SubscriptionStatusCard';
import { SubscriptionWarningBanner } from '../SubscriptionWarningBanner';
import { DollarSign } from 'lucide-react';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  triggerManualAdvisory: vi.fn(),
}));

describe('Dashboard Components', () => {
  it('renders KpiCard with title, value, and change percentage', () => {
    render(
      <KpiCard
        title="درآمد کل"
        value="۱۲,۰۰۰,۰۰۰ تومان"
        changePercentage={15.5}
        subtitle="نسبت به ماه قبل"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('درآمد کل')).toBeInTheDocument();
    expect(screen.getByText('۱۲,۰۰۰,۰۰۰ تومان')).toBeInTheDocument();
  });

  it('renders AdvisoryCard with recommendation, handles refresh and opens history modal', async () => {
    (api.triggerManualAdvisory as any).mockResolvedValue({
      status: 'success',
      advisory: {
        id: 'adv-new',
        summary: 'توصیه جدید تولید شد',
        recommendation_text: 'متن توصیه جدید',
        priority: 'HIGH',
        generated_at: new Date().toISOString(),
      },
    });

    const mockAdvisory = {
      id: 'adv-1',
      summary: 'رشد فروش عالی',
      recommendation_text: 'تخفیف فصلی در نظر بگیرید.',
      priority: 'HIGH',
      generated_at: '2026-03-21T10:00:00Z',
    };
    const mockHistory = [
      {
        id: 'adv-old-1',
        summary: 'توصیه روز گذشته',
        recommendation_text: 'تبلیغات اینستاگرام',
        priority: 'MEDIUM',
        generated_at: '2026-03-20T10:00:00Z',
      },
    ];

    render(
      <ToastProvider>
        <AdvisoryCard
          advisory={mockAdvisory as any}
          history={mockHistory as any}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/رشد فروش عالی/i)).toBeInTheDocument();
    expect(screen.getByText(/تخفیف فصلی در نظر بگیرید/i)).toBeInTheDocument();

    const refreshBtn = screen.getByText(/به‌روزرسانی دستی/i);
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(api.triggerManualAdvisory).toHaveBeenCalled();
    });

    const historyBtn = screen.getByText(/پیشنهادات قبلی/i);
    fireEvent.click(historyBtn);
    expect(screen.getByText(/توصیه روز گذشته/i)).toBeInTheDocument();
  });

  it('renders RevenueChart with trend data', () => {
    const mockData = [
      { date: '2026-03-20', revenue: 5000000, orders: 10, forecast_revenue: null },
      { date: '2026-03-21', revenue: 10000000, orders: 15, forecast_revenue: null },
    ];

    render(<RevenueChart data={mockData as any} title="روند فروش" />);
    expect(screen.getByText('روند فروش')).toBeInTheDocument();
  });

  it('renders AdvisoryHistoryModal with advisory items', () => {
    const advisories = [
      {
        id: 'adv-1',
        summary: 'توصیه روز گذشته',
        recommendation_text: 'تبلیغات اینستاگرام',
        priority: 'MEDIUM',
        generated_at: '2026-03-20T10:00:00Z',
      },
    ];
    const onClose = vi.fn();

    render(
      <AdvisoryHistoryModal
        isOpen={true}
        onClose={onClose}
        history={advisories as any}
      />
    );

    expect(screen.getByText(/پیشنهادات قبلی هوش مصنوعی/i)).toBeInTheDocument();
    expect(screen.getByText(/توصیه روز گذشته/i)).toBeInTheDocument();
  });

  it('renders SubscriptionStatusCard and SubscriptionWarningBanner', () => {
    const mockUser = {
      id: 'u-1',
      full_name: 'کاربر تستی',
      email: 'test@shopeek.ir',
      role: 'User',
      is_subscription_active: true,
      remaining_days: 5,
      is_infinite_subscription: false,
    };

    render(
      <MemoryRouter>
        <SubscriptionStatusCard user={mockUser as any} />
        <SubscriptionWarningBanner user={mockUser as any} />
      </MemoryRouter>
    );

    expect(screen.getByText(/وضعیت اشتراک حساب/i)).toBeInTheDocument();
    expect(screen.getByText(/هشدار تمدید اشتراک/i)).toBeInTheDocument();
  });
});
