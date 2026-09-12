import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScheduleSettingsCard } from '../ScheduleSettingsCard';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';
import type { SchedulePrefs } from '../../../types';

vi.mock('../../../services/api', () => ({
  fetchSchedulePrefs: vi.fn(),
  updateSchedulePrefs: vi.fn(),
}));

const mockPrefs: SchedulePrefs = {
  predefined_slots: ['09:00', '14:00'],
  can_customize: true,
  max_slots: 3,
  advisory_slots: ['09:00'],
  forecast_slots: ['14:00'],
};

const renderCard = () => {
  return render(
    <ToastProvider>
      <ScheduleSettingsCard />
    </ToastProvider>
  );
};

const getTimeInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];

describe('ScheduleSettingsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchSchedulePrefs as any).mockResolvedValue(mockPrefs);
  });

  it('shows a loading message while fetching prefs', () => {
    (api.fetchSchedulePrefs as any).mockReturnValue(new Promise(() => {}));
    renderCard();

    expect(screen.getByText('در حال دریافت زمان‌بندی...')).toBeInTheDocument();
  });

  it('renders both schedule sections with predefined slots', async () => {
    renderCard();

    await waitFor(() => {
      expect(screen.getByText('زمان‌بندی مشاوره')).toBeInTheDocument();
    });
    expect(screen.getByText('زمان‌بندی پیش‌بینی')).toBeInTheDocument();
    expect(screen.getAllByText('09:00')).toHaveLength(2);
    expect(screen.getAllByText('14:00')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'ذخیره زمان‌بندی' })).toHaveLength(2);
  });

  it('shows the disabled message when prefs are forbidden', async () => {
    (api.fetchSchedulePrefs as any).mockRejectedValue({ status: 403, message: 'طرح شما اجازه نمی‌دهد.' });

    renderCard();

    await waitFor(() => {
      expect(screen.getByText('طرح شما اجازه نمی‌دهد.')).toBeInTheDocument();
    });
    expect(screen.queryByText('زمان‌بندی مشاوره')).not.toBeInTheDocument();
  });

  it('shows a load error when fetching fails', async () => {
    (api.fetchSchedulePrefs as any).mockRejectedValue(new Error('خطا در دریافت زمان‌بندی هوشمند'));

    renderCard();

    await waitFor(() => {
      expect(screen.getByText('خطا در دریافت زمان‌بندی هوشمند')).toBeInTheDocument();
    });
  });

  it('toggles a predefined slot on and off', async () => {
    renderCard();

    await waitFor(() => {
      expect(screen.getAllByText('14:00')).toHaveLength(2);
    });

    const forecastOffBtn = screen.getAllByText('14:00')[1];
    fireEvent.click(forecastOffBtn);

    const forecastOnBtn = screen.getAllByText('14:00')[1];
    fireEvent.click(forecastOnBtn);
  });

  it('adds a custom slot and removes it', async () => {
    const { container } = renderCard();

    await waitFor(() => {
      expect(screen.getAllByText('09:00')).toHaveLength(2);
    });

    const timeInputs = getTimeInputs(container);
    fireEvent.change(timeInputs[0], { target: { value: '10:30' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'افزودن زمان دلخواه' })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText('حذف زمان 10:30')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('حذف زمان 10:30'));
    await waitFor(() => {
      expect(screen.queryByLabelText('حذف زمان 10:30')).not.toBeInTheDocument();
    });
  });

  it('rejects an invalid custom time format', async () => {
    const { container } = renderCard();

    await waitFor(() => {
      expect(screen.getAllByText('09:00')).toHaveLength(2);
    });

    const timeInputs = getTimeInputs(container);
    fireEvent.change(timeInputs[0], { target: { value: '09:00:00' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'افزودن زمان دلخواه' })[0]);

    expect(screen.getByText('زمان باید با فرمت HH:MM وارد شود.')).toBeInTheDocument();
  });

  it('rejects a duplicate custom time', async () => {
    const { container } = renderCard();

    await waitFor(() => {
      expect(screen.getAllByText('09:00')).toHaveLength(2);
    });

    const timeInputs = getTimeInputs(container);
    fireEvent.change(timeInputs[0], { target: { value: '09:00' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'افزودن زمان دلخواه' })[0]);

    expect(screen.getByText('این زمان قبلاً انتخاب شده است.')).toBeInTheDocument();
  });

  it('shows the cap message and disables the custom input at max slots', async () => {
    (api.fetchSchedulePrefs as any).mockResolvedValue({
      ...mockPrefs,
      max_slots: 1,
      advisory_slots: ['09:00'],
      forecast_slots: ['09:00'],
    });

    const { container } = renderCard();

    await waitFor(() => {
      expect(screen.getAllByText('حداکثر ۱ زمان قابل انتخاب است.')).toHaveLength(2);
    });

    const timeInputs = getTimeInputs(container);
    expect(timeInputs[0]).toBeDisabled();
  });

  it('hides the custom input when customization is not allowed', async () => {
    (api.fetchSchedulePrefs as any).mockResolvedValue({ ...mockPrefs, can_customize: false });

    renderCard();

    await waitFor(() => {
      expect(screen.getByText('زمان‌بندی مشاوره')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'افزودن زمان دلخواه' })).not.toBeInTheDocument();
  });

  it('saves the advisory schedule and shows a success toast', async () => {
    (api.updateSchedulePrefs as any).mockResolvedValue(mockPrefs);

    renderCard();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'ذخیره زمان‌بندی' })).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'ذخیره زمان‌بندی' })[0]);

    await waitFor(() => {
      expect(api.updateSchedulePrefs).toHaveBeenCalledWith({ advisory_slots: ['09:00'] });
    });
    expect(screen.getByText('زمان‌بندی با موفقیت ذخیره شد.')).toBeInTheDocument();
  });

  it('shows an error toast when saving fails', async () => {
    (api.updateSchedulePrefs as any).mockRejectedValue(new Error('خطا در ذخیره زمان‌بندی'));

    renderCard();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'ذخیره زمان‌بندی' })).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'ذخیره زمان‌بندی' })[1]);

    await waitFor(() => {
      expect(screen.getByText('خطا در ذخیره زمان‌بندی')).toBeInTheDocument();
    });
  });
});