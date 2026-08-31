import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JalaliDateRangeModal } from '../JalaliDateRangeModal';

describe('JalaliDateRangeModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <JalaliDateRangeModal
        isOpen={false}
        onClose={vi.fn()}
        startDate="2026-08-25"
        endDate="2026-08-31"
        onApply={vi.fn()}
      />
    );
    expect(screen.queryByText('انتخاب بازه زمانی (شمسی)')).not.toBeInTheDocument();
  });

  it('renders correctly and allows preset selection and apply', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <JalaliDateRangeModal
        isOpen={true}
        onClose={handleClose}
        startDate="2026-08-25"
        endDate="2026-08-31"
        onApply={handleApply}
      />
    );

    expect(screen.getByText('انتخاب بازه زمانی (شمسی)')).toBeInTheDocument();
    expect(screen.getByText('۷ روز اخیر')).toBeInTheDocument();
    expect(screen.getByText('۱۴ روز اخیر')).toBeInTheDocument();
    expect(screen.getByText('۳۰ روز اخیر')).toBeInTheDocument();

    // Click 14-day preset
    fireEvent.click(screen.getByText('۱۴ روز اخیر'));

    // Apply button
    const applyBtn = screen.getByText('تأیید و اعمال بازه');
    expect(applyBtn).toBeEnabled();
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('discards changes when discard button is clicked', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <JalaliDateRangeModal
        isOpen={true}
        onClose={handleClose}
        startDate="2026-08-25"
        endDate="2026-08-31"
        onApply={handleApply}
      />
    );

    // Click 30-day preset
    fireEvent.click(screen.getByText('۳۰ روز اخیر'));

    // Click discard
    const discardBtn = screen.getByText('انصراف');
    fireEvent.click(discardBtn);

    expect(handleApply).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('allows month navigation back and forward (intermonth navigation)', () => {
    render(
      <JalaliDateRangeModal
        isOpen={true}
        onClose={vi.fn()}
        startDate="2026-08-25"
        endDate="2026-08-31"
        onApply={vi.fn()}
      />
    );

    // Initial month should be Shahrivar
    expect(screen.getAllByText(/شهریور/i).length).toBeGreaterThan(0);

    // Click previous month
    const prevBtn = screen.getByTitle('ماه قبل');
    fireEvent.click(prevBtn);
    expect(screen.getByText(/مرداد/i)).toBeInTheDocument();

    // Click next month
    const nextBtn = screen.getByTitle('ماه بعد');
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/شهریور/i).length).toBeGreaterThan(0);
  });
});

