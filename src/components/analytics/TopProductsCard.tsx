import React from 'react';
import { Package, Trophy } from 'lucide-react';
import { TopProductBreakdown } from '../../types';
import { shortTomaanWithUnit, toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';

interface TopProductsCardProps {
  products: TopProductBreakdown[];
}

export const TopProductsCard: React.FC<TopProductsCardProps> = ({ products }) => {
  const hasProducts = products.length > 0;

  return (
    <div className="glass-card p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
            محصولات پرفروش
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            ۵ کالا با بیشترین ارزش فروش در این دوره
          </p>
        </div>
      </div>

      {hasProducts ? (
        <div className="space-y-2.5 pt-1">
          {products.map((item, idx) => {
            const rankStyles = [
              'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold',
              'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold',
              'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold',
            ][idx] || 'bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium';

            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${rankStyles}`}
                  >
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {toGroupedPersianDigits(item.units)} عدد فروخته شده
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {shortTomaanWithUnit(item.revenue)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    سهم: {toPersianDigits(item.share_percentage)}٪
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            اطلاعات کالایی در فاکتورها ثبت نشده است.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
            با درج نام محصول هنگام ثبت فاکتور یا ورود فایل، برترین کالاها به طور خودکار محاسبه می‌شوند.
          </p>
        </div>
      )}
    </div>
  );
};
