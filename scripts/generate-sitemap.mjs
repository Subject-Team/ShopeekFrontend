#!/usr/bin/env node
/**
 * Regenerates public/sitemap.txt from the blog posts in
 * src/data/blog/posts.ts plus the static public route list. Post URLs carry a
 * lastmod taken from their isoPublishedAt; static routes have no reliable
 * content date, so they get none.
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

// Read from the BLOG_POSTS array onward so only post entries are considered.
// Line-anchored so `categorySlug:` cannot be mistaken for `slug:`.
const postsStart = source.indexOf('export const BLOG_POSTS');
if (postsStart === -1) {
  throw new Error('Could not find "export const BLOG_POSTS" in src/data/blog/posts.ts');
}
const postsSection = source.slice(postsStart);

const postSlugs = [...postsSection.matchAll(/^[ \t]*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
const postDates = [...postsSection.matchAll(/^[ \t]*isoPublishedAt:\s*'([^']+)'/gm)].map((m) => m[1]);

if (postSlugs.length === 0) {
  throw new Error('No blog post slugs found in src/data/blog/posts.ts');
}

// lastmod is only trustworthy when it reflects a real content date, so both
// fields must line up before either is used.
if (postSlugs.length !== postDates.length) {
  throw new Error(
    `Found ${postSlugs.length} slugs but ${postDates.length} isoPublishedAt values; lastmod would be wrong`
  );
}

const urls = [
  ...PUBLIC_ROUTES.map((route) => ({ url: `${BASE_URL}${route}` })),
  ...postSlugs.map((slug, i) => ({ url: `${BASE_URL}/blog/${slug}`, lastmod: postDates[i] })),
];

const lines = urls.map(({ url, lastmod }) => (lastmod ? `${url} ${lastmod}` : url));

writeFileSync(SITEMAP_PATH, `${lines.join('\n')}\n`);
console.log(`Regenerated ${SITEMAP_PATH}: ${urls.length} URLs (${postSlugs.length} blog posts)`);