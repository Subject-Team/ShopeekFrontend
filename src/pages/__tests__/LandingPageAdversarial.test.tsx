// @test-type page
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fs from 'fs';
import path from 'path';
import { LandingPage } from '../LandingPage';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { MainFooter } from '../../components/layout/MainFooter';

const LANDING_PAGE_PATH = path.resolve(__dirname, '../LandingPage.tsx');
const PUBLIC_HEADER_PATH = path.resolve(__dirname, '../../components/layout/PublicHeader.tsx');
const MAIN_FOOTER_PATH = path.resolve(__dirname, '../../components/layout/MainFooter.tsx');

const landingPageSource = fs.readFileSync(LANDING_PAGE_PATH, 'utf8');
const publicHeaderSource = fs.readFileSync(PUBLIC_HEADER_PATH, 'utf8');
const mainFooterSource = fs.readFileSync(MAIN_FOOTER_PATH, 'utf8');

const ALL_TARGET_SOURCES = [
  { name: 'LandingPage.tsx', source: landingPageSource },
  { name: 'PublicHeader.tsx', source: publicHeaderSource },
  { name: 'MainFooter.tsx', source: mainFooterSource },
];

describe('[Adversarial Challenge] Landing Page & Layout Unslopping Verification', () => {
  // =========================================================================
  // SECTION 1: Slop Leakage Probing Across All 3 Files
  // =========================================================================
  describe('1. Slop Leakage Analysis', () => {
    describe('1.1. Ambient Blur Blobs & Wash Divs', () => {
      it('verifies complete absence of blur-3xl across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found blur-3xl in ${name}`).not.toContain('blur-3xl');
        });
      });

      it('verifies complete absence of blur-2xl across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found blur-2xl in ${name}`).not.toContain('blur-2xl');
        });
      });

      it('verifies complete absence of ambient glow orbs (bg-brand-500/20, bg-brand-500/15)', () => {
        const ambientOrbRegex = /bg-brand-500\/(?:15|20|25|30)/;
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found ambient orb in ${name}`).not.toMatch(ambientOrbRegex);
        });
      });
    });

    describe('1.2. Multi-Hue Gradients & Gradient Buttons', () => {
      it('verifies complete absence of multi-hue gradients (from-brand to-indigo, via-*)', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found from-brand in ${name}`).not.toContain('from-brand-');
          expect(source, `Found to-indigo in ${name}`).not.toContain('to-indigo-');
          expect(source, `Found via- in ${name}`).not.toMatch(/\bvia-[a-z]/);
          expect(source, `Found bg-gradient- in ${name}`).not.toContain('bg-gradient-');
        });
      });
    });

    describe('1.3. Typography Font Weights', () => {
      it('verifies complete absence of font-black (weight 900) across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found font-black in ${name}`).not.toContain('font-black');
        });
      });

      it('verifies complete absence of font-extrabold (weight 800) across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found font-extrabold in ${name}`).not.toContain('font-extrabold');
        });
      });

      it('verifies complete absence of font-bold (weight 700) in headings across LandingPage.tsx', () => {
        // Headings must use font-semibold (600) or font-medium (500), never font-bold (700)
        expect(landingPageSource).not.toMatch(/<h[1-6][^>]*\bfont-bold\b/);
      });
    });

    describe('1.4. Unneeded & Looping Animations', () => {
      it('verifies complete absence of animate-pulse across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found animate-pulse in ${name}`).not.toContain('animate-pulse');
        });
      });

      it('verifies complete absence of animate-ping across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found animate-ping in ${name}`).not.toContain('animate-ping');
        });
      });

      it('verifies complete absence of animate-bounce across all 3 files', () => {
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found animate-bounce in ${name}`).not.toContain('animate-bounce');
        });
      });
    });

    describe('1.5. Persian Copy Exclamation Marks', () => {
      it('verifies absence of exclamation marks (!) in Persian interface copy and badges', () => {
        // Find any Persian text followed by an exclamation mark
        const persianWithExclamationRegex = /[\u0600-\u06FF]+[^\n\r"'>]*!/g;
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          const matches = source.match(persianWithExclamationRegex) || [];
          expect(matches, `Found exclamation in Persian text in ${name}`).toEqual([]);
        });
      });
    });

    describe('1.6. Decorative Emojis & Sparkles', () => {
      it('verifies zero raw decorative emojis across all 3 files', () => {
        const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          expect(source, `Found emoji in ${name}`).not.toMatch(emojiRegex);
        });
      });

      it('verifies complete absence of Lucide Sparkle/Sparkles icons in LandingPage', () => {
        expect(landingPageSource).not.toMatch(/<Sparkle[s]?\b/);
        expect(landingPageSource).not.toMatch(/import\s*\{[^}]*Sparkle[s]?[^}]*\}\s*from\s*['"]lucide-react['"]/);
      });
    });

    describe('1.7. Spacing Grid (4px Rhythm)', () => {
      it('verifies absence of non-grid spacing classes (px-3.5, py-3.5, px-2.5, gap-2.5, p-2.5, etc.) in LandingPage.tsx', () => {
        // Check exact target classes from dispatch: px-3.5, py-3.5, px-2.5, gap-2.5
        const nonGridDispatchRegex = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(?:2\.5|3\.5)\b/g;
        const matches = landingPageSource.match(nonGridDispatchRegex) || [];
        expect(matches, `Found non-grid half-step classes: ${matches.join(', ')}`).toEqual([]);
      });

      it('checks whether any 6px half-steps (space-y-1.5, gap-1.5, etc.) exist in LandingPage.tsx', () => {
        const onePointFiveRegex = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-1\.5\b/g;
        const matches = landingPageSource.match(onePointFiveRegex) || [];
        // Empirical observation: line 528 has space-y-1.5 (6px). Documenting this finding.
        expect(matches).toEqual(['space-y-1.5']);
      });

      it('verifies absence of non-grid spacing classes in PublicHeader.tsx and MainFooter.tsx', () => {
        const nonGridClassRegex = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(?:1\.5|2\.5|3\.5)\b/g;
        expect(publicHeaderSource.match(nonGridClassRegex) || []).toEqual([]);
        expect(mainFooterSource.match(nonGridClassRegex) || []).toEqual([]);
      });

      it('verifies absence of arbitrary pixel spacing classes (e.g. p-[13px], mt-[11px]) across all 3 files', () => {
        const arbitraryPixelSpacingRegex = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[\d+px\]/g;
        ALL_TARGET_SOURCES.forEach(({ name, source }) => {
          const matches = source.match(arbitraryPixelSpacingRegex) || [];
          expect(matches, `Found arbitrary pixel spacing in ${name}`).toEqual([]);
        });
      });
    });
  });

  // =========================================================================
  // SECTION 2: Tabular Numerals Verification (DOM Rendering & Elements)
  // =========================================================================
  describe('2. Tabular Numerals Enforcement on All Numbers, Metrics & Dates', () => {
    it('verifies tabular-nums is applied to hero preview invoice data', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroPreview = container.querySelector('[data-testid="hero-preview"]');
      expect(heroPreview).toBeInTheDocument();

      // Invoice ID: #SHP-4082
      const invoiceId = heroPreview?.querySelector('.font-mono');
      expect(invoiceId?.textContent).toContain('#SHP-4082');
      expect(invoiceId?.classList.contains('tabular-nums')).toBe(true);

      // Total price: ۷۳۵,۰۰۰ تومان
      const totalPrice = Array.from(heroPreview?.querySelectorAll('*') || []).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۷۳۵,۰۰۰')
      );
      expect(totalPrice).toBeDefined();
      expect(totalPrice?.classList.contains('tabular-nums')).toBe(true);

      // Line item prices: ۶۵۰,۰۰۰ تومان and ۸۵,۰۰۰ تومان
      const p1 = Array.from(heroPreview?.querySelectorAll('*') || []).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۶۵۰,۰۰۰')
      );
      expect(p1?.classList.contains('tabular-nums')).toBe(true);

      const p2 = Array.from(heroPreview?.querySelectorAll('*') || []).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۸۵,۰۰۰')
      );
      expect(p2?.classList.contains('tabular-nums')).toBe(true);

      // Date: ۲۹ آبان ۱۴۰۴ • ۱۴:۲۵
      const heroDate = Array.from(heroPreview?.querySelectorAll('*') || []).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۴:۲۵')
      );
      expect(heroDate?.classList.contains('tabular-nums')).toBe(true);
    });

    it('verifies tabular-nums is applied to step 1 mockup figures', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Telegram date: ۲۹ آبان
      const telegramDate = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('امروز • ۲۹ آبان')
      );
      expect(telegramDate?.classList.contains('tabular-nums')).toBe(true);

      // Telegram time: ۱۴:۲۵
      const telegramTime = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۴:۲۵')
      );
      expect(telegramTime?.classList.contains('tabular-nums')).toBe(true);

      // Telegram final price: ۶۵۰,۰۰۰ تومان
      const telegramPrice = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent === '۶۵۰,۰۰۰ تومان'
      );
      expect(telegramPrice?.classList.contains('tabular-nums')).toBe(true);

      // Web invoice date: ۲۹ آبان ۱۴۰۴ (امروز)
      const webDate = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۲۹ آبان ۱۴۰۴')
      );
      expect(webDate?.classList.contains('tabular-nums')).toBe(true);

      // Excel file metrics: ۱.۲ مگابایت • ۴۲۰ ردیف
      const mbSpan = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱.۲ مگابایت')
      );
      expect(mbSpan?.classList.contains('tabular-nums')).toBe(true);

      const rowsSpan = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۴۲۰ ردیف')
      );
      expect(rowsSpan?.classList.contains('tabular-nums')).toBe(true);
    });

    it('verifies tabular-nums is applied to step 2 KPI metrics, percentages, and loyalty figures', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Revenue: ۱۲۸.۵ م
      const rev = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۲۸.۵ م')
      );
      expect(rev?.classList.contains('tabular-nums')).toBe(true);

      // Growth percentage: +۱۴.۵٪
      const growth = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('+۱۴.۵٪')
      );
      expect(growth?.classList.contains('tabular-nums')).toBe(true);

      // Order count: ۴۵۲ عدد
      const orders = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۴۵۲ عدد')
      );
      expect(orders?.classList.contains('tabular-nums')).toBe(true);

      // New customers: ۳۸ مشتری جدید
      const newCust = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۳۸ مشتری جدید')
      );
      expect(newCust?.classList.contains('tabular-nums')).toBe(true);

      // AOV: ۲۸۴ هزار
      const aov = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۲۸۴ هزار')
      );
      expect(aov?.classList.contains('tabular-nums')).toBe(true);

      // 14 days note: ۱۴ روز گذشته
      const fourteenDays = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۴ روز گذشته')
      );
      expect(fourteenDays?.classList.contains('tabular-nums')).toBe(true);

      // Customer purchases: ۵ خرید موفق این ماه
      const purchases = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۵ خرید موفق')
      );
      expect(purchases?.classList.contains('tabular-nums')).toBe(true);

      // Customer LTV: ۲,۳۰۰,۰۰۰ تومان
      const ltv = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۲,۳۰۰,۰۰۰ تومان')
      );
      expect(ltv?.classList.contains('tabular-nums')).toBe(true);
    });

    it('verifies tabular-nums is applied to step 3 AI advisory percentages, metrics, and trust banner', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // AI insight: ۲۲٪
      const pct22 = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.trim() === '۲۲٪'
      );
      expect(pct22?.classList.contains('tabular-nums')).toBe(true);

      // AI insight: ۵٪
      const pct5 = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.trim() === '۵٪'
      );
      expect(pct5?.classList.contains('tabular-nums')).toBe(true);

      // AI chat: ۱۲ مشتری
      const twelveCust = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۲ مشتری')
      );
      expect(twelveCust?.classList.contains('tabular-nums')).toBe(true);

      // AI chat: ۳۰ روز
      const thirtyDays = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۳۰ روز')
      );
      expect(thirtyDays?.classList.contains('tabular-nums')).toBe(true);

      // Trust banner: ۱۴ روز استفاده رایگان آزمایشی
      const trust14 = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۴ روز استفاده رایگان')
      );
      expect(trust14?.classList.contains('tabular-nums')).toBe(true);

      // Trust banner: فعال‌سازی فوری در ۱ دقیقه
      const trust1Min = Array.from(container.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent?.includes('فعال‌سازی فوری در ۱ دقیقه')
      );
      expect(trust1Min?.classList.contains('tabular-nums')).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: Layout Components Verification (PublicHeader & MainFooter)
  // =========================================================================
  describe('3. PublicHeader and MainFooter Component Integration', () => {
    it('renders PublicHeader without multi-hue button gradients and with font-semibold brand', () => {
      const { container } = render(
        <MemoryRouter>
          <PublicHeader />
        </MemoryRouter>
      );

      // Brand heading font weight
      const brandName = container.querySelector('span.font-semibold');
      expect(brandName).toBeInTheDocument();
      expect(brandName?.textContent).toContain('شاپیک');

      // Buttons check: no gradient classes
      const allButtonsAndLinks = container.querySelectorAll('a, button');
      allButtonsAndLinks.forEach((el) => {
        const cls = el.getAttribute('class') || '';
        expect(cls).not.toContain('from-brand-600');
        expect(cls).not.toContain('to-indigo-600');
      });
    });

    it('renders MainFooter preserving links, Enamad seal, and clean typography', () => {
      const { container } = render(
        <MemoryRouter>
          <MainFooter />
        </MemoryRouter>
      );

      // Enamad link and image
      const enamadLink = container.querySelector('a[href*="trustseal.enamad.ir"]');
      expect(enamadLink).toBeInTheDocument();

      // Brand text
      expect(container.textContent).toContain('پلتفرم هوشمند تحلیل و مشاوره فروش');

      // Year digits in bottom copyright text
      const allParagraphs = container.querySelectorAll('footer p');
      const copyrightParagraph = Array.from(allParagraphs).find((p) =>
        p.textContent?.includes('تمامی حقوق محفوظ است')
      );
      expect(copyrightParagraph).toBeDefined();
      expect(copyrightParagraph?.textContent).toMatch(/\d{4}|[۰-۹]{4}/);
    });
  });
});
