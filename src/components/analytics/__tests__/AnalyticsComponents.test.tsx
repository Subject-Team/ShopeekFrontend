// @test-type component
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsHeroChart } from '../AnalyticsHeroChart';
import { DayOfWeekCard } from '../DayOfWeekCard';
import { CustomerRetentionCard } from '../CustomerRetentionCard';
import { TopProductsCard } from '../TopProductsCard';
import { DayOfWeekDistribution, CustomerTypeMetrics, TopProductBreakdown, TrendMetricPoint } from '../../../types';

const MOCK_TREND: TrendMetricPoint[] = [
  {
    date: '2026-10-01',
    revenue: 1000000,
    orders: 2,
    aov: 500000,
    unique_customers: 2,
    prev_date: '2026-09-01',
    prev_revenue: 800000,
    prev_orders: 2,
    prev_aov: 400000,
    prev_unique_customers: 2,
    forecast_revenue: null,
  },
  {
    date: '2026-10-02',
    revenue: 2000000,
    orders: 4,
    aov: 500000,
    unique_customers: 3,
    prev_date: '2026-09-02',
    prev_revenue: 1500000,
    prev_orders: 3,
    prev_aov: 500000,
    prev_unique_customers: 3,
    forecast_revenue: null,
  },
];

const MOCK_DOW: DayOfWeekDistribution[] = [
  { day_index: 0, day_name: 'شنبه', revenue: 1000000, orders: 2, revenue_percentage: 20.0 },
  { day_index: 1, day_name: 'یکشنبه', revenue: 500000, orders: 1, revenue_percentage: 10.0 },
  { day_index: 2, day_name: 'دوشنبه', revenue: 2500000, orders: 5, revenue_percentage: 50.0 },
  { day_index: 3, day_name: 'سه‌شنبه', revenue: 0, orders: 0, revenue_percentage: 0 },
  { day_index: 4, day_name: 'چهارشنبه', revenue: 1000000, orders: 2, revenue_percentage: 20.0 },
  { day_index: 5, day_name: 'پنج‌شنبه', revenue: 0, orders: 0, revenue_percentage: 0 },
  { day_index: 6, day_name: 'جمعه', revenue: 0, orders: 0, revenue_percentage: 0 },
];

const MOCK_CUSTOMER: CustomerTypeMetrics = {
  new_customers_revenue: 1500000,
  new_customers_orders: 3,
  returning_customers_revenue: 3500000,
  returning_customers_orders: 7,
  new_customers_share: 30.0,
  returning_customers_share: 70.0,
};

const MOCK_PRODUCTS: TopProductBreakdown[] = [
  { name: 'شلوار جین تیره', revenue: 3000000, units: 6, share_percentage: 60.0 },
  { name: 'تی‌شرت لانگ', revenue: 2000000, units: 5, share_percentage: 40.0 },
];

describe('[component] AnalyticsComponents', () => {
  describe('AnalyticsHeroChart', () => {
    it('renders all metric selection tabs and switches active metric', () => {
      render(<AnalyticsHeroChart data={MOCK_TREND} />);

      expect(screen.getByRole('tab', { name: /درآمد کل/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /سفارشات/ })).toHaveAttribute('aria-selected', 'false');

      fireEvent.click(screen.getByRole('tab', { name: /سفارشات/ }));
      expect(screen.getByRole('tab', { name: /سفارشات/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /درآمد کل/ })).toHaveAttribute('aria-selected', 'false');
    });

    it('toggles period-over-period comparison', () => {
      render(<AnalyticsHeroChart data={MOCK_TREND} />);

      const compareBtn = screen.getByText('مقایسه دوره قبل');
      expect(screen.getByText('دوره متناظر قبل')).toBeInTheDocument();

      fireEvent.click(compareBtn);
      expect(screen.queryByText('دوره متناظر قبل')).not.toBeInTheDocument();
    });

    it('renders empty message when data is zero', () => {
      render(<AnalyticsHeroChart data={[]} />);
      expect(screen.getByText('داده‌ای در این بازه زمانی ثبت نشده است')).toBeInTheDocument();
    });
  });

  describe('DayOfWeekCard', () => {
    it('renders days of week and highlights peak day', () => {
      render(<DayOfWeekCard data={MOCK_DOW} />);

      expect(screen.getByText('روزهای پیک فروش')).toBeInTheDocument();
      expect(screen.getByText('پیک: دوشنبه')).toBeInTheDocument();
      expect(screen.getByText('شنبه')).toBeInTheDocument();
      expect(screen.getByText('جمعه')).toBeInTheDocument();
    });

    it('renders fallback when week revenue is 0', () => {
      render(<DayOfWeekCard data={[]} />);
      expect(screen.getByText('داده‌ای برای تفکیک روزهای هفته ثبت نشده است.')).toBeInTheDocument();
    });
  });

  describe('CustomerRetentionCard', () => {
    it('renders new and returning customer shares and details', () => {
      render(<CustomerRetentionCard data={MOCK_CUSTOMER} />);

      expect(screen.getByText('مشتریان جدید و وفادار')).toBeInTheDocument();
      expect(screen.getByText(/مشتریان وفادار \(۷۰٪\)/)).toBeInTheDocument();
      expect(screen.getByText(/خریداران جدید \(۳۰٪\)/)).toBeInTheDocument();
      expect(screen.getByText('۳٫۵م')).toBeInTheDocument();
      expect(screen.getByText('۱٫۵م')).toBeInTheDocument();
    });

    it('renders empty message when no customer data', () => {
      const emptyCust: CustomerTypeMetrics = {
        new_customers_revenue: 0,
        new_customers_orders: 0,
        returning_customers_revenue: 0,
        returning_customers_orders: 0,
        new_customers_share: 0,
        returning_customers_share: 0,
      };
      render(<CustomerRetentionCard data={emptyCust} />);
      expect(screen.getByText('داده‌ای برای تفکیک مشتریان ثبت نشده است.')).toBeInTheDocument();
    });
  });

  describe('TopProductsCard', () => {
    it('renders top products ranked with units and share percentage', () => {
      render(<TopProductsCard products={MOCK_PRODUCTS} />);

      expect(screen.getByText('محصولات پرفروش')).toBeInTheDocument();
      expect(screen.getByText('شلوار جین تیره')).toBeInTheDocument();
      expect(screen.getByText('۶ عدد فروخته شده')).toBeInTheDocument();
      expect(screen.getByText('تی‌شرت لانگ')).toBeInTheDocument();
      expect(screen.getByText('۵ عدد فروخته شده')).toBeInTheDocument();
    });

    it('renders empty explanation when no products exist', () => {
      render(<TopProductsCard products={[]} />);
      expect(screen.getByText('اطلاعات کالایی در فاکتورها ثبت نشده است.')).toBeInTheDocument();
    });
  });
});
