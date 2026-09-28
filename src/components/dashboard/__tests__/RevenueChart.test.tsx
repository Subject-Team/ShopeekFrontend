// @test-type component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevenueChart } from '../RevenueChart';
import { RevenuePoint } from '../../../types';

// jsdom gives ResponsiveContainer a zero-size box, so without this stub the
// chart subtree (axes, tick formatters, areas) never renders at all.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  const React = await import('react');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{ width?: number; height?: number }>,
            { width: 600, height: 300 }
          )
        : children,
  };
});

const DATA: RevenuePoint[] = [
  { date: '2026-08-01', revenue: 1500000, forecast_revenue: null },
  { date: '2026-08-02', revenue: 2300000, forecast_revenue: null },
  { date: '2026-08-03', revenue: null, forecast_revenue: 2600000 },
] as unknown as RevenuePoint[];

describe('[component] RevenueChart Component', () => {
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

  it('renders a friendly empty state instead of a bare axis for an empty data array', () => {
    const { container } = render(<RevenueChart data={[]} />);

    expect(screen.getByText('فروشی برای این بازه ثبت نشده است')).toBeInTheDocument();
    expect(
      screen.getByText(/اولین فاکتور خود را ثبت کنید تا نمودار فروش روزانه به صورت خودکار ساخته شود/)
    ).toBeInTheDocument();
    expect(container.querySelector('.recharts-surface')).toBeNull();
    expect(screen.queryByText('واقعی')).not.toBeInTheDocument();
  });

  it('renders the chart surface when data is present', () => {
    const { container } = render(<RevenueChart data={DATA} />);

    expect(container.querySelector('.recharts-surface')).not.toBeNull();
    expect(screen.queryByText('فروشی برای این بازه ثبت نشده است')).not.toBeInTheDocument();
  });

  it('renders the chart surface with axes and areas when the container has size', () => {
    const { container, unmount } = render(<RevenueChart data={DATA} />);
    expect(container.querySelector('.recharts-surface')).not.toBeNull();
    expect(container.querySelector('.recharts-xAxis')).not.toBeNull();
    expect(container.querySelector('.recharts-yAxis')).not.toBeNull();
    expect(container.querySelectorAll('.recharts-area').length).toBeGreaterThan(0);
    unmount();
  });

  it('hides the forecast area and legend entry when hideForecast is set', () => {
    const { container, unmount } = render(<RevenueChart data={DATA} hideForecast />);
    expect(screen.getByText('واقعی')).toBeInTheDocument();
    expect(screen.queryByText('پیش‌بینی')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-area').length).toBe(1);
    unmount();
  });

  it('keeps the real line painted above the forecast line across default/archive/default switches', () => {
    // Default range (contains today): history carries forecast values equal
    // to revenue plus one future forecast-only point.
    const DEFAULT_DATA: RevenuePoint[] = [
      { date: '2026-08-01', revenue: 1500000, forecast_revenue: 1500000 },
      { date: '2026-08-02', revenue: 2300000, forecast_revenue: 2300000 },
      { date: '2026-08-03', revenue: null, forecast_revenue: 2600000 },
    ] as unknown as RevenuePoint[];
    // Archive range (all in the past): no forecast fields at all.
    const ARCHIVE_DATA: RevenuePoint[] = [
      { date: '2026-07-01', revenue: 900000 },
      { date: '2026-07-02', revenue: 1100000 },
    ] as unknown as RevenuePoint[];

    // SVG paints in document order, so the forecast area must come first
    // for the real line to stay on top of it.
    const areaStrokes = (container: HTMLElement) =>
      Array.from(container.querySelectorAll('.recharts-area')).map(
        (g) => g.querySelector('path.recharts-area-curve')?.getAttribute('stroke')
      );

    // 1. Default range: both areas, forecast underneath the real line.
    const { container, rerender } = render(<RevenueChart data={DEFAULT_DATA} />);
    expect(areaStrokes(container)).toEqual(['#2579ef', '#00a388']);
    expect(screen.getByText('پیش‌بینی')).toBeInTheDocument();

    // 2. Archive range: forecast area and legend entry disappear entirely.
    rerender(<RevenueChart data={ARCHIVE_DATA} hideForecast />);
    expect(container.querySelectorAll('.recharts-area').length).toBe(1);
    expect(areaStrokes(container)).toEqual(['#00a388']);
    expect(screen.queryByText('پیش‌بینی')).not.toBeInTheDocument();

    // 3. Back to default: forecast returns, still underneath the real line.
    rerender(<RevenueChart data={DEFAULT_DATA} />);
    expect(areaStrokes(container)).toEqual(['#2579ef', '#00a388']);
    expect(screen.getByText('پیش‌بینی')).toBeInTheDocument();
  });
});
