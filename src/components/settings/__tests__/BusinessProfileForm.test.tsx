import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BusinessProfileForm } from '../BusinessProfileForm';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';
import type { BusinessProfile } from '../../../types';

vi.mock('../../../services/api', () => ({
  updateBusinessProfile: vi.fn(),
}));

const mockProfile: BusinessProfile = {
  id: 'bp-1',
  category: 'apparel',
  category_other: null,
  monthly_orders: 45,
  monthly_revenue: 15_000_000,
  business_type: 'goods',
  is_b2b: false,
  links: [{ type: 'instagram', url: 'https://instagram.com/myshop' }],
  is_completed: true,
};

describe('BusinessProfileForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props?: { initialProfile?: BusinessProfile | null; readOnly?: boolean; onSaved?: (p: BusinessProfile) => void }) => {
    return render(
      <ToastProvider>
        <BusinessProfileForm
          initialProfile={props?.initialProfile !== undefined ? props.initialProfile : mockProfile}
          readOnly={props?.readOnly ?? false}
          onSaved={props?.onSaved}
        />
      </ToastProvider>
    );
  };

  it('renders initial profile fields correctly', () => {
    renderForm();

    expect(screen.getByText('دسته‌بندی و حوزه کاری کسب‌وکار')).toBeInTheDocument();
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // 15 million tomaans
    expect(screen.getByText('فروش کالا')).toBeInTheDocument();
    expect(screen.getByText('(فیزیکی یا دیجیتال)')).toBeInTheDocument();
    expect(screen.getByText('ارائه خدمات')).toBeInTheDocument();
    expect(screen.getByText('(خدماتی و مشاوره)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://instagram.com/myshop')).toBeInTheDocument();
  });

  it('allows adding and removing link items', async () => {
    renderForm();

    const addLinkBtn = screen.getByText('افزودن لینک جدید');
    fireEvent.click(addLinkBtn);

    const inputs = screen.getAllByRole('textbox');
    // First link input + newly added link input
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    // Remove the newly added link via trash button
    const deleteButtons = screen.getAllByLabelText('حذف لینک');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      const remainingInputs = screen.getAllByRole('textbox');
      expect(remainingInputs.length).toBeLessThan(inputs.length);
    });
  });

  it('allows switching business type between goods and services', () => {
    renderForm();

    const servicesBtn = screen.getByRole('button', { name: /ارائه خدمات/i });
    fireEvent.click(servicesBtn);

    expect(servicesBtn.className).toContain('border-indigo-600');
  });

  it('submits form data correctly and calls onSaved', async () => {
    const onSavedMock = vi.fn();
    const updatedProfile: BusinessProfile = {
      ...mockProfile,
      monthly_orders: 80,
      monthly_revenue: 20_000_000,
    };
    (api.updateBusinessProfile as any).mockResolvedValue(updatedProfile);

    renderForm({ onSaved: onSavedMock });

    // Change monthly orders
    const ordersInput = screen.getByDisplayValue('45');
    fireEvent.change(ordersInput, { target: { value: '80' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /ذخیره اطلاعات تکمیلی/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.updateBusinessProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          monthly_orders: 80,
        })
      );
      expect(onSavedMock).toHaveBeenCalledWith(updatedProfile);
    });
  });

  it('disables interactions when in read-only mode', () => {
    renderForm({ readOnly: true });

    const submitBtn = screen.getByRole('button', { name: /ذخیره اطلاعات تکمیلی/i });
    expect(submitBtn).toBeDisabled();

    const ordersInput = screen.getByDisplayValue('45');
    expect(ordersInput).toBeDisabled();
  });
});
