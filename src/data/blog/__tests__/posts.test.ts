// @test-type unit
import { describe, it, expect } from 'vitest';
import { BLOG_POSTS, getPostsByDateDesc, getFeaturedPost } from '../posts';
import { BLOG_CATEGORIES, getCategoryName } from '../categories';
import type { BlogPost } from '../types';

const makePost = (
  overrides: Partial<BlogPost> & Pick<BlogPost, 'slug' | 'isoPublishedAt'>
): BlogPost => ({
  title: 'عنوان',
  metaTitle: 'عنوان',
  metaDescription: 'توضیح',
  excerpt: 'خلاصه',
  categorySlug: 'sales-analytics',
  author: { name: 'نویسنده', role: 'نقش', avatar: '/images/logo.svg' },
  publishedAt: '۱ مهر ۱۴۰۵',
  readingTimeMinutes: 5,
  featuredImage: '/images/blog/sample.svg',
  imageAlt: 'تصویر',
  keywords: [],
  sections: [],
  ...overrides,
});

describe('[unit] getPostsByDateDesc', () => {
  it('orders posts newest first regardless of input order', () => {
    const posts = [
      makePost({ slug: 'old', isoPublishedAt: '2026-01-01T08:00:00+03:30' }),
      makePost({ slug: 'new', isoPublishedAt: '2026-09-17T16:00:00+03:30' }),
      makePost({ slug: 'mid', isoPublishedAt: '2026-05-02T08:00:00+03:30' }),
    ];

    expect(getPostsByDateDesc(posts).map((p) => p.slug)).toEqual(['new', 'mid', 'old']);
  });

  it('does not mutate the array it is given', () => {
    const posts = [
      makePost({ slug: 'old', isoPublishedAt: '2026-01-01T08:00:00+03:30' }),
      makePost({ slug: 'new', isoPublishedAt: '2026-09-17T16:00:00+03:30' }),
    ];

    getPostsByDateDesc(posts);

    expect(posts.map((p) => p.slug)).toEqual(['old', 'new']);
  });

  it('returns the real catalog newest first', () => {
    const sorted = getPostsByDateDesc();
    const dates = sorted.map((p) => Date.parse(p.isoPublishedAt));

    expect(sorted).toHaveLength(BLOG_POSTS.length);
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
  });
});

describe('[unit] getFeaturedPost', () => {
  it('prefers a flagged post over the newest one', () => {
    const posts = [
      makePost({ slug: 'newest', isoPublishedAt: '2026-09-17T16:00:00+03:30' }),
      makePost({
        slug: 'flagged',
        isoPublishedAt: '2026-01-01T08:00:00+03:30',
        featured: true,
      }),
    ];

    expect(getFeaturedPost(posts)?.slug).toBe('flagged');
  });

  it('picks the newest among several flagged posts', () => {
    const posts = [
      makePost({
        slug: 'flagged-old',
        isoPublishedAt: '2026-01-01T08:00:00+03:30',
        featured: true,
      }),
      makePost({
        slug: 'flagged-new',
        isoPublishedAt: '2026-09-17T16:00:00+03:30',
        featured: true,
      }),
    ];

    expect(getFeaturedPost(posts)?.slug).toBe('flagged-new');
  });

  it('falls back to the newest post when nothing is flagged', () => {
    const posts = [
      makePost({ slug: 'old', isoPublishedAt: '2026-01-01T08:00:00+03:30' }),
      makePost({ slug: 'new', isoPublishedAt: '2026-09-17T16:00:00+03:30' }),
    ];

    expect(getFeaturedPost(posts)?.slug).toBe('new');
  });

  it('returns undefined for an empty catalog', () => {
    expect(getFeaturedPost([])).toBeUndefined();
  });

  it('features exactly one post in the real catalog', () => {
    expect(BLOG_POSTS.filter((p) => p.featured)).toHaveLength(1);
    expect(getFeaturedPost()?.featured).toBe(true);
  });
});

describe('[unit] category slugs', () => {
  it('resolves a known slug to its Persian label', () => {
    expect(getCategoryName('financial-management')).toBe('مدیریت مالی');
  });

  it('falls back to the slug when it is unknown', () => {
    expect(getCategoryName('not-a-real-category')).toBe('not-a-real-category');
  });

  it('has no duplicate slugs or ids', () => {
    const slugs = BLOG_CATEGORIES.map((c) => c.slug);
    const ids = BLOG_CATEGORIES.map((c) => c.id);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every post a slug that resolves to a real category', () => {
    const known = new Set(BLOG_CATEGORIES.map((c) => c.slug));

    for (const post of BLOG_POSTS) {
      expect(known).toContain(post.categorySlug);
    }
  });
});
