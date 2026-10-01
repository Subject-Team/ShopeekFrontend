import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const SPINNER = 'w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin';
const LABEL = 'در حال بارگذاری سامانه شاپیک...';

/**
 * Full-viewport loader for the boot-time session check. Intentionally hard-coded
 * to the dark surface: it paints before the persisted theme has been applied, so
 * it must not depend on a context that may not have resolved yet.
 */
export const FullPageLoader: React.FC = () => (
  <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-slate-100 font-vazir dir-rtl">
    <div className="flex flex-col items-center gap-3">
      <div className={SPINNER} />
      <p className="text-sm font-semibold text-slate-300">{LABEL}</p>
    </div>
  </div>
);

/**
 * Full-viewport loader for top-level route chunks. Theme-aware because it also
 * covers client-side navigation between the light public pages, where the dark
 * `FullPageLoader` would flash black between two light pages.
 */
export const RouteLoader: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center font-vazir dir-rtl ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={SPINNER} />
        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
          {LABEL}
        </p>
      </div>
    </div>
  );
};

/**
 * In-page loader for dashboard sub-route chunks. Deliberately transparent and
 * short so the surrounding `Shell` (sidebar, topbar, credit chip) stays on
 * screen while only the routed content swaps — a full-viewport fallback here
 * would blank the whole chrome on every dashboard navigation.
 */
export const ContentLoader: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div className={SPINNER} />
      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {LABEL}
      </p>
    </div>
  );
};
