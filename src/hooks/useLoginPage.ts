import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyzePassword, type PasswordAnalysis } from '../utils/passwordStrength';
import { useCountdown } from './useCountdown';
import { PHONE_REGEX } from '../components/auth/PhoneInput';

export type LoginMode = 'login' | 'register';
export type LoginMethod = 'phone-password' | 'phone-otp';
export type RegisterStep = 'phone' | 'verify' | 'details';
export type LoginOtpStep = 'phone' | 'verify';

export interface LoginPageForm {
  mode: LoginMode;
  setMode: React.Dispatch<React.SetStateAction<LoginMode>>;
  loginMethod: LoginMethod;
  setLoginMethod: React.Dispatch<React.SetStateAction<LoginMethod>>;
  registerStep: RegisterStep;
  setRegisterStep: React.Dispatch<React.SetStateAction<RegisterStep>>;
  loginOtpStep: LoginOtpStep;
  setLoginOtpStep: React.Dispatch<React.SetStateAction<LoginOtpStep>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  otpCode: string;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
  acceptedPrivacy: boolean;
  setAcceptedPrivacy: React.Dispatch<React.SetStateAction<boolean>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  turnstileToken: string | null;
  setTurnstileToken: React.Dispatch<React.SetStateAction<string | null>>;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  submitting: boolean;
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  hasSubmitted: boolean;
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  otpResendTriggered: boolean;
  setOtpResendTriggered: React.Dispatch<React.SetStateAction<boolean>>;
  otpCooldown: number;
  passwordAnalysis: PasswordAnalysis;
  isPhoneValid: boolean;
  isOtpCodeValid: boolean;
  isFullNameValid: boolean;
  isEmailValid: boolean;
  isPasswordValid: boolean;
  isConfirmPasswordValid: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  resetLoginFields: () => void;
  handlePhonePasswordLogin: (e: React.FormEvent) => Promise<void>;
  handleLoginOtpSend: () => Promise<void>;
  handleLoginOtpVerify: () => Promise<void>;
  handleRegisterOtpSend: () => Promise<void>;
  handleRegisterOtpVerify: () => Promise<void>;
  handleRegisterDetails: (e: React.FormEvent) => Promise<void>;
}

export const useLoginPage = (): LoginPageForm => {
  const { login, sendOtp, verifyOtp, loginWithPhone, registerWithPhone, isLoading, isAuthenticated } =
    useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  /* ─── Core mode ─── */
  const [mode, setMode] = useState<LoginMode>('login');

  /* ─── Login sub-method (3 options) ─── */
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone-password');

  /* ─── Register sub-step: 'phone' | 'verify' | 'details' OTP wizard ─── */
  const [registerStep, setRegisterStep] = useState<RegisterStep>('phone');

  /* ─── Login OTP sub-step (when loginMethod === 'phone-otp') ─── */
  const [loginOtpStep, setLoginOtpStep] = useState<LoginOtpStep>('phone');

  /* ─── Form fields ─── */
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  /* ─── OTP cooldown ─── */
  const [otpResendTriggered, setOtpResendTriggered] = useState<boolean>(false);
  const otpCooldown = useCountdown(otpResendTriggered, 120);

  /* ─── Password evaluation ─── */
  const passwordAnalysis = useMemo(() => analyzePassword(password, confirmPassword), [password, confirmPassword]);

  /* ─── Validation ─── */
  const isPhoneValid = PHONE_REGEX.test(phone);
  const isOtpCodeValid = /^\d{6}$/.test(otpCode);
  const isFullNameValid = fullName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid =
    mode === 'register'
      ? passwordAnalysis.hasMinLength &&
        passwordAnalysis.hasLower &&
        passwordAnalysis.hasUpper &&
        passwordAnalysis.hasSymbol
      : password.length > 0;
  const isConfirmPasswordValid = Boolean(confirmPassword) && confirmPassword === password;

  /* ─── Reset turnstile on mode / sub-method changes ─── */
  useEffect(() => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }, [mode, loginMethod]);

  /* ─── Reset errors on mode change ─── */
  useEffect(() => {
    setErrorMessage(null);
    setHasSubmitted(false);
  }, [mode]);

  /* ─── Reset fields when switching mode / methods ─── */
  const resetLoginFields = useCallback(() => {
    setPhone('');
    setOtpCode('');
    setOtpResendTriggered(false);
  }, []);

  /* ────────────────────────────────────────────────
     HANDLERS
  ──────────────────────────────────────────────── */

  /* --- Phone+password login --- */
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره موبایل معتبر وارد کنید.', 'warning');
      return;
    }
    if (!password) {
      showToast('لطفاً کلمه عبور را وارد نمایید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithPhone(phone.trim(), password, turnstileToken);
      showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در برقراری ارتباط با سرور';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Phone OTP login: send code --- */
  const handleLoginOtpSend = async () => {
    setErrorMessage(null);
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره موبایل معتبر وارد کنید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendOtp(phone.trim(), turnstileToken);
      if (!res.registered) {
        setMode('register');
        setRegisterStep('phone');
        showToast('این شماره ثبت‌نام نشده است. لطفاً ابتدا حساب بسازید.', 'info');
        return;
      }
      showToast('کد تأیید با موفقیت ارسال شد.', 'success');
      setLoginOtpStep('verify');
      setOtpResendTriggered(true);
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال کد تأیید';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Phone OTP login: verify code → fall back to password --- */
  const handleLoginOtpVerify = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isOtpCodeValid) {
      showToast('لطفاً کد ۶ رقمی را به درستی وارد کنید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(phone.trim(), otpCode);
      if (!res.registered) {
        setMode('register');
        setRegisterStep('phone');
        setPhone(phone.trim());
        showToast('این شماره ثبت‌نام نشده است. لطفاً حساب خود را بسازید.', 'info');
        return;
      }
      if (res.access_token) {
        showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
        navigate('/dashboard');
        return;
      }
      showToast('شماره شما تأیید شد؛ برای ورود کلمه عبور را وارد کنید.', 'info');
      setLoginMethod('phone-password');
      setOtpCode('');
      setOtpResendTriggered(false);
    } catch (err: any) {
      const msg = err.message || 'خطا در تأیید کد';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step A → send code --- */
  const handleRegisterOtpSend = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره موبایل معتبر وارد کنید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendOtp(phone.trim(), turnstileToken);
      if (res.registered) {
        setMode('login');
        setPhone(phone.trim());
        setLoginMethod('phone-password');
        showToast('این شماره قبلاً ثبت‌نام شده است. لطفاً وارد شوید.', 'info');
        return;
      }
      showToast('کد تأیید با موفقیت ارسال شد.', 'success');
      setRegisterStep('verify');
      setOtpResendTriggered(true);
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال کد تأیید';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step B → verify code --- */
  const handleRegisterOtpVerify = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isOtpCodeValid) {
      showToast('لطفاً کد ۶ رقمی را به درستی وارد کنید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(phone.trim(), otpCode);
      if (res.registered) {
        if (res.access_token) {
          showToast('این شماره قبلاً ثبت‌نام شده است; وارد شدید. خوش آمدید!', 'success');
          navigate('/dashboard');
          return;
        }
        setMode('login');
        setLoginMethod('phone-password');
        showToast('این شماره قبلاً ثبت‌نام شده است. لطفاً وارد شوید.', 'info');
        return;
      }
      showToast('کد تأیید تأیید شد. اکنون اطلاعات حساب خود را تکمیل کنید.', 'success');
      setHasSubmitted(false);
      setRegisterStep('details');
    } catch (err: any) {
      const msg = err.message || 'خطا در تأیید کد';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step C → complete registration --- */
  const handleRegisterDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!fullName.trim()) {
      showToast('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'warning');
      return;
    }
    if (!email.trim()) {
      showToast('لطفاً نشانی ایمیل خود را وارد نمایید.', 'warning');
      return;
    }
    if (!isEmailValid) {
      showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
      return;
    }
    if (!password) {
      showToast('لطفاً کلمه عبور خود را وارد نمایید.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasMinLength) {
      showToast('کلمه عبور باید حداقل ۸ کاراکتر باشد.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasLower || !passwordAnalysis.hasUpper) {
      showToast('کلمه عبور باید شامل حروف بزرگ و کوچک انگلیسی باشد.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasSymbol) {
      showToast('کلمه عبور باید حداقل شامل یک علامت یا نماد خاص (!@#...) باشد.', 'warning');
      return;
    }
    if (!confirmPassword) {
      showToast('لطفاً تکرار کلمه عبور را وارد کنید.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('کلمه عبور و تکرار آن یکسان نیستند.', 'warning');
      return;
    }
    if (!acceptedPrivacy) {
      showToast('لطفاً جهت ایجاد حساب، سیاست حفظ حریم خصوصی را بپذیرید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await registerWithPhone({
        phone: phone.trim(),
        code: otpCode,
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });
      showToast('حساب کاربری شما با موفقیت ایجاد شد.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در ایجاد حساب کاربری';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    setMode,
    loginMethod,
    setLoginMethod,
    registerStep,
    setRegisterStep,
    loginOtpStep,
    setLoginOtpStep,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    phone,
    setPhone,
    otpCode,
    setOtpCode,
    acceptedPrivacy,
    setAcceptedPrivacy,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
    submitting,
    errorMessage,
    setErrorMessage,
    hasSubmitted,
    setHasSubmitted,
    otpResendTriggered,
    setOtpResendTriggered,
    otpCooldown,
    passwordAnalysis,
    isPhoneValid,
    isOtpCodeValid,
    isFullNameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isAuthenticated,
    isLoading,
    resetLoginFields,
    handlePhonePasswordLogin,
    handleLoginOtpSend,
    handleLoginOtpVerify,
    handleRegisterOtpSend,
    handleRegisterOtpVerify,
    handleRegisterDetails,
  };
};