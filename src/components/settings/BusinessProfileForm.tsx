import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  Loader2,
  Package,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import { updateBusinessProfile } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BUSINESS_CATEGORIES, BusinessCategoryOption } from '../../config/businessCategories';
import type { BusinessLinkItem, BusinessProfile } from '../../types';
import { toGroupedPersianDigits } from '../../utils/persian';

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

interface BusinessProfileFormProps {
  initialProfile?: BusinessProfile | null;
  readOnly: boolean;
  onSaved?: (profile: BusinessProfile) => void;
}

export const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  initialProfile,
  readOnly,
  onSaved,
}) => {
  const { showToast } = useToast();

  const [category, setCategory] = useState<string>(initialProfile?.category || '');
  const [categoryOther, setCategoryOther] = useState<string>(initialProfile?.category_other || '');
  const [monthlyOrders, setMonthlyOrders] = useState<string>(
    initialProfile?.monthly_orders !== null && initialProfile?.monthly_orders !== undefined
      ? String(initialProfile.monthly_orders)
      : ''
  );
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>(
    initialProfile?.monthly_revenue !== null && initialProfile?.monthly_revenue !== undefined
      ? String(initialProfile.monthly_revenue)
      : ''
  );
  const [businessType, setBusinessType] = useState<'goods' | 'services' | ''>(
    initialProfile?.business_type || ''
  );
  const [isB2b, setIsB2b] = useState<boolean>(Boolean(initialProfile?.is_b2b));
  const [links, setLinks] = useState<BusinessLinkItem[]>(initialProfile?.links || []);

  const [categorySearch, setCategorySearch] = useState<string>('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if initialProfile changes
  useEffect(() => {
    if (!initialProfile) return;
    setCategory(initialProfile.category || '');
    setCategoryOther(initialProfile.category_other || '');
    setMonthlyOrders(
      initialProfile.monthly_orders !== null && initialProfile.monthly_orders !== undefined
        ? String(initialProfile.monthly_orders)
        : ''
    );
    setMonthlyRevenue(
      initialProfile.monthly_revenue !== null && initialProfile.monthly_revenue !== undefined
        ? String(initialProfile.monthly_revenue)
        : ''
    );
    setBusinessType(initialProfile.business_type || '');
    setIsB2b(Boolean(initialProfile.is_b2b));
    setLinks(initialProfile.links || []);
  }, [initialProfile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryObj = BUSINESS_CATEGORIES.find((c) => c.id === category);

  const filteredCategories: BusinessCategoryOption[] = BUSINESS_CATEGORIES.filter((c) =>
    c.title.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { type: 'instagram', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: keyof BusinessLinkItem, value: string) => {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    setSubmitting(true);
    try {
      const ordersNum = monthlyOrders.trim() ? Number(monthlyOrders.replace(/,/g, '')) : null;
      const revNum = monthlyRevenue.trim() ? Number(monthlyRevenue.replace(/,/g, '')) : null;

      const payload = {
        category: category || null,
        category_other: category === 'other' ? categoryOther.trim() || null : null,
        monthly_orders: Number.isFinite(ordersNum) ? ordersNum : null,
        monthly_revenue: Number.isFinite(revNum) ? revNum : null,
        business_type: businessType ? businessType : null,
        is_b2b: isB2b,
        links: links.filter((item) => item.url && item.url.trim().length > 0),
      };

      const updated = await updateBusinessProfile(payload);

      // Manage dismissal state on save
      if (updated.is_completed) {
        localStorage.removeItem('shopeek_dismiss_business_profile_banner_time');
      } else {
        // If edited and incomplete, restore banner immediately by clearing suppression
        localStorage.removeItem('shopeek_dismiss_business_profile_banner_time');
      }

      // Notify any listening components
      window.dispatchEvent(
        new CustomEvent('shopeek_business_profile_updated', { detail: updated })
      );

      showToast('اطلاعات تکمیلی کسب‌وکار با موفقیت ذخیره شد.', 'success');
      onSaved?.(updated);
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره اطلاعات تکمیلی', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-guide="settings-business-profile" className={cardClass}>
      {/* Informational Guidance Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 mb-6 text-indigo-900 dark:text-indigo-200">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 text-xs leading-relaxed space-y-1">
          <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-100">
            تکمیل اطلاعات تکمیلی کسب‌وکار
          </h3>
          <p className="text-slate-700 dark:text-indigo-200/90">
            این اطلاعات به ما کمک می‌کند تا خدمات، الگوهای هوش مصنوعی و گزارش‌های سامانه را متناسب با نیازهای خاص صنف و مقیاس کاری شما ارتقا دهیم. شما می‌توانید این اطلاعات را در هر زمان ویرایش فرمایید.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            دسته‌بندی و حوزه کاری کسب‌وکار <span className="text-rose-500">*</span>
          </label>
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all text-right disabled:opacity-60"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className={selectedCategoryObj ? 'font-bold' : 'text-slate-400'}>
                  {selectedCategoryObj ? selectedCategoryObj.title : 'انتخاب حوزه کاری کسب‌وکار...'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 space-y-1.5 animate-fade-in">
                {/* Search Bar inside dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="جستجو در ۳۰ حوزه کاری..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pt-1">
                  {filteredCategories.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      موردی یافت نشد
                    </div>
                  ) : (
                    filteredCategories.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCategory(item.id);
                          setIsCategoryDropdownOpen(false);
                          setCategorySearch('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-right transition-colors ${
                          category === item.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>{item.title}</span>
                        {category === item.id && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Category Input if 'other' is selected */}
          {category === 'other' && (
            <div className="pt-2 animate-fade-in">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                عنوان حوزه کاری خود را وارد نمایید <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={categoryOther}
                onChange={(e) => setCategoryOther(e.target.value)}
                placeholder="مثال: تولید قطعات صنعتی سفارشی"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Business Dimensions (Orders Count + Revenue) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              تعداد سفارش حدودی در ماه <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                disabled={readOnly}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(e.target.value)}
                placeholder="مثال: ۵۰"
                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">
                سفارش
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              مجموع مبالغ سفارشات حدودی در ماه <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10000"
                disabled={readOnly}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value)}
                placeholder="مثال: ۲۰۰۰۰۰۰۰"
                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">
                تومان
              </span>
            </div>
            {monthlyRevenue && Number(monthlyRevenue) > 0 && (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                {toGroupedPersianDigits(Number(monthlyRevenue))} تومان در ماه
              </p>
            )}
          </div>
        </div>

        {/* Business Type (Goods vs Services) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            نوع کسب‌وکار <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setBusinessType('goods')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                businessType === 'goods'
                  ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>فروش کالا (فیزیکی یا دیجیتال)</span>
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={() => setBusinessType('services')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                businessType === 'services'
                  ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>خدماتی (ارائه خدمات و مشاوره)</span>
            </button>
          </div>
        </div>

        {/* B2B Checkbox with Hint */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1.5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={isB2b}
              onChange={(e) => setIsB2b(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              فروش سازمانی / کسب‌وکار به کسب‌وکار (B2B)
            </span>
          </label>
          <div className="flex items-start gap-1.5 pr-7 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              اگر خریداران و طرف‌های حساب شما شرکت‌ها، فروشگاه‌ها یا سازمان‌ها هستند (مانند عمده‌فروشی، تأمین کالا یا خدمات سازمانی) این گزینه را فعال کنید.
            </span>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                لینک‌ها و راه‌های ارتباطی
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                وب‌سایت، کانال تلگرام یا صفحات شبکه‌های اجتماعی کسب‌وکار
              </p>
            </div>
            <button
              type="button"
              disabled={readOnly}
              onClick={handleAddLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن لینک جدید</span>
            </button>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-4 px-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              هنوز لینکی اضافه نشده است. با کلیک روی «افزودن لینک جدید»، وب‌سایت یا شبکه‌های اجتماعی خود را ثبت کنید.
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  {/* Link Type Selector */}
                  <select
                    disabled={readOnly}
                    value={link.type}
                    onChange={(e) => handleLinkChange(idx, 'type', e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shrink-0"
                  >
                    <option value="website">وب‌سایت</option>
                    <option value="telegram">کانال تلگرام</option>
                    <option value="instagram">صفحه اینستاگرام</option>
                    <option value="other">سایر</option>
                  </select>

                  {/* Icon Indicator */}
                  <div className="text-slate-400 shrink-0">
                    {link.type === 'website' && <Globe className="w-4 h-4 text-blue-500" />}
                    {link.type === 'telegram' && <Send className="w-4 h-4 text-sky-500" />}
                    {link.type === 'instagram' && <Camera className="w-4 h-4 text-pink-500" />}
                    {link.type === 'other' && <Globe className="w-4 h-4 text-slate-400" />}
                  </div>

                  {/* URL or Handle Input */}
                  <input
                    type="text"
                    disabled={readOnly}
                    dir="ltr"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    placeholder={
                      link.type === 'instagram'
                        ? 'instagram_id or https://...'
                        : link.type === 'telegram'
                        ? '@channel_id or https://t.me/...'
                        : 'https://...'
                    }
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleRemoveLink(idx)}
                    title="حذف لینک"
                    aria-label="حذف لینک"
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0 disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            فیلدهای دارای علامت ستاره (<span className="text-rose-500">*</span>) جهت سنجش تکمیل بودن فرم الزامی هستند.
          </span>
          <button
            type="submit"
            disabled={readOnly || submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <span>ذخیره اطلاعات تکمیلی</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
