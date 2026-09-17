#!/usr/bin/env node
/**
 * Regenerates public/sitemap.txt from the blog post slugs in
 * src/data/blog/posts.ts plus the static public route list.
 *
 * Dependency-free on purpose: plain Node fs + a regex over the BLOG_POSTS
 * array, so it runs in `prebuild` without a TS toolchain. New blog posts are
 * picked up automatically — the sitemap can't rot again.
 *
 * Run manually:  node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_PATH = join(ROOT, 'src', 'data', 'blog', 'posts.ts');
const SITEMAP_PATH = join(ROOT, 'public', 'sitemap.txt');

const BASE_URL = 'https://shopeekapp.ir';

// Static public routes (keep in sync with the public routes in src/App.tsx).
const PUBLIC_ROUTES = ['/', '/login', '/contact', '/privacy-policy', '/plans', '/legal', '/blog'];

const source = readFileSync(POSTS_PATH, 'utf8');

// Only read slugs from the BLOG_POSTS array — BLOG_CATEGORIES also declares
// `slug: '...'` entries and must be excluded, so slice from the BLOG_POSTS
// declaration onward.
const postsStart = source.indexOf('export const BLOG_POSTS');
if (postsStart === -1) {
  throw new Error('Could not find "export const BLOG_POSTS" in src/data/blog/posts.ts');
}
const postsSection = source.slice(postsStart);
const postSlugs = [...postsSection.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);

if (postSlugs.length === 0) {
  throw new Error('No blog post slugs found in src/data/blog/posts.ts');
}

const urls = [
  ...PUBLIC_ROUTES.map((route) => `${BASE_URL}${route}`),
  ...postSlugs.map((slug) => `${BASE_URL}/blog/${slug}`),
];

writeFileSync(SITEMAP_PATH, `${urls.join('\n')}\n`);
console.log(`Regenerated ${SITEMAP_PATH}: ${urls.length} URLs (${postSlugs.length} blog posts)`);