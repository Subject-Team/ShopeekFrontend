// @test-type component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JalaliCalendar } from '../JalaliCalendar';

describe('[component] JalaliCalendar', () => {
  it('renders Persian weekday headers', () => {
    render(
      <JalaliCalendar
        viewYear={1405}
        viewMonth={6}
        renderDay={(day, iso) => <div key={iso}>{day}</div>}
      />
    );

    expect(screen.getByText('ش')).toBeInTheDocument();
    expect(screen.getByText('ج')).toBeInTheDocument();
  });

  it('renders exactly 42 day cells (fixed 6 rows) with correct current vs adjacent month flags', () => {
    const renderedCells: Array<{ day: number; iso: string; isCurrentMonth: boolean }> = [];

    render(
      <JalaliCalendar
        viewYear={1405}
        viewMonth={6}
        renderDay={(day, iso, isCurrentMonth) => {
          renderedCells.push({ day, iso, isCurrentMonth });
          return (
            <div key={iso} data-current={isCurrentMonth}>
              {day}
            </div>
          );
        }}
      />
    );

    // Total cells must be 42
    expect(renderedCells.length).toBe(42);

    // Shahrivar has 31 days
    const currentMonthCells = renderedCells.filter((c) => c.isCurrentMonth);
    expect(currentMonthCells.length).toBe(31);
    expect(currentMonthCells[0].day).toBe(1);
    expect(currentMonthCells[30].day).toBe(31);

    // Leading and trailing cells must be marked as not current month
    const adjacentMonthCells = renderedCells.filter((c) => !c.isCurrentMonth);
    expect(adjacentMonthCells.length).toBe(11);
  });
});
