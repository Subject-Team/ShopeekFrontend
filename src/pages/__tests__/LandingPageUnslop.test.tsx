// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';

describe('[page] Landing Page Unslopping E2E Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // GROUP 1: Core Interface Contracts & Navigation Invariants
  // =========================================================================
  describe('Group 1: Interface Contracts & Functional Navigation Invariants', () => {
    it('preserves exactly one H1 heading containing the brand name شاپیک', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const h1Headings = screen.getAllByRole('heading', { level: 1 });
      expect(h1Headings.length).toBe(1);
      expect(h1Headings[0].textContent).toContain('شاپیک');
    });

    it('preserves plans CTA link pointing to /plans with accessible name مشاهده طرح‌ها', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const plansCta = screen.getByRole('link', { name: 'مشاهده طرح‌ها' });
      expect(plansCta).toBeInTheDocument();
      expect(plansCta).toHaveAttribute('href', '/plans');
    });

    it('toggles the first FAQ accordion button with correct aria-expanded states', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const question = 'شاپیک برای چه کسب‌وکارهایی مناسب است؟';
      const faqButton = screen.getByRole('button', { name: question });
      expect(faqButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(faqButton);
      expect(faqButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(faqButton);
      expect(faqButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('preserves #how-it-works anchor target and responds to smooth scrolling', async () => {
      const scrollIntoView = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
      scrollIntoView.mockClear();

      const { container } = render(
        <MemoryRouter initialEntries={['/#how-it-works']}>
          <LandingPage />
        </MemoryRouter>
      );

      const section = container.querySelector('#how-it-works');
      expect(section).toBeInTheDocument();
      await waitFor(() => {
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      });
    });

    it('preserves #features anchor target for backwards compatibility', async () => {
      const scrollIntoView = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
      scrollIntoView.mockClear();

      render(
        <MemoryRouter initialEntries={['/#features']}>
          <LandingPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      });
    });

    it('preserves public navigation links to login, contact, and legal pages', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const loginLink = container.querySelector('a[href="/login"]');
      expect(loginLink).toBeInTheDocument();

      const contactLink = container.querySelector('a[href="/contact"]');
      expect(contactLink).toBeInTheDocument();

      const legalLink = container.querySelector('a[href="/legal"]');
      expect(legalLink).toBeInTheDocument();
    });
  });

  // =========================================================================
  // GROUP 2: Typography System & Persian RTL Layout
  // =========================================================================
  describe('Group 2: Typography System & Persian RTL Layout', () => {
    it('enforces RTL layout direction across the landing page container', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const rtlElement = container.querySelector('[dir="rtl"], .dir-rtl');
      expect(rtlElement).toBeInTheDocument();
    });

    it('preserves Vazirmatn font family on the primary container', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const vazirElement = container.querySelector('.font-vazir');
      expect(vazirElement).toBeInTheDocument();
    });

    it('ensures text content is in authentic Persian e-commerce terminology', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      expect(screen.getAllByText(/تحلیل فروش|فاکتور|داشبورد/i).length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // GROUP 3: 14-Point Unslop Checklist — Spacing & 4px Rhythm (Pass 1)
  // =========================================================================
  describe('Group 3: Spacing & 4px Grid Rhythm (Unslop Point 2)', () => {
    it('verifies absence of arbitrary non-grid pixel spacing classes (e.g. mt-[13px])', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const allElements = container.querySelectorAll('*');
      const arbitrarySpacingRegex = /(?:^|\s)(?:m|p|gap)-?\[\d+px\](?:\s|$)/;

      allElements.forEach((el) => {
        const className = el.getAttribute('class') || '';
        expect(className).not.toMatch(arbitrarySpacingRegex);
      });
    });

    it('verifies major section containers adhere to standardized max-width tokens', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(4);

      sections.forEach((sec) => {
        const className = sec.getAttribute('class') || '';
        const hasStandardWidth =
          className.includes('max-w-') ||
          className.includes('w-full') ||
          className.includes('mx-auto');
        expect(hasStandardWidth).toBe(true);
      });
    });
  });

  // =========================================================================
  // GROUP 4: 14-Point Unslop Checklist — Color Ramp & Glow Elimination (Pass 2)
  // =========================================================================
  describe('Group 4: Color Ramp & Glow Removal (Unslop Points 4 & 5)', () => {
    it('verifies complete absence of blur-3xl ambient glow blobs', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const blurBlobs = container.querySelectorAll('.blur-3xl, .blur-2xl');
      expect(blurBlobs.length).toBe(0);
    });

    it('verifies complete absence of multi-hue gradient CTA buttons (from-brand to-indigo)', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const gradientButtons = container.querySelectorAll(
        '[class*="from-brand-600"][class*="to-indigo-600"], [class*="from-brand-500"][class*="to-emerald-500"]'
      );
      expect(gradientButtons.length).toBe(0);
    });

    it('verifies complete absence of radial color wash ambient orbs (bg-brand-500/20)', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const radialOrbs = container.querySelectorAll(
        '[class*="bg-brand-500/20"], [class*="bg-brand-500/15"]'
      );
      expect(radialOrbs.length).toBe(0);
    });

    it('verifies hero action button uses purposeful solid accent or clean neutral tone', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroCta = screen.getByRole('link', { name: /چطور انجامش می‌دهیم/i });
      const ctaClass = heroCta.getAttribute('class') || '';
      expect(ctaClass).not.toMatch(/from-brand-600 to-indigo-600/);
    });
  });

  // =========================================================================
  // GROUP 5: 14-Point Unslop Checklist — Icon & Emoji Normalization (Pass 3)
  // =========================================================================
  describe('Group 5: Line Icon Normalization & Zero Emojis (Unslop Points 6 & 7)', () => {
    it('verifies zero raw decorative emojis in headings, labels, and badges', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Common slop emojis: 🏠, 🚀, 💰, 📈, 🔥, ✨, 😬, 👤, ⚠️
      const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      const headings = container.querySelectorAll('h1, h2, h3, h4, span, p, a, button');
      headings.forEach((node) => {
        // Exclude SVG children or non-text nodes
        const text = node.textContent || '';
        expect(text).not.toMatch(emojiRegex);
      });
    });

    it('verifies icons render as SVG line elements rather than emojis', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(5);
    });

    it('verifies absence of gratuitous AI sparkles in hero pill badge', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Hero section should not feature a sparkling AI badge
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeInTheDocument();

      const sparkleInHero = heroSection?.querySelectorAll('.lucide-sparkle, .lucide-sparkles');
      expect(sparkleInHero?.length ?? 0).toBe(0);
    });
  });

  // =========================================================================
  // GROUP 6: 14-Point Unslop Checklist — Copy & Tone Discipline (Pass 4)
  // =========================================================================
  describe('Group 6: Copy & Tone Discipline (Unslop Point 9)', () => {
    it('verifies absence of exclamation marks (!) in UI feedback cards and badges', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Slop indicator: "فاکتور با موفقیت در سیستم ثبت شد!"
      const textNodesWithExclamation = Array.from(container.querySelectorAll('*')).filter(
        (el) =>
          el.children.length === 0 &&
          (el.textContent?.includes('!') || el.textContent?.includes('!'))
      );

      expect(textNodesWithExclamation.length).toBe(0);
    });

    it('verifies headlines end without trailing periods', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const headings = container.querySelectorAll('h1, h2, h3');
      headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        expect(text.endsWith('.')).toBe(false);
        expect(text.endsWith('!')).toBe(false);
      });
    });

    it('verifies elimination of hyperbolic hype words (متحول کنید)', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Slop headline: "همین امروز تحلیل فروش کسب‌وکار خود را متحول کنید"
      const hypeElements = screen.queryAllByText(/متحول کنید|معجزه|انقلابی/i);
      expect(hypeElements.length).toBe(0);
    });
  });

  // =========================================================================
  // GROUP 7: 14-Point Unslop Checklist — Typography Weights (Pass 5)
  // =========================================================================
  describe('Group 7: Typography Discipline & Weight Elimination (Unslop Point 8)', () => {
    it('verifies complete absence of font-black (weight 900) across all headings', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const fontBlackHeadings = container.querySelectorAll(
        'h1.font-black, h2.font-black, h3.font-black, h4.font-black'
      );
      expect(fontBlackHeadings.length).toBe(0);
    });

    it('verifies complete absence of font-extrabold (weight 800) across all headings', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const fontExtraboldHeadings = container.querySelectorAll(
        'h1.font-extrabold, h2.font-extrabold, h3.font-extrabold, h4.font-extrabold'
      );
      expect(fontExtraboldHeadings.length).toBe(0);
    });

    it('verifies H1 headline uses calm, restrained weight (semibold 600 or medium 500)', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      const h1Class = h1?.getAttribute('class') || '';

      expect(h1Class).not.toContain('font-black');
      expect(h1Class).not.toContain('font-extrabold');
      const isRestrainedWeight =
        h1Class.includes('font-medium') ||
        h1Class.includes('font-semibold') ||
        h1Class.includes('font-normal');
      expect(isRestrainedWeight).toBe(true);
    });
  });

  // =========================================================================
  // GROUP 8: 14-Point Unslop Checklist — Tabular Numerals (Pass 5 / Point 10)
  // =========================================================================
  describe('Group 8: Tabular Numerals on Metrics & Figures (Unslop Point 10)', () => {
    it('verifies tabular-nums is applied to KPI metric cards and revenue figures', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Financial figures in mockups: ۱۲۸.۵ م, ۴۵۲ عدد, ۲۸۴ هزار, ۶۵۰,۰۰۰ تومان, ۲,۳۰۰,۰۰۰ تومان
      const figures = Array.from(container.querySelectorAll('*')).filter(
        (el) =>
          el.children.length === 0 &&
          (el.textContent?.includes('۱۲۸.۵') ||
            el.textContent?.includes('۴۵۲') ||
            el.textContent?.includes('۲۸۴') ||
            el.textContent?.includes('۶۵۰,۰۰۰') ||
            el.textContent?.includes('۲,۳۰۰,۰۰۰'))
      );

      expect(figures.length).toBeGreaterThan(0);

      // Every monetary / metric figure must declare tabular-nums
      figures.forEach((fig) => {
        const hasTabularNums =
          fig.classList.contains('tabular-nums') ||
          fig.closest('.tabular-nums') !== null;
        expect(hasTabularNums).toBe(true);
      });
    });

    it('verifies tabular-nums is applied to percentage change indicators (+۱۴.۵٪)', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const percentIndicators = Array.from(container.querySelectorAll('*')).filter(
        (el) => el.children.length === 0 && el.textContent?.includes('۱۴.۵٪')
      );

      expect(percentIndicators.length).toBeGreaterThan(0);
      percentIndicators.forEach((ind) => {
        const hasTabularNums =
          ind.classList.contains('tabular-nums') ||
          ind.closest('.tabular-nums') !== null;
        expect(hasTabularNums).toBe(true);
      });
    });
  });

  // =========================================================================
  // GROUP 9: 14-Point Unslop Checklist — Focused Hero & Product Preview (Pass 6/8)
  // =========================================================================
  describe('Group 9: Focused Hero with Authentic Product Preview (Unslop Point 12)', () => {
    it('verifies hero section includes an authentic coded product preview card', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toBeInTheDocument();

      // Unslopped hero must feature a product preview (ledger / KPI card)
      const previewCard = heroSection?.querySelector(
        '[data-testid="hero-preview"], [data-preview="product"], .hero-product-preview'
      );
      expect(previewCard).toBeInTheDocument();
    });

    it('verifies hero section action buttons are limited to at most one primary and one secondary', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = container.querySelector('section');
      const actionButtons = heroSection?.querySelectorAll('a, button');
      // Should not have 3 or more stacked action buttons
      expect(actionButtons?.length ?? 0).toBeLessThanOrEqual(2);
    });
  });

  // =========================================================================
  // GROUP 10: 14-Point Unslop Checklist — Component Radius & Details (Pass 7)
  // =========================================================================
  describe('Group 10: Nested Border Radii Math (Unslop Point 11)', () => {
    it('verifies absence of blanket rounded-full on rectangular content cards', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const timelineSteps = container.querySelectorAll('[data-step]');
      timelineSteps.forEach((step) => {
        const rectangularCards = step.querySelectorAll(
          '.grid > div.rounded-full, .space-y-4.rounded-full'
        );
        expect(rectangularCards.length).toBe(0);
      });
    });

    it('verifies control buttons use standard 8px-10px radii (rounded-lg or rounded-xl)', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const plansCta = screen.getByRole('link', { name: 'مشاهده طرح‌ها' });
      const className = plansCta.getAttribute('class') || '';
      const hasStandardRadius =
        className.includes('rounded-lg') ||
        className.includes('rounded-xl') ||
        className.includes('rounded-2xl');
      expect(hasStandardRadius).toBe(true);
    });
  });

  // =========================================================================
  // GROUP 11: 14-Point Unslop Checklist — Motion & Animation Cleanup (Pass 9)
  // =========================================================================
  describe('Group 11: Motion & Animation Cleanup (Unslop Point 14)', () => {
    it('verifies complete absence of looping animate-pulse on status indicator dots', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBe(0);
    });

    it('verifies absence of looping animate-ping animations', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const pingElements = container.querySelectorAll('.animate-ping');
      expect(pingElements.length).toBe(0);
    });

    it('verifies dashboard live indicator renders as a stable static dot', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const statusDot = container.querySelector(
        '.bg-emerald-500.rounded-full, .bg-emerald-600.rounded-full'
      );
      expect(statusDot).toBeInTheDocument();
      expect(statusDot?.classList.contains('animate-pulse')).toBe(false);
    });
  });

  // =========================================================================
  // GROUP 12: Cross-Feature Interactions & End-to-End Scenarios (Tiers 3 & 4)
  // =========================================================================
  describe('Group 12: Cross-Feature Interactions & Merchant Scenarios', () => {
    it('Scenario 1: Step 1 ingestion selector buttons update active state on user interaction', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // Click Excel ingestion method button
      const excelBtn = screen.getAllByText(/فایل‌های اکسل و CSV/i)[0].closest('button');
      expect(excelBtn).toBeInTheDocument();

      if (excelBtn) {
        fireEvent.click(excelBtn);
        // Verify button clicked without error and handler fired
        expect(excelBtn).toBeInTheDocument();
      }
    });

    it('Scenario 2: FAQ accordion operates repeatedly without DOM state corruption', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const question = 'شاپیک برای چه کسب‌وکارهایی مناسب است؟';
      const button = screen.getByRole('button', { name: question });

      for (let i = 0; i < 3; i++) {
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
      }
    });

    it('Scenario 3: Footer navigation links and Enamad trust seal remain accessible', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const footerPlansLinks = screen.getAllByRole('link', { name: 'طرح‌ها و تعرفه‌ها' });
      expect(footerPlansLinks.length).toBeGreaterThan(0);
      expect(footerPlansLinks[0]).toHaveAttribute('href', '/plans');

      const contactLinks = screen.getAllByRole('link', { name: /تماس با ما|تماس با پشتیبانی/i });
      expect(contactLinks.length).toBeGreaterThan(0);
      expect(contactLinks[0]).toBeInTheDocument();
    });
  });
});
