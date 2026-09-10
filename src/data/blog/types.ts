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
  category: string;
  categorySlug: string;
  author: BlogAuthor;
  publishedAt: string;
  isoPublishedAt: string;
  readingTimeMinutes: number;
  featuredImage: string;
  imageAlt: string;
  keywords: string[];
  sections: BlogSection[];
  faq?: BlogFaqItem[];
}
