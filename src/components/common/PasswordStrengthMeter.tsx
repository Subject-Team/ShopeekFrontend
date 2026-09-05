import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { PasswordAnalysis } from '../../utils/passwordStrength';

interface PasswordStrengthMeterProps {
  analysis: PasswordAnalysis;
  hasSubmitted: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ analysis, hasSubmitted }) => (
  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-600 font-medium flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>میزان امنیت کلمه عبور:</span>
      </span>
      <span className={`font-bold transition-colors ${analysis.levelColor}`}>
        {analysis.levelLabel}
      </span>
    </div>

    {/* 4-part Stripe Bar */}
    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
      {[1, 2, 3, 4].map((seg) => (
        <div
          key={seg}
          className={`h-full rounded-full transition-all duration-300 ${
            analysis.score >= seg ? analysis.barColor : 'bg-slate-200'
          }`}
        />
      ))}
    </div>

    {/* Live Rule Indicators */}
    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
      <div
        className={`flex items-center gap-1.5 transition-colors ${
          analysis.hasMinLength
            ? 'text-emerald-700 font-medium'
            : hasSubmitted
            ? 'text-rose-600 font-medium'
            : 'text-slate-400'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            analysis.hasMinLength
              ? 'bg-emerald-500 ring-2 ring-emerald-100'
              : hasSubmitted
              ? 'bg-rose-500 ring-2 ring-rose-100'
              : 'bg-slate-300'
          }`}
        />
        <span>حداقل ۸ کاراکتر</span>
      </div>
      <div
        className={`flex items-center gap-1.5 transition-colors ${
          analysis.hasLower && analysis.hasUpper
            ? 'text-emerald-700 font-medium'
            : hasSubmitted
            ? 'text-rose-600 font-medium'
            : 'text-slate-400'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            analysis.hasLower && analysis.hasUpper
              ? 'bg-emerald-500 ring-2 ring-emerald-100'
              : hasSubmitted
              ? 'bg-rose-500 ring-2 ring-rose-100'
              : 'bg-slate-300'
          }`}
        />
        <span>حروف بزرگ و کوچک</span>
      </div>
      <div
        className={`flex items-center gap-1.5 transition-colors ${
          analysis.hasSymbol
            ? 'text-emerald-700 font-medium'
            : hasSubmitted
            ? 'text-rose-600 font-medium'
            : 'text-slate-400'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            analysis.hasSymbol
              ? 'bg-emerald-500 ring-2 ring-emerald-100'
              : hasSubmitted
              ? 'bg-rose-500 ring-2 ring-rose-100'
              : 'bg-slate-300'
          }`}
        />
        <span>علامت یا نماد خاص</span>
      </div>
      <div
        className={`flex items-center gap-1.5 transition-colors ${
          analysis.isMatching
            ? 'text-emerald-700 font-medium'
            : hasSubmitted
            ? 'text-rose-600 font-medium'
            : 'text-slate-400'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            analysis.isMatching
              ? 'bg-emerald-500 ring-2 ring-emerald-100'
              : hasSubmitted
              ? 'bg-rose-500 ring-2 ring-rose-100'
              : 'bg-slate-300'
          }`}
        />
        <span>تطابق تکرار رمز</span>
      </div>
    </div>
  </div>
);
