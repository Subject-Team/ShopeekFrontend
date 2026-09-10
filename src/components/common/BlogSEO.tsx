import React, { useEffect } from 'react';
import { BlogPost } from '../../data/blog/types';

interface BlogSEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  type?: 'website' | 'article';
  image?: string;
  post?: BlogPost;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({
  title,
  description,
  canonicalPath,
  type = 'website',
  image = '/images/logo.svg',
  post,
}) => {
  useEffect(() => {
    const baseUrl = 'https://shopeekapp.ir';
    const fullCanonicalUrl = `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;

    // 1. Document Title
    const formattedTitle = title.includes('شاپیک') ? title : `${title} | شاپیک`;
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Standard Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', fullImageUrl);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'شاپیک');
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'fa_IR');

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', fullImageUrl);

    // 6. JSON-LD Structured Data
    const scriptId = 'blog-jsonld-schema';
    let existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';

    let schemaData: Record<string, unknown>;

    if (type === 'article' && post) {
      schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'صفحه اصلی',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'وبلاگ',
                item: `${baseUrl}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: fullCanonicalUrl,
              },
            ],
          },
          {
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.metaDescription,
            image: fullImageUrl,
            datePublished: post.isoPublishedAt,
            dateModified: post.isoPublishedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': fullCanonicalUrl,
            },
            author: {
              '@type': 'Organization',
              name: post.author.name,
              url: baseUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: 'شاپیک',
              url: baseUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/images/logo.svg`,
              },
            },
            keywords: post.keywords.join(', '),
          },
        ],
      };
    } else {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'وبلاگ و مقالات تحلیلی شاپیک',
        description: description,
        url: fullCanonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'شاپیک',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo.svg`,
          },
        },
      };
    }

    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const cleanupScript = document.getElementById(scriptId);
      if (cleanupScript) {
        cleanupScript.remove();
      }
    };
  }, [title, description, canonicalPath, type, image, post]);

  return null;
};
