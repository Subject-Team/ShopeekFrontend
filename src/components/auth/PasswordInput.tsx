import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  autoComplete: string;
  hasError: boolean;
  toggleAriaLabel: string;
  borderClass?: string;
  children?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  autoComplete,
  hasError,
  toggleAriaLabel,
  borderClass,
  children,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-slate-700 block">
      {label}
    </label>
    <div className="relative">
      <Lock
        className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
          hasError ? 'text-rose-400' : 'text-slate-400'
        }`}
      />
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
          borderClass ??
          (hasError
            ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
            : 'bg-slate-50 border border-slate-200 focus:border-brand-500')
        }`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
        aria-label={toggleAriaLabel}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {children}
  </div>
);
