import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { toPersianDigits } from '../../utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  changePercentage?: number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'indigo' | 'amber' | 'cyan';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  changePercentage,
  subtitle,
  icon: Icon,
  color = 'emerald'
}) => {
  const isPositive = (changePercentage ?? 0) >= 0;

  const colorStyles = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50',
  };

  return (
    <div className="glass-card p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {changePercentage !== undefined && (
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{toPersianDigits(changePercentage)}%{isPositive ? '+' : ''}</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">{subtitle || 'نسبت به دوره قبل'}</span>
        </div>
      )}
    </div>
  );
};
