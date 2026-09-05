import React from 'react';
import { KeyRound } from 'lucide-react';

interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({ value, onChange }) => (
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
