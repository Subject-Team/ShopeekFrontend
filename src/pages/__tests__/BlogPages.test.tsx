import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BlogPage } from '../BlogPage';
import { BlogPostPage } from '../BlogPostPage';
import { BLOG_POSTS } from '../../data/blog/posts';

describe('Blog Pages', () => {
  beforeEach(() => {
    // Clean up any injected ld+json script before each test
    const script = document.getElementById('blog-jsonld-schema');
    if (script) {
      script.remove();
    }
  });

  describe('BlogPage (/blog)', () => {
    it('renders BlogPage with exactly one H1 and proper title', () => {
      render(
        <MemoryRouter>
          <BlogPage />
        </MemoryRouter>
      );

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBe(1);
      expect(h1Elements[0]).toHaveTextContent('مقالات و راهنمای تحلیل فروش کسب‌وکار');
      expect(document.title).toContain('شاپیک');
    });

    it('renders search input and category filter buttons', () => {
      render(
        <MemoryRouter>
          <BlogPage />
        </MemoryRouter>
      );

      expect(
        screen.getByPlaceholderText('جستجو در عناوین، مباحث یا کلمات کلیدی مقالات...')
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'همه مقالات' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'تحلیل فروش' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'مدیریت مالی' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'مدیریت مشتریان' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ابزارهای هوشمند' })).toBeInTheDocument();
    });

    it('filters articles by search term', () => {
      render(
        <MemoryRouter>
          <BlogPage />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(
        'جستجو در عناوین، مباحث یا کلمات کلیدی مقالات...'
      );

      fireEvent.change(searchInput, { target: { value: 'RFM' } });

      expect(screen.getByText(/تحلیل RFM و وفادارسازی مشتریان/i)).toBeInTheDocument();
      expect(screen.queryByText(/۵ اشتباه رایج در محاسبه سود و زیان/i)).not.toBeInTheDocument();
    });

    it('injects JSON-LD script for Blog schema', () => {
      render(
        <MemoryRouter>
          <BlogPage />
        </MemoryRouter>
      );

      const script = document.getElementById('blog-jsonld-schema');
      expect(script).not.toBeNull();
      expect(script?.textContent).toContain('Blog');
      expect(script?.textContent).toContain('https://shopeekapp.ir/blog');
    });
  });

  describe('BlogPostPage (/blog/:slug)', () => {
    it('renders BlogPostPage with single H1 matching post title and breadcrumb', () => {
      const firstPost = BLOG_POSTS[0];

      render(
        <MemoryRouter initialEntries={[`/blog/${firstPost.slug}`]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      );

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBe(1);
      expect(h1Elements[0]).toHaveTextContent(firstPost.title);

      // Breadcrumbs
      const breadcrumbNav = screen.getByRole('navigation', { name: 'راهنمای مسیر' });
      expect(breadcrumbNav).toBeInTheDocument();
      expect(within(breadcrumbNav).getByText('صفحه اصلی')).toBeInTheDocument();
      expect(within(breadcrumbNav).getByText('وبلاگ')).toBeInTheDocument();
    });

    it('renders table of contents and article sections', () => {
      const firstPost = BLOG_POSTS[0];

      render(
        <MemoryRouter initialEntries={[`/blog/${firstPost.slug}`]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(
        screen.getByRole('navigation', { name: 'فهرست مطالب مقاله' })
      ).toBeInTheDocument();

      // Check section titles
      firstPost.sections.forEach((section) => {
        expect(screen.getAllByText(section.title).length).toBeGreaterThan(0);
      });
    });

    it('injects BlogPosting and BreadcrumbList JSON-LD schema', () => {
      const firstPost = BLOG_POSTS[0];

      render(
        <MemoryRouter initialEntries={[`/blog/${firstPost.slug}`]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      );

      const script = document.getElementById('blog-jsonld-schema');
      expect(script).not.toBeNull();
      expect(script?.textContent).toContain('BlogPosting');
      expect(script?.textContent).toContain('BreadcrumbList');
      expect(script?.textContent).toContain(firstPost.slug);
    });

    it('redirects to /blog when post slug is not found', () => {
      render(
        <MemoryRouter initialEntries={['/blog/non-existent-article-slug']}>
          <Routes>
            <Route path="/blog" element={<div>صفحه وبلاگ هدایت شد</div>} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('صفحه وبلاگ هدایت شد')).toBeInTheDocument();
    });
  });
});
