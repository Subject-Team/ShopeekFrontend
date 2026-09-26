// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LatestArticleCard } from '../LatestArticleCard';
import type { BlogPost } from '../../../data/blog/types';
import { getCategoryName } from '../../../data/blog/categories';
import { toPersianDigits } from '../../../utils/persian';

const mockState = vi.hoisted(() => ({ posts: [] as BlogPost[] }));

vi.mock('../../../data/blog/posts', () => ({
  get BLOG_POSTS() {
    return mockState.posts;
  },
}));

describe('[component] LatestArticleCard', () => {
  beforeEach(() => {
    mockState.posts = [];
  });

  it('renders the newest post by isoPublishedAt regardless of array order', async () => {
    const { BLOG_POSTS: realPosts } = await vi.importActual<typeof import('../../../data/blog/posts')>(
      '../../../data/blog/posts'
    );
    // Deliberately reverse the array: selection must be date-based, not order-based.
    mockState.posts = [...realPosts].reverse();

    const newest = realPosts.reduce((a, b) =>
      Date.parse(b.isoPublishedAt) > Date.parse(a.isoPublishedAt) ? b : a
    );

    render(
      <MemoryRouter>
        <LatestArticleCard />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'آخرین مقاله وبلاگ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: newest.title })).toBeInTheDocument();
    expect(screen.getByText(newest.excerpt)).toBeInTheDocument();
    expect(screen.getByText(getCategoryName(newest.categorySlug))).toBeInTheDocument();
    expect(screen.getByText(newest.author.name)).toBeInTheDocument();
    expect(screen.getByText(`${toPersianDigits(newest.readingTimeMinutes)} دقیقه مطالعه`)).toBeInTheDocument();

    const continueLink = screen.getByRole('link', { name: 'ادامه مطلب' });
    expect(continueLink).toHaveAttribute('href', `/blog/${newest.slug}`);
    expect(screen.getByRole('link', { name: newest.title })).toHaveAttribute(
      'href',
      `/blog/${newest.slug}`
    );
  });

  it('renders nothing when BLOG_POSTS is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <LatestArticleCard />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});