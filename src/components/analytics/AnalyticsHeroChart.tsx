import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  ReceiptText,
  Users,
  GitCompare,
  LineChart,
  Sparkles,
} from 'lucide-react';
import { TrendMetricPoint } from '../../types';
import { shortTomaanWithUnit, toGroupedPersianDigits } from '../../utils/persian';
import { toPersianDate } from '../../utils/persian/date';
import { useIsMobile } from '../../hooks/useIsMobile';

export type MetricType = 'revenue' | 'orders' | 'aov' | 'unique_customers';

interface AnalyticsHeroChartProps {
  data: TrendMetricPoint[];
  hideForecast?: boolean;
}

interface MetricConfig {
  key: MetricType;
  label: string;
  unit: string;
  icon: React.ElementType;
  currentKey: keyof TrendMetricPoint;
  prevKey: keyof TrendMetricPoint;
  color: string;
  prevColor: string;
}

const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  revenue: {
    key: 'revenue',
    label: 'درآمد کل',
    unit: 'تومان',
    icon: DollarSign,
    currentKey: 'revenue',
    prevKey: 'prev_revenue',
    color: '#00a388',
    prevColor: '#94a3b8',
  },
  orders: {
    key: 'orders',
    label: 'سفارشات',
    unit: 'عدد',
    icon: ShoppingBag,
    currentKey: 'orders',
    prevKey: 'prev_orders',
    color: '#6366f1',
    prevColor: '#94a3b8',
  },
  aov: {
    key: 'aov',
    label: 'میانگین فاکتور (AOV)',
    unit: 'تومان',
    icon: ReceiptText,
    currentKey: 'aov',
    prevKey: 'prev_aov',
    color: '#f59e0b',
    prevColor: '#94a3b8',
  },
  unique_customers: {
    key: 'unique_customers',
    label: 'خریداران فعال',
    unit: 'نفر',
    icon: Users,
    currentKey: 'unique_customers',
    prevKey: 'prev_unique_customers',
    color: '#06b6d4',
    prevColor: '#94a3b8',
  },
};

export const AnalyticsHeroChart: React.FC<AnalyticsHeroChartProps> = ({
  data,
  hideForecast = false,
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
  const [comparePrevious, setComparePrevious] = useState<boolean>(true);
  const isMobile = useIsMobile(640);

  const config = METRIC_CONFIGS[activeMetric];

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      persianDate: toPersianDate(item.date),
      persianPrevDate: item.prev_date ? toPersianDate(item.prev_date) : undefined,
    }));
  }, [data]);

  const hasData = formattedData.some(
    (item) => (item[config.currentKey] as number) > 0 || (item[config.prevKey] as number) > 0
  );

  const yAxisFormatter = (value: number) => {
    if (activeMetric === 'revenue' || activeMetric === 'aov') {
      return shortTomaanWithUnit(value);
    }
    return toGroupedPersianDigits(value);
  };

  const xAxisTickFormatter = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const row = payload[0]?.payload;
    if (!row) return null;

    const currVal = row[config.currentKey];
    const prevVal = comparePrevious ? row[config.prevKey] : undefined;
    const forecastVal = activeMetric === 'revenue' && !hideForecast ? row.forecast_revenue : undefined;

    return (
      <div className="glass-card p-3 rounded-xl shadow-xl text-xs space-y-2 border border-slate-200 dark:border-slate-700 dir-rtl">
        <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
          {label}
        </p>

        {currVal !== null && currVal !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: config.color }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="font-semibold">دوره انتخابی:</span>
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {toGroupedPersianDigits(Math.round(currVal))} {config.unit}
            </span>
          </div>
        )}

        {comparePrevious && prevVal !== undefined && prevVal !== null && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>دوره قبل ({row.persianPrevDate || 'متناظر'}):</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {toGroupedPersianDigits(Math.round(prevVal))} {config.unit}
            </span>
          </div>
        )}

        {forecastVal !== undefined && forecastVal !== null && row.revenue === null && (
          <div className="flex items-center justify-between gap-4 text-accent-600 dark:text-accent-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>پیش‌بینی فردا:</span>
            </span>
            <span className="font-extrabold">
              {toGroupedPersianDigits(Math.round(forecastVal))} {config.unit}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xs space-y-4">
      {/* Header with Title and Control Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
            نمودار روند مقایسه‌ای
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تحلیل مقایسه‌ای دوره فعلی در برابر دوره متناظر قبلی به تفکیک شاخص‌ها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div
            role="tablist"
            className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs"
          >
            {(Object.keys(METRIC_CONFIGS) as MetricType[]).map((mKey) => {
              const item = METRIC_CONFIGS[mKey];
              const Icon = item.icon;
              const isActive = activeMetric === mKey;
              return (
                <button
                  key={mKey}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveMetric(mKey)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* PoP Comparison Toggle */}
          <button
            type="button"
            onClick={() => setComparePrevious((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              comparePrevious
                ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>مقایسه دوره قبل</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center gap-4 text-xs font-semibold pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-slate-700 dark:text-slate-300">دوره فعلی ({config.label})</span>
        </div>
        {comparePrevious && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">دوره متناظر قبل</span>
          </div>
        )}
        {activeMetric === 'revenue' && !hideForecast && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-accent-500" />
            <span className="text-accent-600 dark:text-accent-400">پیش‌بینی هوشمند فردا</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      {hasData ? (
        <div className="h-64 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={`${activeMetric}-${comparePrevious}`}
              data={formattedData}
              margin={{ top: 10, right: isMobile ? 0 : 10, left: isMobile ? -15 : -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2579ef" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2579ef" stopOpacity={0.0} />
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
                dataKey="persianDate"
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#94a3b8' }}
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
                  direction: 'rtl',
                }}
                tickFormatter={yAxisFormatter}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickMargin={4}
                tickCount={isMobile ? 4 : 6}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Previous period line (painted behind current period) */}
              {comparePrevious && (
                <Area
                  type="monotone"
                  dataKey={config.prevKey}
                  name="دوره متناظر قبل"
                  stroke={config.prevColor}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                  connectNulls={true}
                />
              )}

              {/* Forecast (for revenue metric) */}
              {activeMetric === 'revenue' && !hideForecast && (
                <Area
                  type="monotone"
                  dataKey="forecast_revenue"
                  name="پیش‌بینی AI"
                  stroke="#2579ef"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  connectNulls={false}
                />
              )}

              {/* Current period main area */}
              <Area
                type="monotone"
                dataKey={config.currentKey}
                name={config.label}
                stroke={config.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
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
            داده‌ای در این بازه زمانی ثبت نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            با ثبت فاکتورهای فروش، نمودار مقایسه‌ای دوره فعلی و قبلی در اینجا شکل خواهد گرفت.
          </p>
        </div>
      )}
    </div>
  );
};
