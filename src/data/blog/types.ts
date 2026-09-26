export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface BlogSection {
  id: string;
  title: string;
  content: string[];
  subsections?: {
    title: string;
    content: string[];
  }[];
  callout?: {
    type: 'tip' | 'info' | 'warning';
    title?: string;
    text: string;
  };
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  categorySlug: string;
  author: BlogAuthor;
  publishedAt: string;
  isoPublishedAt: string;
  readingTimeMinutes: number;
  /** Pins the post to the blog hero slot; see `getFeaturedPost`. */
  featured?: boolean;
  featuredImage: string;
  /**
   * Raster (PNG) twin of `featuredImage`, used for `og:image` / `twitter:image`.
   * Must not be an SVG: Open Graph crawlers only render JPEG/PNG/GIF/WEBP, so an
   * SVG card is silently dropped and the shared link shows no preview image.
   * Regenerate the assets with `node scripts/generate-blog-og-images.mjs`.
   */
  ogImage: string;
  imageAlt: string;
  keywords: string[];
  sections: BlogSection[];
  faq?: BlogFaqItem[];
}
