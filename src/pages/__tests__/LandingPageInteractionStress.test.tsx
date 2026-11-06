// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { MainFooter } from '../../components/layout/MainFooter';

describe('[stress] Landing Page Interaction & Responsive Stress Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollY = 0;
  });

  // =========================================================================
  // 1. HERO PREVIEW CARD VERIFICATION
  // =========================================================================
  describe('1. Hero Preview Card & Action Elements', () => {
    it('verifies the presence of data-testid="hero-preview" inside the hero section', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toBeInTheDocument();

      const previewCard = heroSection?.querySelector('[data-testid="hero-preview"]');
      expect(previewCard).toBeInTheDocument();
    });

    it('verifies hero preview card contains exact invoice number #SHP-4082', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const previewCard = screen.getByTestId('hero-preview');
      expect(previewCard.textContent).toContain('#SHP-4082');
    });

    it('verifies hero preview card contains Jalali date and timestamp', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const previewCard = screen.getByTestId('hero-preview');
      expect(previewCard.textContent).toMatch(/۲۹ آبان ۱۴۰۴/);
      expect(previewCard.textContent).toMatch(/۱۴:۲۵/);
    });

    it('verifies hero preview card contains buyer name "علی رضایی"', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const previewCard = screen.getByTestId('hero-preview');
      expect(previewCard.textContent).toContain('علی رضایی');
      expect(previewCard.textContent).toContain('خریدار:');
    });

    it('verifies hero preview card contains itemized line items and individual prices', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const previewCard = screen.getByTestId('hero-preview');
      expect(previewCard.textContent).toContain('کفش چرم مردانه (۲ جفت)');
      expect(previewCard.textContent).toContain('۶۵۰,۰۰۰ تومان');
      expect(previewCard.textContent).toContain('واکس گیاهی مخصوص (۱ عدد)');
      expect(previewCard.textContent).toContain('۸۵,۰۰۰ تومان');
    });

    it('verifies hero preview card contains calculated total amount of ۷۳۵,۰۰۰ تومان', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const previewCard = screen.getByTestId('hero-preview');
      expect(previewCard.textContent).toContain('مبلغ کل پرداختی:');
      expect(previewCard.textContent).toContain('۷۳۵,۰۰۰ تومان');
    });

    it('verifies hero action buttons count is strictly <= 2 links/buttons', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toBeInTheDocument();

      // Find the hero actions container
      const heroActionsContainer = heroSection?.querySelector('div.flex.flex-col.sm\\:flex-row');
      expect(heroActionsContainer).toBeInTheDocument();

      const actionElements = heroActionsContainer?.querySelectorAll('a, button');
      expect(actionElements).toBeDefined();
      expect(actionElements!.length).toBe(2);

      // Verify exact destinations of the 2 action buttons
      const links = Array.from(actionElements!).map((el) => el.getAttribute('href'));
      expect(links).toContain('#how-it-works');
      expect(links).toContain('/login');
    });
  });

  // =========================================================================
  // 2. INTERACTIVE COMPONENTS: STEP 1 INGESTION TABS SWITCHING
  // =========================================================================
  describe('2. Ingestion Tabs Interactive Switching', () => {
    it('initializes with Telegram bot mockup in active state', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const telegramMock = container.querySelector('[data-mock-id="telegram"]');
      expect(telegramMock).toBeInTheDocument();
      expect(telegramMock?.className).toContain('border-[#00856f]');

      const webMock = container.querySelector('[data-mock-id="web"]');
      expect(webMock?.className).not.toContain('border-[#00856f]');

      const excelMock = container.querySelector('[data-mock-id="excel"]');
      expect(excelMock?.className).not.toContain('border-[#00856f]');
    });

    it('switches active mockup to web form when clicking direct website method', () => {
      const scrollIntoView = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
      scrollIntoView.mockClear();

      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const webTabButton = screen.getByRole('button', {
        name: /۲\. ثبت مستقیم در سایت/i,
      });

      fireEvent.click(webTabButton);

      const webMock = container.querySelector('[data-mock-id="web"]');
      expect(webMock?.className).toContain('border-[#00856f]');

      const telegramMock = container.querySelector('[data-mock-id="telegram"]');
      expect(telegramMock?.className).not.toContain('border-[#00856f]');

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    it('switches active mockup to excel dropzone when clicking bulk excel method', () => {
      const scrollIntoView = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
      scrollIntoView.mockClear();

      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const excelTabButton = screen.getByRole('button', {
        name: /۴\. بارگذاری دسته‌ای فایل‌های اکسل/i,
      });

      fireEvent.click(excelTabButton);

      const excelMock = container.querySelector('[data-mock-id="excel"]');
      expect(excelMock?.className).toContain('border-[#00856f]');

      const telegramMock = container.querySelector('[data-mock-id="telegram"]');
      expect(telegramMock?.className).not.toContain('border-[#00856f]');

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    it('switches active mockup back to telegram when clicking telegram method', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      // First click excel
      const excelTabButton = screen.getByRole('button', {
        name: /۴\. بارگذاری دسته‌ای فایل‌های اکسل/i,
      });
      fireEvent.click(excelTabButton);

      // Then click back to telegram
      const telegramTabButton = screen.getByRole('button', {
        name: /۱\. ربات هوشمند تلگرام/i,
      });
      fireEvent.click(telegramTabButton);

      const telegramMock = container.querySelector('[data-mock-id="telegram"]');
      expect(telegramMock?.className).toContain('border-[#00856f]');

      const excelMock = container.querySelector('[data-mock-id="excel"]');
      expect(excelMock?.className).not.toContain('border-[#00856f]');
    });

    it('survives rapid tab cycling stress test without corruption', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const telegramTab = screen.getByRole('button', { name: /۱\. ربات هوشمند تلگرام/i });
      const webTab = screen.getByRole('button', { name: /۲\. ثبت مستقیم در سایت/i });
      const pwaTab = screen.getByRole('button', { name: /۳\. گوشی موبایل/i });
      const excelTab = screen.getByRole('button', { name: /۴\. بارگذاری دسته‌ای فایل‌های اکسل/i });

      // Rapidly fire tab switches
      for (let i = 0; i < 5; i++) {
        fireEvent.click(webTab);
        fireEvent.click(excelTab);
        fireEvent.click(pwaTab);
        fireEvent.click(telegramTab);
      }

      // Final state must reliably be telegram
      const telegramMock = container.querySelector('[data-mock-id="telegram"]');
      expect(telegramMock?.className).toContain('border-[#00856f]');
    });
  });

  // =========================================================================
  // 3. INTERACTIVE COMPONENTS: FAQ ACCORDION TOGGLE & ARIA
  // =========================================================================
  describe('3. FAQ Accordion Toggle Behavior & ARIA Specification', () => {
    it('verifies all FAQ accordion triggers have initial aria-expanded="false"', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const faqButtons = screen.getAllByRole('button', { name: /\؟/ });
      expect(faqButtons.length).toBeGreaterThan(0);

      faqButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('toggles a single FAQ item open and closed with aria-expanded updates', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const faqButtons = screen.getAllByRole('button', { name: /\؟/ });
      const firstFaq = faqButtons[0];

      // Open
      fireEvent.click(firstFaq);
      expect(firstFaq).toHaveAttribute('aria-expanded', 'true');

      // Close
      fireEvent.click(firstFaq);
      expect(firstFaq).toHaveAttribute('aria-expanded', 'false');
    });

    it('enforces single-open behavior: opening second FAQ item collapses the first', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const faqButtons = screen.getAllByRole('button', { name: /\؟/ });
      expect(faqButtons.length).toBeGreaterThanOrEqual(2);

      const firstFaq = faqButtons[0];
      const secondFaq = faqButtons[1];

      // Open first
      fireEvent.click(firstFaq);
      expect(firstFaq).toHaveAttribute('aria-expanded', 'true');
      expect(secondFaq).toHaveAttribute('aria-expanded', 'false');

      // Open second
      fireEvent.click(secondFaq);
      expect(firstFaq).toHaveAttribute('aria-expanded', 'false');
      expect(secondFaq).toHaveAttribute('aria-expanded', 'true');
    });

    it('survives rapid consecutive toggling across all FAQ items', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );

      const faqButtons = screen.getAllByRole('button', { name: /\؟/ });

      // Rapidly toggle each FAQ item
      faqButtons.forEach((btn) => {
        fireEvent.click(btn);
        expect(btn).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(btn);
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  // =========================================================================
  // 4. PUBLIC HEADER MOBILE DRAWER & SCROLL BEHAVIOR
  // =========================================================================
  describe('4. PublicHeader Mobile Drawer & Dynamic Scroll Behavior', () => {
    it('renders hamburger button with aria-label="منوی سایت"', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <PublicHeader />
        </MemoryRouter>
      );

      const hamburgerBtn = screen.getByRole('button', { name: 'منوی سایت' });
      expect(hamburgerBtn).toBeInTheDocument();
    });

    it('toggles mobile drawer when hamburger button is clicked', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <PublicHeader />
        </MemoryRouter>
      );

      const hamburgerBtn = screen.getByRole('button', { name: 'منوی سایت' });

      // Initially closed: drawer has opacity-0 pointer-events-none
      const drawer = container.querySelector('.lg\\:hidden.fixed.inset-x-0');
      expect(drawer?.className).toContain('opacity-0');
      expect(drawer?.className).toContain('pointer-events-none');

      // Click to open
      fireEvent.click(hamburgerBtn);
      expect(drawer?.className).toContain('opacity-100');
      expect(drawer?.className).toContain('pointer-events-auto');

      // Click again to close
      fireEvent.click(hamburgerBtn);
      expect(drawer?.className).toContain('opacity-0');
    });

    it('closes mobile drawer when backdrop is clicked', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <PublicHeader />
        </MemoryRouter>
      );

      const hamburgerBtn = screen.getByRole('button', { name: 'منوی سایت' });
      fireEvent.click(hamburgerBtn);

      const backdrop = container.querySelector('.fixed.inset-0.bg-\\[\\#12110f\\]\\/40');
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);

      const drawer = container.querySelector('.lg\\:hidden.fixed.inset-x-0');
      expect(drawer?.className).toContain('opacity-0');
    });

    it('closes mobile drawer when a navigation link within it is clicked', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <PublicHeader />
        </MemoryRouter>
      );

      const hamburgerBtn = screen.getByRole('button', { name: 'منوی سایت' });
      fireEvent.click(hamburgerBtn);

      const plansDrawerLink = screen.getByRole('link', { name: /طرح‌ها و تعرفه‌ها/ });
      fireEvent.click(plansDrawerLink);

      const drawer = container.querySelector('.lg\\:hidden.fixed.inset-x-0');
      expect(drawer?.className).toContain('opacity-0');
    });

    it('dynamically adapts styling and exposes floating bar when scrolled past 20px', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <PublicHeader />
        </MemoryRouter>
      );

      const header = container.querySelector('header');
      expect(header?.className).toContain('bg-transparent');

      // Simulate scroll past 20px
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        fireEvent.scroll(window);
      });

      // Header switches to scrolled backdrop styling
      expect(header?.className).toContain('bg-[#fdfbf7]/85');
      expect(header?.className).toContain('backdrop-blur-md');

      // Floating mobile action bar becomes visible
      const floatingBar = container.querySelector('.fixed.top-3.left-4');
      expect(floatingBar?.className).toContain('opacity-100');
      expect(floatingBar?.className).toContain('translate-y-2');

      // Return to top
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        fireEvent.scroll(window);
      });

      expect(header?.className).toContain('bg-transparent');
      expect(floatingBar?.className).toContain('opacity-0');
    });
  });

  // =========================================================================
  // 5. MAIN FOOTER COMPLIANCE & LEGAL LINKS
  // =========================================================================
  describe('5. MainFooter Compliance & Social Navigation', () => {
    it('verifies footer renders copyright notice and official brand information', () => {
      render(
        <MemoryRouter>
          <MainFooter />
        </MemoryRouter>
      );

      expect(screen.getByText(/تمامی حقوق محفوظ است/)).toBeInTheDocument();
      expect(screen.getByText(/پلتفرم هوشمند تحلیل و مشاوره فروش/)).toBeInTheDocument();
    });

    it('verifies footer contains Enamad trust seal link with origin referrer policy', () => {
      const { container } = render(
        <MemoryRouter>
          <MainFooter />
        </MemoryRouter>
      );

      const enamadLink = container.querySelector('a[href*="trustseal.enamad.ir"]');
      expect(enamadLink).toBeInTheDocument();
      expect(enamadLink).toHaveAttribute('referrerPolicy', 'origin');
      expect(enamadLink).toHaveAttribute('target', '_blank');
    });

    it('verifies footer social channels are properly configured with external links', () => {
      const { container } = render(
        <MemoryRouter>
          <MainFooter />
        </MemoryRouter>
      );

      const telegramLink = container.querySelector('a[href="https://t.me/ShopeekApp"]');
      expect(telegramLink).toBeInTheDocument();
      expect(telegramLink).toHaveAttribute('target', '_blank');
      expect(telegramLink).toHaveAttribute('rel', 'noopener noreferrer');

      const instagramLink = container.querySelector('a[href="https://instagram.com/ShopeekApp"]');
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
