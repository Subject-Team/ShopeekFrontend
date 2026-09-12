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

  it('opens the category dropdown, searches and selects a category', () => {
    renderForm({ initialProfile: null });

    const dropdownBtn = screen.getByRole('button', { name: /انتخاب حوزه کاری کسب‌وکار/ });
    fireEvent.click(dropdownBtn);

    const searchInput = screen.getByPlaceholderText(/جستجو در ۳۰ حوزه کاری/);
    fireEvent.change(searchInput, { target: { value: 'کتاب' } });

    fireEvent.click(screen.getByRole('button', { name: 'کتاب، نوشت‌افزار و محصولات فرهنگی' }));

    expect(screen.getByRole('button', { name: /کتاب، نوشت‌افزار و محصولات فرهنگی/ })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/جستجو در ۳۰ حوزه کاری/)).not.toBeInTheDocument();
  });

  it('shows a no-results message when the category search matches nothing', () => {
    renderForm({ initialProfile: null });

    fireEvent.click(screen.getByRole('button', { name: /انتخاب حوزه کاری کسب‌وکار/ }));
    fireEvent.change(screen.getByPlaceholderText(/جستجو در ۳۰ حوزه کاری/), { target: { value: 'zzzz' } });

    expect(screen.getByText('موردی یافت نشد')).toBeInTheDocument();
  });

  it('closes the category dropdown on outside click', () => {
    renderForm({ initialProfile: null });

    fireEvent.click(screen.getByRole('button', { name: /انتخاب حوزه کاری کسب‌وکار/ }));
    expect(screen.getByPlaceholderText(/جستجو در ۳۰ حوزه کاری/)).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByPlaceholderText(/جستجو در ۳۰ حوزه کاری/)).not.toBeInTheDocument();
  });

  it('shows the custom category input when "other" is selected', () => {
    renderForm({ initialProfile: null });

    fireEvent.click(screen.getByRole('button', { name: /انتخاب حوزه کاری کسب‌وکار/ }));
    fireEvent.click(screen.getByRole('button', { name: /سایر/ }));

    const customInput = screen.getByPlaceholderText('مثال: تولید قطعات صنعتی سفارشی');
    fireEvent.change(customInput, { target: { value: 'تولید قطعات صنعتی' } });
    expect(customInput).toHaveValue('تولید قطعات صنعتی');
  });

  it('updates the monthly revenue and shows the Toman conversion', () => {
    renderForm();

    const revenueInput = screen.getByDisplayValue('15');
    fireEvent.change(revenueInput, { target: { value: '20' } });

    expect(screen.getByText('۲۰٬۰۰۰٬۰۰۰ تومان در ماه')).toBeInTheDocument();
  });

  it('switches business type to goods', () => {
    renderForm();

    const goodsBtn = screen.getByRole('button', { name: /فروش کالا/ });
    fireEvent.click(goodsBtn);

    expect(goodsBtn.className).toContain('border-indigo-600');
  });

  it('toggles the B2B checkbox', () => {
    renderForm();

    const b2bCheckbox = screen.getByRole('checkbox', { name: /فروش سازمانی/ });
    expect(b2bCheckbox).not.toBeChecked();

    fireEvent.click(b2bCheckbox);
    expect(b2bCheckbox).toBeChecked();
  });

  it('changes a link type and url', () => {
    renderForm();

    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'telegram' } });

    const urlInput = screen.getByDisplayValue('https://instagram.com/myshop');
    fireEvent.change(urlInput, { target: { value: '@myshop' } });

    expect(urlInput).toHaveValue('@myshop');
  });

  it('removes a link via the mobile remove button', async () => {
    renderForm();

    const deleteButtons = screen.getAllByLabelText('حذف لینک');
    const initialCount = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryAllByLabelText('حذف لینک').length).toBeLessThan(initialCount);
    });
  });

  it('shows an error toast when saving fails', async () => {
    (api.updateBusinessProfile as any).mockRejectedValue(new Error('خطا در ذخیره اطلاعات تکمیلی'));

    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /ذخیره اطلاعات تکمیلی/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('خطا در ذخیره اطلاعات تکمیلی')).toBeInTheDocument();
    });
  });

  it('clears the banner dismissal when the saved profile is incomplete', async () => {
    (api.updateBusinessProfile as any).mockResolvedValue({ ...mockProfile, is_completed: false });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    renderForm();
    fireEvent.submit(screen.getByRole('button', { name: /ذخیره اطلاعات تکمیلی/i }).closest('form')!);

    await waitFor(() => {
      expect(api.updateBusinessProfile).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith('shopeek_dismiss_business_profile_banner_time');
    });
  });
});
