import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonicalPath = '' }) => {
  useEffect(() => {
    const baseUrl = 'https://shopeekapp.ir';
    const fullCanonicalUrl = `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    // 1. Update Document Title
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

    // 2. Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. OpenGraph Tags
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }, [title, description, canonicalPath]);

  return null;
};
