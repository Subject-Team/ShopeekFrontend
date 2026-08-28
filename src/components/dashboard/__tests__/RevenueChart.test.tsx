import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevenueChart } from '../RevenueChart';
import { RevenuePoint } from '../../../types';

const DATA: RevenuePoint[] = [
  { date: '2026-08-01', revenue: 1500000, forecast_revenue: null },
  { date: '2026-08-02', revenue: 2300000, forecast_revenue: null },
  { date: '2026-08-03', revenue: null, forecast_revenue: 2600000 },
] as unknown as RevenuePoint[];

describe('RevenueChart Component', () => {
  it('renders the default title and legend entries', () => {
    render(<RevenueChart data={DATA} />);
    expect(screen.getByText('روند فروش و پیش‌بینی هوشمند')).toBeInTheDocument();
    expect(screen.getByText('واقعی')).toBeInTheDocument();
    expect(screen.getByText('پیش‌بینی')).toBeInTheDocument();
    expect(screen.getByText(/داده‌های واقعی به همراه خط‌چین پیش‌بینی/i)).toBeInTheDocument();
  });

  it('renders with a custom title', () => {
    render(<RevenueChart data={DATA} title="روند سفارشی" />);
    expect(screen.getByText('روند سفارشی')).toBeInTheDocument();
  });

  it('survives resize events and empty data without crashing', () => {
    const { unmount } = render(<RevenueChart data={[]} />);
    fireEvent.resize(window);
    unmount();

    const { unmount: unmount2 } = render(<RevenueChart data={DATA} />);
    fireEvent.resize(window);
    unmount2();
  });
});
