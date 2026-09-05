import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SubmitButtonProps {
  type?: 'submit' | 'button';
  disabled: boolean;
  submitting: boolean;
  onClick?: () => void;
  dataTestId?: string;
  className?: string;
  withArrow?: boolean;
  children: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  type = 'submit',
  disabled,
  submitting,
  onClick,
  dataTestId,
  className = '',
  withArrow = false,
  children,
}) => (
  <button
    type={type}
    data-testid={dataTestId}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm ${className}`}
  >
    {submitting ? (
      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        {children}
        {withArrow && <ArrowRight className="w-4 h-4 rotate-180" />}
      </>
    )}
  </button>
);
