import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCampaignModal } from '../CreateCampaignModal';
import { CampaignListCard } from '../CampaignListCard';
import { ActiveCampaignCard } from '../../dashboard/ActiveCampaignCard';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', async () => {
  const actual = await vi.importActual('../../../services/api');
  return {
    ...actual,
    fetchCampaignsOverview: vi.fn(),
    createCampaign: vi.fn(),
    deleteCampaign: vi.fn(),
  };
});

const renderWithToast = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('[component] Campaign Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CreateCampaignModal', () => {
    it('renders with descriptive duration hints in parentheses starting with "رایج برای ..."', () => {
      renderWithToast(
        <CreateCampaignModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} />
      );

      expect(screen.getByText(/ثبت کمپین و هزینه تبلیغات/)).toBeInTheDocument();
      expect(
        screen.getByText(/۲۴ ساعت \(رایج برای استوری روزمره، تخفیف ۲۴ ساعته و فلش‌سیل\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/۴۸ ساعت \(رایج برای استوری اینفلوئنسرها و تبلیغات پیج‌های بزرگ\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/۷۲ ساعت \(رایج برای ریلز، پست اختصاصی و همکاری مشترک\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/۷ روز \(رایج برای جشنواره‌های فروش، بلک‌فرایدی، یلدا و عیدانه\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/بازه دلخواه \(تعیین دستی ساعت و تاریخ پایان\)/)
      ).toBeInTheDocument();
    });

    it('submits campaign creation payload on valid input', async () => {
      const onCreated = vi.fn();
      const onClose = vi.fn();
      vi.mocked(api.createCampaign).mockResolvedValueOnce({
        id: 'camp-123',
        user_id: 'u1',
        title: 'استوری صدف',
        cost: 5000000,
        currency: 'IRR',
        channel: 'Instagram',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 48 * 3600000).toISOString(),
        created_at: new Date().toISOString(),
        metrics: {
          total_sales: 0,
          baseline_sales: 0,
          lift_sales: 0,
          roas: 0,
          new_customers_count: 0,
          cac: 0,
          is_active: true,
          performance_status: 'monitoring',
        },
      });

      renderWithToast(
        <CreateCampaignModal isOpen={true} onClose={onClose} onCreated={onCreated} />
      );

      const titleInput = screen.getByPlaceholderText(/استوری پیج صدف/);
      await userEvent.type(titleInput, 'استوری صدف');

      const costInput = screen.getByPlaceholderText(/۵,۰۰۰,۰۰۰/);
      await userEvent.type(costInput, '5000000');

      const submitBtn = screen.getByRole('button', { name: /ثبت و شروع پایش تبلیغ/ });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.createCampaign).toHaveBeenCalledTimes(1);
        expect(onCreated).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('CampaignListCard', () => {
    it('renders empty state when no campaigns exist', async () => {
      vi.mocked(api.fetchCampaignsOverview).mockResolvedValueOnce({
        campaigns: [],
        active_campaign: null,
        summary: {
          total_cost: 0,
          total_lift: 0,
          avg_roas: 0,
          total_new_customers: 0,
          active_campaigns_count: 0,
        },
      });

      renderWithToast(<CampaignListCard />);

      await waitFor(() => {
        expect(screen.getByText('هنوز تبلیغی ثبت نکرده‌اید')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /\+ ثبت اولین تبلیغ/ })).toBeInTheDocument();
    });

    it('renders campaign items and summary when campaigns exist', async () => {
      vi.mocked(api.fetchCampaignsOverview).mockResolvedValueOnce({
        campaigns: [
          {
            id: 'camp-1',
            user_id: 'u1',
            title: 'استوری بلاگر شیما',
            cost: 2000000,
            currency: 'IRR',
            channel: 'Instagram',
            start_date: '2026-10-10T10:00:00Z',
            end_date: '2026-10-12T10:00:00Z',
            created_at: '2026-10-10T09:00:00Z',
            metrics: {
              total_sales: 8000000,
              baseline_sales: 2000000,
              lift_sales: 6000000,
              roas: 3.0,
              new_customers_count: 10,
              cac: 200000,
              is_active: false,
              performance_status: 'excellent',
            },
          },
        ],
        active_campaign: null,
        summary: {
          total_cost: 2000000,
          total_lift: 6000000,
          avg_roas: 3.0,
          total_new_customers: 10,
          active_campaigns_count: 0,
        },
      });

      renderWithToast(<CampaignListCard />);

      await waitFor(() => {
        expect(screen.getByText('استوری بلاگر شیما')).toBeInTheDocument();
      });

      expect(screen.getByText(/بسیار موفق \(عالی\)/)).toBeInTheDocument();
      expect(screen.getByText(/۳[.,٫]۰۰ برابر/)).toBeInTheDocument();
      expect(screen.getByText(/۱۰ نفر/)).toBeInTheDocument();
    });
  });

  describe('ActiveCampaignCard', () => {
    it('renders active campaign details when an active campaign is running', async () => {
      vi.mocked(api.fetchCampaignsOverview).mockResolvedValueOnce({
        campaigns: [],
        active_campaign: {
          id: 'camp-active',
          user_id: 'u1',
          title: 'کمپین استوری مهسا',
          cost: 3000000,
          currency: 'IRR',
          channel: 'Instagram',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 24 * 3600000).toISOString(),
          created_at: new Date().toISOString(),
          metrics: {
            total_sales: 7000000,
            baseline_sales: 2000000,
            lift_sales: 5000000,
            roas: 1.67,
            new_customers_count: 6,
            cac: 500000,
            is_active: true,
            performance_status: 'monitoring',
          },
        },
        summary: {
          total_cost: 3000000,
          total_lift: 5000000,
          avg_roas: 1.67,
          total_new_customers: 6,
          active_campaigns_count: 1,
        },
      });

      renderWithToast(<ActiveCampaignCard />);

      await waitFor(() => {
        expect(screen.getByText('کمپین تبلیغاتی فعال')).toBeInTheDocument();
        expect(screen.getByText('کمپین استوری مهسا')).toBeInTheDocument();
      });

      expect(screen.getByText('پایش لحظه‌ای فروش در طول بازه کمپین فعال است')).toBeInTheDocument();
      expect(screen.getByText(/۱[.,٫]۶۷ برابر/)).toBeInTheDocument();
    });
  });
});
