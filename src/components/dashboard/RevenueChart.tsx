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
import { LineChart } from 'lucide-react';
import { shortTomaanWithUnit } from "../../utils/persian";
import { toPersianDate } from "../../utils/persian/date";
import { toGroupedPersianDigits } from "../../utils/persian";
import { useIsMobile } from '../../hooks/useIsMobile';

interface RevenueChartProps {
  data: RevenuePoint[];
  title?: string;
  hideForecast?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'روند فروش و پیش‌بینی هوشمند',
  hideForecast = false
}) => {

  const [formattedData, setFormattedData] = useState<RevenuePoint[]>([]);
  const isMobile = useIsMobile(640);
  const hasData = data.length > 0;

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
                {toGroupedPersianDigits(Number(entry.value))} تومان
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const xAxisTickFormatter = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base lg:text-lg">{title}</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hideForecast
              ? 'داده‌های واقعی فروش بر اساس بازه انتخابی'
              : 'داده‌های واقعی به همراه خط‌چین پیش‌بینی هوشمند برای روز آینده'}
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-brand-500" />
              <span className="text-slate-600 dark:text-slate-400">واقعی</span>
            </div>
            {!hideForecast && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent-500" />
                <span className="text-slate-600 dark:text-slate-400">پیش‌بینی</span>
              </div>
            )}
          </div>
        )}
      </div>


      {hasData ? (
        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {/* Keyed by range kind: toggling the forecast Area unmounts it,
                and a remounted Area paints on top of the real line. A fresh
                chart mount restores the declared forecast-under-revenue order. */}
            <AreaChart
              key={hideForecast ? 'archive' : 'live'}
              data={formattedData} margin={{ top: 5, right: isMobile ? 0 : 10, left: isMobile ? -15 : -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a388" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00a388" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2579ef" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2579ef" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: isMobile ? 9 : 11,
                  fill: '#94a3b8'
                }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={xAxisTickFormatter}
                interval={isMobile ? 2 : 0}
                minTickGap={isMobile ? 15 : 5}
              />
              <YAxis
                tick={{
                  fontSize: isMobile ? 9 : 11,
                  fill: '#94a3b8',
                  textAnchor: 'start',
                  direction: 'rtl'
                }}
                tickFormatter={shortTomaanWithUnit}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickMargin={3}
                tickCount={isMobile ? 4 : 6}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* The forecast Area must paint underneath the real line. */}
              {!hideForecast && (
                <Area
                  type="monotone"
                  dataKey="forecast_revenue"
                  name="پیش‌بینی AI"
                  stroke="#2579ef"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  connectNulls={false}
                />
              )}
              <Area
  
                type="monotone"
                dataKey="revenue"
                name="فروش واقعی"
                stroke="#00a388"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <LineChart className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            فروشی برای این بازه ثبت نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            اولین فاکتور خود را ثبت کنید تا نمودار فروش روزانه به صورت خودکار ساخته شود.
          </p>
        </div>
      )}
    </div>
  );
};
