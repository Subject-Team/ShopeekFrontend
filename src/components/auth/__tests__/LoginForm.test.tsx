import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { createMockLoginForm } from './mockLoginForm';

describe('LoginForm', () => {
  it('renders the method selector with both login methods', () => {
    render(<LoginForm form={createMockLoginForm()} />);

    expect(screen.getByText('موبایل و کلمه عبور')).toBeInTheDocument();
    expect(screen.getByText('موبایل و کد پیامکی')).toBeInTheDocument();
  });

  it('renders the phone+password form by default', () => {
    render(<LoginForm form={createMockLoginForm()} />);

    expect(screen.getByTestId('otp-phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('ورود به داشبورد')).toBeInTheDocument();
    expect(screen.getByText('ثبت‌نام کنید')).toBeInTheDocument();
  });

  it('switches to phone-otp method and resets error/submitted state', () => {
    const form = createMockLoginForm();
    render(<LoginForm form={form} />);

    fireEvent.click(screen.getByTestId('login-method-phone-otp'));

    expect(form.setLoginMethod).toHaveBeenCalledWith('phone-otp');
    expect(form.setLoginOtpStep).toHaveBeenCalledWith('phone');
    expect(form.setErrorMessage).toHaveBeenCalledWith(null);
    expect(form.setHasSubmitted).toHaveBeenCalledWith(false);
  });

  it('switches back to phone-password method', () => {
    const form = createMockLoginForm();
    render(<LoginForm form={form} />);

    fireEvent.click(screen.getByTestId('login-method-phone-password'));

    expect(form.setLoginMethod).toHaveBeenCalledWith('phone-password');
    expect(form.setErrorMessage).toHaveBeenCalledWith(null);
    expect(form.setHasSubmitted).toHaveBeenCalledWith(false);
  });

  it('submits the phone+password form', () => {
    const handlePhonePasswordLogin = vi.fn();
    const form = createMockLoginForm({ handlePhonePasswordLogin });
    render(<LoginForm form={form} />);

    fireEvent.submit(screen.getByRole('button', { name: 'ورود به داشبورد' }).closest('form')!);
    expect(handlePhonePasswordLogin).toHaveBeenCalledTimes(1);
  });

  it('navigates to register when the register link is clicked', () => {
    const form = createMockLoginForm();
    render(<LoginForm form={form} />);

    fireEvent.click(screen.getByText('ثبت‌نام کنید'));

    expect(form.setMode).toHaveBeenCalledWith('register');
    expect(form.setRegisterStep).toHaveBeenCalledWith('phone');
  });

  it('marks the phone input with an error after an invalid submit', () => {
    const form = createMockLoginForm({ hasSubmitted: true, isPhoneValid: false });
    render(<LoginForm form={form} />);

    expect(screen.getByTestId('otp-phone').className).toContain('border-rose-400');
  });

  it('disables the submit button while submitting', () => {
    const form = createMockLoginForm({ submitting: true });
    const { container } = render(<LoginForm form={form} />);

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();
  });

  describe('phone-otp login flow', () => {
    it('shows the phone step with a send-code button', () => {
      const form = createMockLoginForm({ loginMethod: 'phone-otp', loginOtpStep: 'phone' });
      render(<LoginForm form={form} />);

      expect(screen.getByTestId('otp-phone')).toBeInTheDocument();
      expect(screen.getByTestId('otp-send-btn')).toBeInTheDocument();
      expect(screen.getByText('دریافت کد تأیید')).toBeInTheDocument();
    });

    it('sends the OTP when the send button is clicked', () => {
      const handleLoginOtpSend = vi.fn();
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'phone',
        handleLoginOtpSend,
      });
      render(<LoginForm form={form} />);

      fireEvent.click(screen.getByTestId('otp-send-btn'));
      expect(handleLoginOtpSend).toHaveBeenCalledTimes(1);
    });

    it('shows the verify step with the phone number in Persian digits', () => {
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'verify',
        phone: '09123456789',
      });
      render(<LoginForm form={form} />);

      expect(screen.getByText(/کد تأیید به شماره/)).toBeInTheDocument();
      expect(screen.getByText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
      expect(screen.getByText('ورود با کد')).toBeInTheDocument();
    });

    it('verifies the OTP when the verify button is clicked', () => {
      const handleLoginOtpVerify = vi.fn();
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'verify',
        handleLoginOtpVerify,
      });
      render(<LoginForm form={form} />);

      fireEvent.click(screen.getByTestId('otp-verify-btn'));
      expect(handleLoginOtpVerify).toHaveBeenCalledTimes(1);
    });

    it('shows the resend cooldown countdown and disables resend', () => {
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'verify',
        otpCooldown: 45,
      });
      render(<LoginForm form={form} />);

      const resendBtn = screen.getByTestId('otp-method');
      expect(resendBtn).toBeDisabled();
      expect(screen.getByText('ارسال مجدد کد (۴۵ثانیه)')).toBeInTheDocument();
    });

    it('resends the OTP when cooldown is over', () => {
      const handleLoginOtpSend = vi.fn();
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'verify',
        otpCooldown: 0,
        handleLoginOtpSend,
      });
      render(<LoginForm form={form} />);

      const resendBtn = screen.getByTestId('otp-method');
      expect(resendBtn).toBeEnabled();
      expect(screen.getByText('ارسال مجدد کد')).toBeInTheDocument();

      fireEvent.click(resendBtn);
      expect(handleLoginOtpSend).toHaveBeenCalledTimes(1);
    });

    it('switches back to password login from the verify step', () => {
      const form = createMockLoginForm({
        loginMethod: 'phone-otp',
        loginOtpStep: 'verify',
      });
      render(<LoginForm form={form} />);

      fireEvent.click(screen.getByText('ورود با کلمه عبور'));

      expect(form.setLoginMethod).toHaveBeenCalledWith('phone-password');
      expect(form.setOtpCode).toHaveBeenCalledWith('');
      expect(form.setOtpResendTriggered).toHaveBeenCalledWith(false);
    });
  });
});