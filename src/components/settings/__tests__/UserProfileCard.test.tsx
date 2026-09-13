import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfileCard } from '../UserProfileCard';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';
import type { User } from '../../../types';

vi.mock('../../../services/api', () => ({
  updateUserProfile: vi.fn(),
  sendPhoneOtpApi: vi.fn(),
  verifyPhoneOtpApi: vi.fn(),
}));

const mockUser: User = {
  id: 'user-1',
  full_name: 'محمد رضایی',
  email: 'm.rezaei@shopeek.ir',
  phone: '09121234567',
  role: 'User',
  created_at: '2026-01-01T00:00:00Z',
  email_verified: true,
  phone_verified: true,
  is_subscription_active: true,
};

const renderCard = (profile = mockUser, readOnly = false, onUpdated = vi.fn()) => {
  return render(
    <ToastProvider>
      <UserProfileCard
        profile={profile}
        readOnly={readOnly}
        onProfileUpdated={onUpdated}
      />
    </ToastProvider>
  );
};

describe('UserProfileCard & ChangePhoneModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile card with name, email, verified phone, and guide target', () => {
    const { container } = renderCard();

    expect(container.querySelector('[data-guide="settings-profile"]')).toBeInTheDocument();
    expect(screen.getAllByText('محمد رضایی')[0]).toBeInTheDocument();
    expect(screen.getAllByText('m.rezaei@shopeek.ir')[0]).toBeInTheDocument();
    expect(screen.getByText('۰۹۱۲۱۲۳۴۵۶۷')).toBeInTheDocument();
    expect(screen.getAllByText('تأیید شده')).toHaveLength(2); // email & phone
  });

  it('updates full name and email successfully', async () => {
    const onUpdated = vi.fn();
    (api.updateUserProfile as any).mockResolvedValue({
      ...mockUser,
      full_name: 'محمد پارسا',
      email: 'parsa@shopeek.ir',
    });

    renderCard(mockUser, false, onUpdated);

    const nameInput = screen.getByLabelText('نام و نام خانوادگی');
    const emailInput = screen.getByLabelText('آدرس ایمیل');

    fireEvent.change(nameInput, { target: { value: 'محمد پارسا' } });
    fireEvent.change(emailInput, { target: { value: 'parsa@shopeek.ir' } });

    const saveButton = screen.getByRole('button', { name: 'ذخیره تغییرات مشخصات' });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateUserProfile).toHaveBeenCalledWith({
        full_name: 'محمد پارسا',
        email: 'parsa@shopeek.ir',
      });
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'محمد پارسا', email: 'parsa@shopeek.ir' })
      );
    });
  });

  it('prevents saving if full name is less than 2 characters', async () => {
    renderCard();

    const nameInput = screen.getByLabelText('نام و نام خانوادگی');
    fireEvent.change(nameInput, { target: { value: 'a' } });

    const saveButton = screen.getByRole('button', { name: 'ذخیره تغییرات مشخصات' });
    fireEvent.click(saveButton);

    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('disables actions and inputs when readOnly is true', () => {
    const { container } = renderCard(mockUser, true);

    expect(screen.getByText('دسترسی فقط‌خواندنی')).toBeInTheDocument();

    const inputs = Array.from(container.querySelectorAll('input'));
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    expect(screen.queryByRole('button', { name: 'ذخیره تغییرات مشخصات' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تغییر شماره' })).not.toBeInTheDocument();
  });

  it('opens change phone modal with trial subscription warning', () => {
    renderCard();

    const changePhoneBtn = screen.getByRole('button', { name: 'تغییر شماره' });
    fireEvent.click(changePhoneBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('توجه در خصوص دوره آزمایشی و اشتراک')).toBeInTheDocument();
    expect(
      screen.getByText(/تغییر شماره موبایل به هیچ عنوان باعث تمدید یا ریست شدن دوره آزمایشی \(Trial\) نخواهد شد/)
    ).toBeInTheDocument();
  });

  it('sends phone OTP and enforces countdown rate-limiting', async () => {
    (api.sendPhoneOtpApi as any).mockResolvedValue({
      sent: true,
      message: 'کد تأیید پیامک شد.',
    });

    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'تغییر شماره' }));

    const phoneInput = screen.getByPlaceholderText('09123456789');
    fireEvent.change(phoneInput, { target: { value: '09351234567' } });

    const sendBtn = screen.getByRole('button', { name: 'ارسال کد تأیید' });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(api.sendPhoneOtpApi).toHaveBeenCalledWith({ phone: '09351234567' });
      expect(screen.getByText('کد تأیید ۶ رقمی پیامک شده')).toBeInTheDocument();
    });

    // Verify rate-limiting timer is visible and active
    expect(screen.getByText(/ارسال مجدد کد \(/)).toBeInTheDocument();
  });

  it('verifies phone OTP and calls onSuccess callback', async () => {
    const onUpdated = vi.fn();
    (api.sendPhoneOtpApi as any).mockResolvedValue({
      sent: true,
      message: 'کد تأیید پیامک شد.',
    });
    (api.verifyPhoneOtpApi as any).mockResolvedValue({
      ...mockUser,
      phone: '09351234567',
      phone_verified: true,
    });

    renderCard(mockUser, false, onUpdated);

    fireEvent.click(screen.getByRole('button', { name: 'تغییر شماره' }));

    const phoneInput = screen.getByPlaceholderText('09123456789');
    fireEvent.change(phoneInput, { target: { value: '09351234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد تأیید' }));

    await waitFor(() => {
      expect(screen.getByLabelText('کد تأیید ۶ رقمی پیامک شده')).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText('کد تأیید ۶ رقمی پیامک شده');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const verifyBtn = screen.getByRole('button', { name: 'تأیید و ذخیره شماره' });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(api.verifyPhoneOtpApi).toHaveBeenCalledWith({
        phone: '09351234567',
        code: '123456',
      });
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '09351234567', phone_verified: true })
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
