import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';
import { createMockLoginForm } from './mockLoginForm';
import { analyzePassword } from '../../../utils/passwordStrength';

const renderRegister = (form: ReturnType<typeof createMockLoginForm>) => {
  return render(
    <MemoryRouter>
      <RegisterForm form={form} />
    </MemoryRouter>
  );
};

describe('RegisterForm', () => {
  it('renders the step indicator', () => {
    renderRegister(createMockLoginForm());

    expect(screen.getByText('۱. شماره')).toBeInTheDocument();
    expect(screen.getByText('۲. تأیید کد')).toBeInTheDocument();
    expect(screen.getByText('۳. اطلاعات')).toBeInTheDocument();
  });

  describe('phone step', () => {
    it('renders phone input and send-code button', () => {
      renderRegister(createMockLoginForm({ registerStep: 'phone' }));

      expect(screen.getByTestId('otp-phone')).toBeInTheDocument();
      expect(screen.getByText('ارسال کد تأیید')).toBeInTheDocument();
      expect(screen.getByText('ورود به حساب')).toBeInTheDocument();
    });

    it('sends the register OTP', () => {
      const handleRegisterOtpSend = vi.fn();
      renderRegister(createMockLoginForm({ registerStep: 'phone', handleRegisterOtpSend }));

      fireEvent.click(screen.getByTestId('otp-send-btn'));
      expect(handleRegisterOtpSend).toHaveBeenCalledTimes(1);
    });

    it('switches to login mode', () => {
      const form = createMockLoginForm({ registerStep: 'phone' });
      renderRegister(form);

      fireEvent.click(screen.getByText('ورود به حساب'));

      expect(form.setMode).toHaveBeenCalledWith('login');
      expect(form.resetLoginFields).toHaveBeenCalled();
    });
  });

  describe('verify step', () => {
    it('renders the phone number, change-number and verify controls', () => {
      renderRegister(createMockLoginForm({ registerStep: 'verify', phone: '09123456789' }));

      expect(screen.getByText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();
      expect(screen.getByText('تغییر شماره')).toBeInTheDocument();
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
      expect(screen.getByText('تأیید کد')).toBeInTheDocument();
    });

    it('goes back to the phone step when change-number is clicked', () => {
      const form = createMockLoginForm({ registerStep: 'verify' });
      renderRegister(form);

      fireEvent.click(screen.getByText('تغییر شماره'));

      expect(form.setRegisterStep).toHaveBeenCalledWith('phone');
      expect(form.setOtpCode).toHaveBeenCalledWith('');
      expect(form.setOtpResendTriggered).toHaveBeenCalledWith(false);
    });

    it('verifies the OTP', () => {
      const handleRegisterOtpVerify = vi.fn();
      renderRegister(createMockLoginForm({ registerStep: 'verify', handleRegisterOtpVerify }));

      fireEvent.click(screen.getByTestId('otp-verify-btn'));
      expect(handleRegisterOtpVerify).toHaveBeenCalledTimes(1);
    });

    it('shows the resend cooldown and disables resend while counting down', () => {
      renderRegister(createMockLoginForm({ registerStep: 'verify', otpCooldown: 30 }));

      const resendBtn = screen.getByTestId('otp-method');
      expect(resendBtn).toBeDisabled();
      expect(screen.getByText('ارسال مجدد کد (۳۰ثانیه)')).toBeInTheDocument();
    });

    it('resends the OTP when cooldown is over', () => {
      const handleRegisterOtpSend = vi.fn();
      renderRegister(createMockLoginForm({ registerStep: 'verify', otpCooldown: 0, handleRegisterOtpSend }));

      const resendBtn = screen.getByTestId('otp-method');
      expect(resendBtn).toBeEnabled();
      fireEvent.click(resendBtn);
      expect(handleRegisterOtpSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('details step', () => {
    const detailsForm = (overrides: Record<string, unknown> = {}) =>
      createMockLoginForm({
        registerStep: 'details',
        phone: '09123456789',
        passwordAnalysis: analyzePassword('StrongPass123!', 'StrongPass123!'),
        ...overrides,
      });

    it('renders the account details form', () => {
      renderRegister(detailsForm());

      expect(screen.getByText(/شماره ۰۹۱۲۳۴۵۶۷۸۹ تأیید شد/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('مثلاً: سارا احمدی')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
      expect(screen.getByText('ایجاد حساب کاربری')).toBeInTheDocument();
      expect(screen.getByText('بازگشت به تأیید کد')).toBeInTheDocument();
    });

    it('shows the deleted-account warning when the previous account was deleted', () => {
      renderRegister(detailsForm({ isPreviousAccountDeleted: true }));

      expect(screen.getByTestId('deleted-account-warning')).toBeInTheDocument();
      expect(screen.getByText(/توجه: با ایجاد حساب جدید با این شماره/)).toBeInTheDocument();
      expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
    });

    it('does not show the deleted-account warning otherwise', () => {
      renderRegister(detailsForm({ isPreviousAccountDeleted: false }));
      expect(screen.queryByTestId('deleted-account-warning')).not.toBeInTheDocument();
    });

    it('goes back to the verify step', () => {
      const form = detailsForm();
      renderRegister(form);

      fireEvent.click(screen.getByText('بازگشت به تأیید کد'));

      expect(form.setRegisterStep).toHaveBeenCalledWith('verify');
      expect(form.setOtpCode).toHaveBeenCalledWith('');
    });

    it('submits the details form', () => {
      const handleRegisterDetails = vi.fn();
      renderRegister(detailsForm({ handleRegisterDetails }));

      fireEvent.submit(screen.getByRole('button', { name: 'ایجاد حساب کاربری' }).closest('form')!);
      expect(handleRegisterDetails).toHaveBeenCalledTimes(1);
    });

    it('marks invalid fields with error styling after submit', () => {
      renderRegister(detailsForm({ hasSubmitted: true, isFullNameValid: false, isEmailValid: false }));

      expect(screen.getByPlaceholderText('مثلاً: سارا احمدی').className).toContain('border-rose-400');
      expect(screen.getByPlaceholderText('name@example.com').className).toContain('border-rose-400');
    });

    it('shows the mismatch error when passwords differ', () => {
      renderRegister(
        detailsForm({
          password: 'StrongPass123!',
          confirmPassword: 'Different123!',
          isConfirmPasswordValid: false,
        })
      );

      expect(screen.getByText('کلمه عبور و تکرار آن یکسان نیستند.')).toBeInTheDocument();
    });

    it('shows the privacy acceptance error after submit', () => {
      renderRegister(detailsForm({ hasSubmitted: true, acceptedPrivacy: false }));

      expect(
        screen.getByText('پذیرش قوانین و مقررات و سیاست حفظ حریم خصوصی جهت ایجاد حساب کاربری الزامی است.')
      ).toBeInTheDocument();
    });

    it('toggles the privacy checkbox', () => {
      const form = detailsForm();
      renderRegister(form);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(form.setAcceptedPrivacy).toHaveBeenCalledWith(true);
    });

    it('renders the password strength meter', () => {
      renderRegister(detailsForm({ password: 'StrongPass123!', confirmPassword: 'StrongPass123!' }));

      expect(screen.getByText('میزان امنیت کلمه عبور:')).toBeInTheDocument();
      expect(screen.getByText('حداقل ۸ کاراکتر')).toBeInTheDocument();
    });

    it('forwards changes on the details fields to their setters', () => {
      const form = detailsForm();
      renderRegister(form);

      fireEvent.change(screen.getByPlaceholderText('مثلاً: سارا احمدی'), { target: { value: 'سارا احمدی' } });
      expect(form.setFullName).toHaveBeenCalledWith('سارا احمدی');

      fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'sara@shopeek.ir' } });
      expect(form.setEmail).toHaveBeenCalledWith('sara@shopeek.ir');

      const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      expect(form.setPassword).toHaveBeenCalledWith('StrongPass123!');

      fireEvent.change(confirmInput, { target: { value: 'StrongPass123!' } });
      expect(form.setConfirmPassword).toHaveBeenCalledWith('StrongPass123!');
    });

    it('toggles password visibility on both password fields', () => {
      const form = detailsForm();
      renderRegister(form);

      fireEvent.click(screen.getByLabelText('نمایش کلمه عبور'));
      expect(form.setShowPassword).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByLabelText('نمایش تکرار کلمه عبور'));
      expect(form.setShowConfirmPassword).toHaveBeenCalledWith(true);
    });
  });
});