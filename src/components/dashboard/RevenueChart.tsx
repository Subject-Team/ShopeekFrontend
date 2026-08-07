import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { RevenuePoint } from '../../types';
import { toPersianDate, formatToman, formatPersianNumber } from '../../utils';

interface RevenueChartProps {
  data: RevenuePoint[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'روند فروش و پیش‌بینی هوشمند' }) => {
  const [formattedData, setFormattedData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    const translated = data.map(item => ({
      ...item,
      date: toPersianDate(item.date)
    }));
    setFormattedData(translated);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const filteredPayload = payload.filter((entry: any) => {
        if (entry.value === undefined || entry.value === null) return false;
        if (entry.dataKey === 'forecast_revenue' && entry.payload.revenue !== null && entry.payload.revenue !== undefined) {
          return false;
        }
        return true;
      });

      if (filteredPayload.length === 0) return null;

      const persianLabel = toPersianDate(label);

      return (
        <div className="glass-card p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-slate-200">{persianLabel}</p>
          {filteredPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatPersianNumber(Number(entry.value))} تومان
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base lg:text-lg">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            داده‌های واقعی به همراه خط‌چین پیش‌بینی هوشمند برای روز آینده
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-slate-600 dark:text-slate-400">فروش واقعی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-accent-500" />
            <span className="text-slate-600 dark:text-slate-400">پیش‌بینی هوشمند AI</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(dateStr: string) => {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                  return `${parts[1]}/${parts[2]}`;
                }
                return dateStr;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8', textAnchor: 'end' }}
              tickFormatter={formatToman}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickMargin={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="forecast_revenue"
              name="پیش‌بینی AI"
              stroke="#6366f1"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="فروش واقعی"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
