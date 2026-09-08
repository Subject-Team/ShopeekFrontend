import React from 'react';
import { Smartphone } from 'lucide-react';

import { PHONE_REGEX, normalizePhoneNumber } from '../../utils/phone';

export { PHONE_REGEX, normalizePhoneNumber };

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, hasError }) => {
  const handleBlur = () => {
    if (value === '+' || value === '+9') {
      onChange('');
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor="auth-phone" className="text-xs font-semibold text-slate-700 block">
        شماره موبایل
      </label>
      <div className="relative">
        <Smartphone
          className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
            hasError ? 'text-rose-400' : 'text-slate-400'
          }`}
        />
        <input
          id="auth-phone"
          name="phone"
          type="tel"
          dir="ltr"
          data-testid="otp-phone"
          placeholder="09123456789"
          value={value}
          onChange={(e) => onChange(normalizePhoneNumber(e.target.value))}
          onBlur={handleBlur}
          className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-left ${
            hasError
              ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
              : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
          }`}
        />
      </div>
    </div>
  );
};
