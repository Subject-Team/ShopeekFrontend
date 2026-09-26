// @test-type component
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BlogSEO } from '../BlogSEO';

const ogImage = () => document.querySelector('meta[property="og:image"]')?.getAttribute('content');
const twitterImage = () => document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

describe('[component] BlogSEO', () => {
  it('uses the given raster card for og:image and twitter:image', () => {
    render(<BlogSEO title="عنوان" description="توضیح" canonicalPath="/blog/sample" image="/images/blog/sample.og.png" />);

    expect(ogImage()).toBe('https://shopeekapp.ir/images/blog/sample.og.png');
    expect(twitterImage()).toBe('https://shopeekapp.ir/images/blog/sample.og.png');
  });

  // Regression: posts used to point og:image at their SVG featured image. OG
  // crawlers render raster formats only, so every shared blog link showed no
  // preview image.
  it('never emits an SVG card, falling back to the site-wide PNG', () => {
    render(<BlogSEO title="عنوان" description="توضیح" canonicalPath="/blog/sample" image="/images/blog/sample.SVG" />);

    expect(ogImage()).toBe('https://shopeekapp.ir/images/opengraph-image.png');
    expect(ogImage()).not.toMatch(/\.svg$/i);
  });

  it('defaults to the site-wide raster card', () => {
    render(<BlogSEO title="عنوان" description="توضیح" canonicalPath="/blog" />);

    expect(ogImage()).toBe('https://shopeekapp.ir/images/opengraph-image.png');
  });

  it('passes absolute image URLs through untouched', () => {
    render(
      <BlogSEO
        title="عنوان"
        description="توضیح"
        canonicalPath="/blog/sample"
        image="https://cdn.example.com/card.jpg"
      />
    );

    expect(ogImage()).toBe('https://cdn.example.com/card.jpg');
  });
});
