import { vi } from 'vitest';
import type { LoginPageForm } from '../../../hooks/useLoginPage';
import { analyzePassword } from '../../../utils/passwordStrength';

/**
 * Builds a fully-mocked LoginPageForm for rendering LoginForm / RegisterForm
 * in isolation. Setters are vi.fn() spies; values are controllable via
 * overrides. Mirrors the shape returned by useLoginPage.
 */
export const createMockLoginForm = (overrides: Partial<LoginPageForm> = {}): LoginPageForm => {
  const base: LoginPageForm = {
    mode: 'login',
    setMode: vi.fn(),
    loginMethod: 'phone-password',
    setLoginMethod: vi.fn(),
    registerStep: 'phone',
    setRegisterStep: vi.fn(),
    loginOtpStep: 'phone',
    setLoginOtpStep: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    confirmPassword: '',
    setConfirmPassword: vi.fn(),
    fullName: '',
    setFullName: vi.fn(),
    phone: '',
    setPhone: vi.fn(),
    otpCode: '',
    setOtpCode: vi.fn(),
    acceptedPrivacy: false,
    setAcceptedPrivacy: vi.fn(),
    showPassword: false,
    setShowPassword: vi.fn(),
    showConfirmPassword: false,
    setShowConfirmPassword: vi.fn(),
    turnstileToken: null,
    setTurnstileToken: vi.fn(),
    turnstileRef: { current: null },
    submitting: false,
    errorMessage: null,
    setErrorMessage: vi.fn(),
    hasSubmitted: false,
    setHasSubmitted: vi.fn(),
    otpResendTriggered: false,
    setOtpResendTriggered: vi.fn(),
    otpCooldown: 0,
    passwordAnalysis: analyzePassword('', ''),
    isPhoneValid: false,
    isOtpCodeValid: false,
    isFullNameValid: false,
    isEmailValid: false,
    isPasswordValid: false,
    isConfirmPasswordValid: false,
    isAuthenticated: false,
    isLoading: false,
    isPreviousAccountDeleted: false,
    setIsPreviousAccountDeleted: vi.fn(),
    handleSwitchToRegisterWithPhone: vi.fn(),
    resetLoginFields: vi.fn(),
    handlePhonePasswordLogin: vi.fn(),
    handleLoginOtpSend: vi.fn(),
    handleLoginOtpVerify: vi.fn(),
    handleRegisterOtpSend: vi.fn(),
    handleRegisterOtpVerify: vi.fn(),
    handleRegisterDetails: vi.fn(),
  };

  return { ...base, ...overrides };
};