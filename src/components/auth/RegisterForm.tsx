import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, AlertCircle, CheckSquare, Square, ChevronLeft } from 'lucide-react';
import type { LoginPageForm } from '../../hooks/useLoginPage';
import { PhoneInput } from './PhoneInput';
import { OtpCodeInput } from './OtpCodeInput';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthMeter } from '../common/PasswordStrengthMeter';
import { TurnstileWidget } from './TurnstileWidget';
import { SubmitButton } from './SubmitButton';
import { formatPersianNumber } from '../../utils';

interface RegisterFormProps {
  form: LoginPageForm;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ form }) => {
  const {
    registerStep,
    setRegisterStep,
    phone,
    setPhone,
    otpCode,
    setOtpCode,
    email,
    setEmail,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    acceptedPrivacy,
    setAcceptedPrivacy,
    setTurnstileToken,
    turnstileRef,
    submitting,
    isLoading,
    hasSubmitted,
    setHasSubmitted,
    otpCooldown,
    setOtpResendTriggered,
    passwordAnalysis,
    isPhoneValid,
    isFullNameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    setMode,
    resetLoginFields,
    handleRegisterOtpSend,
    handleRegisterOtpVerify,
    handleRegisterDetails,
  } = form;

  return (
    <>
      {/* ── Register: Phone+OTP Flow ── */}
      <div className="space-y-4">
        {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className={registerStep === 'phone' ? 'text-brand-600 font-bold' : ''}>
              ۱. شماره
            </span>
            <span className="text-slate-300">|</span>
            <span className={registerStep === 'verify' ? 'text-brand-600 font-bold' : ''}>
              ۲. تأیید کد
            </span>
            <span className="text-slate-300">|</span>
            <span className={registerStep === 'details' ? 'text-brand-600 font-bold' : ''}>
              ۳. اطلاعات
            </span>
          </div>

          {/* Step A: Phone */}
          {registerStep === 'phone' && (
            <div className="space-y-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                hasError={hasSubmitted && !isPhoneValid}
              />

              <TurnstileWidget
                turnstileRef={turnstileRef}
                onTokenChange={setTurnstileToken}
              />

              <SubmitButton
                type="button"
                dataTestId="otp-send-btn"
                onClick={handleRegisterOtpSend}
                disabled={submitting || isLoading}
                submitting={submitting}
              >
                <span>ارسال کد تأیید</span>
              </SubmitButton>

              <p className="text-center text-xs text-slate-500">
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetLoginFields();
                  }}
                  className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                >
                  ورود به حساب
                </button>
              </p>
            </div>
          )}

          {/* Step B: Verify OTP */}
          {registerStep === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  کد تأیید به{' '}
                  <span className="font-bold text-slate-800">{formatPersianNumber(phone)}</span> ارسال شد.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('phone');
                    setOtpCode('');
                    setOtpResendTriggered(false);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                >
                  تغییر شماره
                </button>
              </div>

              <OtpCodeInput value={otpCode} onChange={setOtpCode} />

              <SubmitButton
                type="button"
                dataTestId="otp-verify-btn"
                onClick={handleRegisterOtpVerify}
                disabled={submitting || isLoading}
                submitting={submitting}
              >
                <span>تأیید کد</span>
              </SubmitButton>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  data-testid="otp-method"
                  disabled={otpCooldown > 0 || submitting}
                  onClick={() => handleRegisterOtpSend()}
                  className={`text-xs font-bold underline underline-offset-4 ${
                    otpCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed no-underline'
                      : 'text-brand-600 hover:text-brand-700'
                  }`}
                >
                  {otpCooldown > 0
                    ? `ارسال مجدد کد (${formatPersianNumber(otpCooldown)}ثانیه)`
                    : 'ارسال مجدد کد'}
                </button>
              </div>
            </div>
          )}

          {/* Step C: Account Details */}
          {registerStep === 'details' && (
            <form onSubmit={handleRegisterDetails} noValidate className="space-y-4">
              <p className="text-xs text-emerald-700 text-center font-medium bg-emerald-50 rounded-xl py-2 border border-emerald-200">
                شماره {formatPersianNumber(phone)} تأیید شد. اکنون اطلاعات حساب خود را تکمیل کنید.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRegisterStep('verify');
                  setOtpCode('');
                }}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                <span>بازگشت به تأیید کد</span>
              </button>

              <div className="space-y-1.5">
                <label htmlFor="auth-fullname" className="text-xs font-semibold text-slate-700 block">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User
                    className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                      hasSubmitted && !isFullNameValid ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="auth-fullname"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="مثلاً: سارا احمدی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      hasSubmitted && !isFullNameValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="text-xs font-semibold text-slate-700 block">
                  نشانی ایمیل
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                      hasSubmitted && !isEmailValid ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                      hasSubmitted && !isEmailValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                </div>
              </div>

              <PasswordInput
                id="auth-password"
                name="password"
                label="کلمه عبور"
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
                hasError={hasSubmitted && !isPasswordValid}
                toggleAriaLabel={showPassword ? 'مخفی‌سازی کلمه عبور' : 'نمایش کلمه عبور'}
              >
                <PasswordStrengthMeter analysis={passwordAnalysis} hasSubmitted={hasSubmitted} />
              </PasswordInput>

              <PasswordInput
                id="auth-confirm-password"
                name="confirm-password"
                label="تکرار کلمه عبور"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                autoComplete="new-password"
                hasError={hasSubmitted && !isConfirmPasswordValid}
                toggleAriaLabel={
                  showConfirmPassword ? 'مخفی‌سازی تکرار کلمه عبور' : 'نمایش تکرار کلمه عبور'
                }
                borderClass={
                  hasSubmitted && !isConfirmPasswordValid
                    ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                    : confirmPassword && password !== confirmPassword
                    ? 'border border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : confirmPassword && password === confirmPassword
                    ? 'border border-emerald-300 focus:border-emerald-500 bg-emerald-50/20'
                    : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                }
              >
                {((confirmPassword && password !== confirmPassword) ||
                  (hasSubmitted && !isConfirmPasswordValid)) && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>کلمه عبور و تکرار آن یکسان نیستند.</span>
                  </p>
                )}
              </PasswordInput>

              {/* Privacy Checkbox */}
              <div className="pt-1">
                <div
                  className={`p-2.5 rounded-2xl transition-all ${
                    hasSubmitted && !acceptedPrivacy
                      ? 'border border-rose-300 bg-rose-50/30'
                      : 'border border-transparent'
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`mt-0.5 shrink-0 transition-colors ${
                        hasSubmitted && !acceptedPrivacy ? 'text-rose-500' : 'text-brand-600'
                      }`}
                    >
                      {acceptedPrivacy ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square
                          className={`w-4 h-4 ${
                            hasSubmitted && !acceptedPrivacy ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                    <span className="underline underline-offset-4 decoration-slate-300">
                      من{' '}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                      >
                        سیاست حفظ حریم خصوصی
                      </Link>{' '}
                      شاپیک را خوانده‌ام و می‌پذیرم.
                    </span>
                  </label>
                  {hasSubmitted && !acceptedPrivacy && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-2 pr-6">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>پذیرش سیاست حفظ حریم خصوصی جهت ایجاد حساب کاربری الزامی است.</span>
                    </p>
                  )}
                </div>
              </div>

              <SubmitButton
                disabled={submitting || isLoading}
                submitting={submitting}
                className="mt-2"
                withArrow
              >
                <span>ایجاد حساب کاربری</span>
              </SubmitButton>
            </form>
          )}
        </div>
    </>
  );
};
