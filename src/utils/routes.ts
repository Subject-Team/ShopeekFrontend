export interface RouteInfo {
  path: string;
  key: string;
  title: string;
}

/**
 * Single source of truth for dashboard route → page key / Persian title.
 * Consumers: Topbar (page title) and GuideContext (active guide page key).
 */
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', key: 'dashboard', title: 'داشبورد اصلی' },
  { path: '/dashboard/', key: 'dashboard', title: 'داشبورد اصلی' },
  { path: '/dashboard/analytics', key: 'analytics', title: 'تحلیل و آمار فروش' },
  { path: '/dashboard/customers', key: 'customers', title: 'مدیریت مشتریان (CRM)' },
  { path: '/dashboard/ingestion', key: 'ingestion', title: 'ورود داده‌ها' },
  { path: '/dashboard/settings', key: 'settings', title: 'تنظیمات' },
];

export const getPageTitle = (pathname: string): string => {
  const route = ROUTES.find(r => r.path === pathname);
  return route?.title ?? 'داشبورد';
};

export const getActivePageKey = (pathname: string): string => {
  const route = ROUTES.find(r => r.path === pathname);
  return route?.key ?? '';
};
