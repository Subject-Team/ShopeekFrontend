import React from 'react';
import { Smartphone, KeyRound } from 'lucide-react';
import type { LoginPageForm } from '../../hooks/useLoginPage';
import { PhoneInput } from './PhoneInput';
import { OtpCodeInput } from './OtpCodeInput';
import { PasswordInput } from './PasswordInput';
import { TurnstileWidget } from './TurnstileWidget';
import { SubmitButton } from './SubmitButton';
import { formatPersianNumber } from '../../utils';

interface LoginFormProps {
  form: LoginPageForm;
}

export const LoginForm: React.FC<LoginFormProps> = ({ form }) => {
  const {
    loginMethod,
    setLoginMethod,
    loginOtpStep,
    setLoginOtpStep,
    phone,
    setPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    otpCode,
    setOtpCode,
    setTurnstileToken,
    turnstileRef,
    submitting,
    isLoading,
    hasSubmitted,
    setHasSubmitted,
    setErrorMessage,
    otpCooldown,
    setOtpResendTriggered,
    isPhoneValid,
    isOtpCodeValid,
    setMode,
    setRegisterStep,
    handlePhonePasswordLogin,
    handleLoginOtpSend,
    handleLoginOtpVerify,
  } = form;

  return (
    <>
      {/* Login Method Selector */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          data-testid="login-method-phone-password"
          onClick={() => {
            setLoginMethod('phone-password');
            setErrorMessage(null);
            setHasSubmitted(false);
          }}
          className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
            loginMethod === 'phone-password'
              ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>موبایل و کلمه عبور</span>
        </button>
        <button
          type="button"
          data-testid="login-method-phone-otp"
          onClick={() => {
            setLoginMethod('phone-otp');
            setLoginOtpStep('phone');
            setErrorMessage(null);
            setHasSubmitted(false);
          }}
          className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
            loginMethod === 'phone-otp'
              ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>موبایل و کد پیامکی</span>
        </button>
      </div>

      {/* ── Login: Phone + Password ── */}
      {loginMethod === 'phone-password' && (
        <form onSubmit={handlePhonePasswordLogin} noValidate className="space-y-4">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            hasError={hasSubmitted && !isPhoneValid}
          />

          <PasswordInput
            id="auth-password"
            name="password"
            label="کلمه عبور"
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            autoComplete="current-password"
            hasError={hasSubmitted && !password}
            toggleAriaLabel={showPassword ? 'مخفی‌سازی کلمه عبور' : 'نمایش کلمه عبور'}
          />

          <TurnstileWidget
            turnstileRef={turnstileRef}
            onTokenChange={setTurnstileToken}
          />

          <SubmitButton
            disabled={submitting || isLoading}
            submitting={submitting}
            className="mt-2"
            withArrow
          >
            <span>ورود به داشبورد</span>
          </SubmitButton>

          <p className="text-center text-xs text-slate-500">
            حساب ندارید؟{' '}
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegisterStep('phone');
              }}
              className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
            >
              ثبت‌نام کنید
            </button>
          </p>
        </form>
      )}

      {/* ── Login: Phone + OTP ── */}
      {loginMethod === 'phone-otp' && (
        <div className="space-y-4">
          {/* Step: phone */}
          {loginOtpStep === 'phone' && (
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
                onClick={handleLoginOtpSend}
                disabled={submitting || isLoading}
                submitting={submitting}
              >
                <span>دریافت کد تأیید</span>
              </SubmitButton>
            </div>
          )}

          {/* Step: verify code */}
          {loginOtpStep === 'verify' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 text-center">
                کد تأیید به شماره{' '}
                <span className="font-bold text-slate-800">{formatPersianNumber(phone)}</span> ارسال شد.
              </p>

              <OtpCodeInput value={otpCode} onChange={setOtpCode} onAutoVerify={handleLoginOtpVerify} />

              <SubmitButton
                type="button"
                dataTestId="otp-verify-btn"
                onClick={handleLoginOtpVerify}
                disabled={submitting || isLoading}
                submitting={submitting}
              >
                <span>ورود با کد</span>
              </SubmitButton>

              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  data-testid="otp-method"
                  disabled={otpCooldown > 0 || submitting}
                  onClick={() => {
                    handleLoginOtpSend();
                  }}
                  className={`font-bold underline underline-offset-4 ${
                    otpCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed no-underline'
                      : 'text-brand-600 hover:text-brand-700'
                  }`}
                >
                  {otpCooldown > 0 ? `ارسال مجدد کد (${formatPersianNumber(otpCooldown)}ثانیه)` : 'ارسال مجدد کد'}
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone-password');
                    setOtpCode('');
                    setOtpResendTriggered(false);
                  }}
                  className="text-slate-500 hover:text-slate-700 font-medium"
                >
                  ورود با کلمه عبور
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};