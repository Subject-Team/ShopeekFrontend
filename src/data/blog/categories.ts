import { BlogCategory } from './types';

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'sales-analytics',
    name: 'تحلیل فروش',
    slug: 'sales-analytics',
    description: 'راهکارها و شاخص‌های کلیدی برای بررسی عملکرد فروشگاه و رشد درآمد',
  },
  {
    id: 'financial-management',
    name: 'مدیریت مالی',
    slug: 'financial-management',
    description: 'اصول محاسبه سود واقعی، حاشیه سود، نقطه سر‌به‌سر و بهینه‌سازی دخل و خرج',
  },
  {
    id: 'customer-retention',
    name: 'مدیریت مشتریان',
    slug: 'customer-retention',
    description: 'تکنیک‌های وفادارسازی خریداران، مدل RFM و افزایش نرخ بازگشت مشتری',
  },
  {
    id: 'smart-tools',
    name: 'ابزارهای هوشمند',
    slug: 'smart-tools',
    description: 'اتوماسیون ثبت سفارش‌ها، ربات‌های تلگرام و کاربرد هوش مصنوعی در کسب‌وکار',
  },
];

/**
 * Resolve a category slug to its Persian display name.
 *
 * `BlogPost` deliberately stores only `categorySlug`, so a post badge can never
 * drift away from the filter chip that produced it. The slug is returned as a
 * fallback so an unknown slug still renders something readable.
 */
export const getCategoryName = (slug: string): string => {
  return BLOG_CATEGORIES.find((cat) => cat.slug === slug)?.name ?? slug;
};

export const getCategories = (): BlogCategory[] => {
  return BLOG_CATEGORIES;
};
