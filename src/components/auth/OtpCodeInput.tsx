import React, { useEffect } from 'react';
import { KeyRound } from 'lucide-react';

interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onAutoVerify?: () => void;
}

const WEB_OTP_NOT_SUPPORTED = typeof navigator === 'undefined' || !('credentials' in navigator);

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({ value, onChange, onAutoVerify }) => {
  /* WebOTP: this input only mounts during the OTP verify step, so request the
     SMS-bound code here and auto-verify once the 6 digits arrive. */
  useEffect(() => {
    if (WEB_OTP_NOT_SUPPORTED) return;

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const otpCredential = (await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: controller.signal,
        })) as OtpCredential | null;

        if (cancelled || !otpCredential?.code) return;

        onChange(otpCredential.code.replace(/\D/g, '').slice(0, 6));
        onAutoVerify?.();
      } catch {
        // User cancel / unsupported is expected — manual entry still works.
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [onChange, onAutoVerify]);

  return (
    <div className="space-y-1.5">
      <label htmlFor="otp-code-input" className="text-xs font-semibold text-slate-700 block">
        کد تأیید
      </label>
      <div className="relative">
        <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
        <input
          id="otp-code-input"
          data-testid="otp-code"
          dir="ltr"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            onChange(val);
          }}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all bg-slate-50 border border-slate-200 focus:border-brand-500 dir-ltr text-left tracking-widest text-center"
        />
      </div>
    </div>
  );
};
