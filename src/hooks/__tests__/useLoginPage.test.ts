import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, screen } from '@testing-library/react';
import { renderHookWithProviders } from '../../test/testUtils';
import { useLoginPage } from '../useLoginPage';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  loginApi: vi.fn(),
  fetchMeApi: vi.fn(),
  sendOtpApi: vi.fn(),
  verifyOtpApi: vi.fn(),
  registerWithPhoneApi: vi.fn(),
  setWebSessionId: vi.fn(),
  getWebSessionId: vi.fn(),
}));

const preventDefault = vi.fn();

const renderHook = () => renderHookWithProviders(() => useLoginPage());

describe('useLoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    preventDefault.mockClear();
  });

  it('computes validation flags from form fields', async () => {
    const { result } = await renderHook();

    expect(result.current.isPhoneValid).toBe(false);
    expect(result.current.isOtpCodeValid).toBe(false);
    expect(result.current.isFullNameValid).toBe(false);
    expect(result.current.isEmailValid).toBe(false);
    expect(result.current.isPasswordValid).toBe(false);
    expect(result.current.isConfirmPasswordValid).toBe(false);

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
      result.current.setConfirmPassword('StrongPass123!');
    });

    expect(result.current.isPhoneValid).toBe(true);
    expect(result.current.isOtpCodeValid).toBe(true);
    expect(result.current.isFullNameValid).toBe(true);
    expect(result.current.isEmailValid).toBe(true);
    expect(result.current.isPasswordValid).toBe(true);
    expect(result.current.isConfirmPasswordValid).toBe(true);
  });

  it('requires full password strength in register mode', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setMode('register');
      result.current.setPassword('weak');
    });
    expect(result.current.isPasswordValid).toBe(false);

    act(() => {
      result.current.setPassword('StrongPass123!');
    });
    expect(result.current.isPasswordValid).toBe(true);
  });

  it('handleSwitchToRegisterWithPhone switches to register mode and flags deleted account', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.handleSwitchToRegisterWithPhone();
    });

    expect(result.current.mode).toBe('register');
    expect(result.current.registerStep).toBe('phone');
    expect(result.current.isPreviousAccountDeleted).toBe(true);
  });

  it('resetLoginFields clears phone, otp code and deleted-account flag', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
      result.current.setOtpResendTriggered(true);
      result.current.setIsPreviousAccountDeleted(true);
      result.current.resetLoginFields();
    });

    expect(result.current.phone).toBe('');
    expect(result.current.otpCode).toBe('');
    expect(result.current.otpResendTriggered).toBe(false);
    expect(result.current.isPreviousAccountDeleted).toBe(false);
  });

  it('handlePhonePasswordLogin warns on invalid phone', async () => {
    const { result } = await renderHook();

    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً یک شماره موبایل معتبر وارد کنید.')).toBeInTheDocument();
    expect(api.loginApi).not.toHaveBeenCalled();
  });

  it('handlePhonePasswordLogin warns when password is missing', async () => {
    const { result } = await renderHook();

    act(() => result.current.setPhone('09123456789'));
    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً کلمه عبور را وارد نمایید.')).toBeInTheDocument();
  });

  it('handlePhonePasswordLogin warns when turnstile is missing', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setPassword('SomePass123!');
    });
    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.')).toBeInTheDocument();
  });

  it('handlePhonePasswordLogin logs in and shows success toast', async () => {
    (api.loginApi as any).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      user: { id: 'u-1', email: 'a@b.ir', full_name: 'کاربر', role: 'User' },
    });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setPassword('SomePass123!');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(api.loginApi).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '09123456789',
        password: 'SomePass123!',
        turnstile_token: 'mock-turnstile-token',
      })
    );
    expect(screen.getByText('ورود با موفقیت انجام شد. خوش آمدید!')).toBeInTheDocument();
  });

  it('handlePhonePasswordLogin flags deleted account on error', async () => {
    (api.loginApi as any).mockRejectedValue(new Error('این حساب کاربری حذف شده است.'));
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setPassword('SomePass123!');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(result.current.isPreviousAccountDeleted).toBe(true);
    expect(result.current.errorMessage).toContain('حذف شده است');
    expect(result.current.turnstileToken).toBeNull();
  });

  it('handlePhonePasswordLogin surfaces generic errors', async () => {
    (api.loginApi as any).mockRejectedValue(new Error('خطا در برقراری ارتباط با سرور'));
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setPassword('SomePass123!');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handlePhonePasswordLogin({ preventDefault } as any);
    });

    expect(result.current.errorMessage).toBe('خطا در برقراری ارتباط با سرور');
    expect(result.current.isPreviousAccountDeleted).toBe(false);
  });

  it('handleLoginOtpSend warns on invalid phone', async () => {
    const { result } = await renderHook();

    await act(async () => {
      await result.current.handleLoginOtpSend();
    });

    expect(screen.getByText('لطفاً یک شماره موبایل معتبر وارد کنید.')).toBeInTheDocument();
  });

  it('handleLoginOtpSend warns when turnstile is missing', async () => {
    const { result } = await renderHook();

    act(() => result.current.setPhone('09123456789'));
    await act(async () => {
      await result.current.handleLoginOtpSend();
    });

    expect(screen.getByText('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.')).toBeInTheDocument();
  });

  it('handleLoginOtpSend flags deleted account', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: false, is_deleted: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleLoginOtpSend();
    });

    expect(result.current.isPreviousAccountDeleted).toBe(true);
    expect(result.current.errorMessage).toContain('حذف شده است');
  });

  it('handleLoginOtpSend switches to register for unregistered phone', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: false });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleLoginOtpSend();
    });

    expect(result.current.mode).toBe('register');
    expect(result.current.registerStep).toBe('phone');
  });

  it('handleLoginOtpSend advances to verify step for registered phone', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleLoginOtpSend();
    });

    expect(api.sendOtpApi).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '09123456789', turnstile_token: 'mock-turnstile-token' })
    );
    expect(result.current.loginOtpStep).toBe('verify');
    expect(result.current.otpResendTriggered).toBe(true);
  });

  it('handleLoginOtpVerify warns on invalid code', async () => {
    const { result } = await renderHook();

    act(() => result.current.setOtpCode('123'));
    await act(async () => {
      await result.current.handleLoginOtpVerify();
    });

    expect(screen.getByText('لطفاً کد ۶ رقمی را به درستی وارد کنید.')).toBeInTheDocument();
  });

  it('handleLoginOtpVerify flags deleted account', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: true, is_deleted: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleLoginOtpVerify();
    });

    expect(result.current.isPreviousAccountDeleted).toBe(true);
    expect(result.current.errorMessage).toContain('حذف شده است');
  });

  it('handleLoginOtpVerify switches to register for unregistered phone', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: false });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleLoginOtpVerify();
    });

    expect(result.current.mode).toBe('register');
    expect(result.current.phone).toBe('09123456789');
  });

  it('handleLoginOtpVerify logs in when a session is issued', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({
      verified: true,
      registered: true,
      access_token: 'access-otp',
      user: { id: 'u-1', email: 'a@b.ir', full_name: 'کاربر', role: 'User' },
    });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleLoginOtpVerify();
    });

    expect(screen.getByText('ورود با موفقیت انجام شد. خوش آمدید!')).toBeInTheDocument();
  });

  it('handleLoginOtpVerify falls back to password entry when no session is issued', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleLoginOtpVerify();
    });

    expect(result.current.loginMethod).toBe('phone-password');
    expect(result.current.otpCode).toBe('');
    expect(result.current.otpResendTriggered).toBe(false);
  });

  it('handleRegisterOtpSend warns on invalid phone', async () => {
    const { result } = await renderHook();

    await act(async () => {
      await result.current.handleRegisterOtpSend();
    });

    expect(screen.getByText('لطفاً یک شماره موبایل معتبر وارد کنید.')).toBeInTheDocument();
  });

  it('handleRegisterOtpSend warns when turnstile is missing', async () => {
    const { result } = await renderHook();

    act(() => result.current.setPhone('09123456789'));
    await act(async () => {
      await result.current.handleRegisterOtpSend();
    });

    expect(screen.getByText('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.')).toBeInTheDocument();
  });

  it('handleRegisterOtpSend flags deleted account', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: false, is_deleted: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleRegisterOtpSend();
    });

    expect(result.current.isPreviousAccountDeleted).toBe(true);
  });

  it('handleRegisterOtpSend switches to login for already-registered phone', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleRegisterOtpSend();
    });

    expect(result.current.mode).toBe('login');
    expect(result.current.loginMethod).toBe('phone-password');
  });

  it('handleRegisterOtpSend advances to verify step', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, registered: false });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setTurnstileToken('mock-turnstile-token');
    });
    await act(async () => {
      await result.current.handleRegisterOtpSend();
    });

    expect(result.current.registerStep).toBe('verify');
    expect(result.current.otpResendTriggered).toBe(true);
  });

  it('handleRegisterOtpVerify warns on invalid code', async () => {
    const { result } = await renderHook();

    act(() => result.current.setOtpCode('123'));
    await act(async () => {
      await result.current.handleRegisterOtpVerify();
    });

    expect(screen.getByText('لطفاً کد ۶ رقمی را به درستی وارد کنید.')).toBeInTheDocument();
  });

  it('handleRegisterOtpVerify flags deleted account', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: false, is_deleted: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleRegisterOtpVerify();
    });

    expect(result.current.isPreviousAccountDeleted).toBe(true);
  });

  it('handleRegisterOtpVerify logs in when already registered with a session', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({
      verified: true,
      registered: true,
      access_token: 'access-1',
      user: { id: 'u-1', email: 'a@b.ir', full_name: 'کاربر', role: 'User' },
    });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleRegisterOtpVerify();
    });

    expect(screen.getByText('این شماره قبلاً ثبت‌نام شده است; وارد شدید. خوش آمدید!')).toBeInTheDocument();
  });

  it('handleRegisterOtpVerify switches to login when already registered without a session', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: true });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleRegisterOtpVerify();
    });

    expect(result.current.mode).toBe('login');
    expect(result.current.loginMethod).toBe('phone-password');
  });

  it('handleRegisterOtpVerify advances to details step', async () => {
    (api.verifyOtpApi as any).mockResolvedValue({ verified: true, registered: false });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
    });
    await act(async () => {
      await result.current.handleRegisterOtpVerify();
    });

    expect(result.current.registerStep).toBe('details');
    expect(result.current.hasSubmitted).toBe(false);
  });

  it('handleRegisterDetails warns when full name is missing', async () => {
    const { result } = await renderHook();

    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً نام و نام خانوادگی خود را وارد کنید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when email is missing', async () => {
    const { result } = await renderHook();

    act(() => result.current.setFullName('کاربر'));
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً نشانی ایمیل خود را وارد نمایید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns on invalid email', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('not-an-email');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً یک نشانی ایمیل معتبر وارد نمایید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when password is missing', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً کلمه عبور خود را وارد نمایید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns on short password', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('Short1!');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('کلمه عبور باید حداقل ۸ کاراکتر باشد.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when password lacks upper/lower case', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('alllowercase1!');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('کلمه عبور باید شامل حروف بزرگ و کوچک انگلیسی باشد.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when password lacks a symbol', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('NoSymbol123');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('کلمه عبور باید حداقل شامل یک علامت یا نماد خاص (!@#...) باشد.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when confirm password is missing', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً تکرار کلمه عبور را وارد کنید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when passwords do not match', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
      result.current.setConfirmPassword('Different123!');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('کلمه عبور و تکرار آن یکسان نیستند.')).toBeInTheDocument();
  });

  it('handleRegisterDetails warns when privacy is not accepted', async () => {
    const { result } = await renderHook();

    act(() => {
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
      result.current.setConfirmPassword('StrongPass123!');
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(screen.getByText('لطفاً جهت ایجاد حساب، قوانین و مقررات و سیاست حفظ حریم خصوصی را بپذیرید.')).toBeInTheDocument();
  });

  it('handleRegisterDetails registers and shows success toast', async () => {
    (api.registerWithPhoneApi as any).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      web_session_id: 'ses-1',
      user: { id: 'u-1', email: 'user@example.com', full_name: 'کاربر', role: 'User' },
    });
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
      result.current.setConfirmPassword('StrongPass123!');
      result.current.setAcceptedPrivacy(true);
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(api.registerWithPhoneApi).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '09123456789',
        code: '123456',
        email: 'user@example.com',
        full_name: 'کاربر',
        password: 'StrongPass123!',
      })
    );
    expect(screen.getByText('حساب کاربری شما با موفقیت ایجاد شد.')).toBeInTheDocument();
  });

  it('handleRegisterDetails surfaces registration errors', async () => {
    (api.registerWithPhoneApi as any).mockRejectedValue(new Error('خطا در ایجاد حساب کاربری'));
    const { result } = await renderHook();

    act(() => {
      result.current.setPhone('09123456789');
      result.current.setOtpCode('123456');
      result.current.setFullName('کاربر');
      result.current.setEmail('user@example.com');
      result.current.setPassword('StrongPass123!');
      result.current.setConfirmPassword('StrongPass123!');
      result.current.setAcceptedPrivacy(true);
    });
    await act(async () => {
      await result.current.handleRegisterDetails({ preventDefault } as any);
    });

    expect(result.current.errorMessage).toBe('خطا در ایجاد حساب کاربری');
    expect(result.current.turnstileToken).toBeNull();
  });
});