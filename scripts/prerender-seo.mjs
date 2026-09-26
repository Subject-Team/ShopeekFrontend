#!/usr/bin/env node
/**
 * Build-time static prerenderer for SEO head tags.
 *
 * Runs AFTER `vite build` (chained in the `build` script in package.json).
 * Reads the freshly built dist/index.html, swaps the head SEO elements per
 * public route, and writes dist/<route>/index.html for each route (rewriting
 * dist/index.html in place for `/`). Vercel serves static files before the
 * SPA rewrite `/(.*) -> /index.html`, so crawlers get correct per-route
 * title/meta/canonical/OG/JSON-LD without executing JS.
 *
 * Dependency-free on purpose: plain node:fs/path + regexes over posts.ts,
 * mirroring scripts/generate-sitemap.mjs.
 *
 * ── SYNC POINTS (update BOTH sides when editing) ──────────────────────────
 *  - Per-route title/description/canonicalPath: the <SEO>/<BlogSEO> props in
 *    src/pages/{LandingPage,LoginPage,ContactPage,PlansPage,LegalPage,
 *    BlogPage,BlogPostPage}.tsx (NotFoundPage is not a public route).
 *  - Title formatting + canonical/OG/twitter logic: src/components/common/
 *    SEO.tsx and BlogSEO.tsx (formatTitle, fullCanonicalUrl, fullImageUrl).
 *  - Blog JSON-LD schemas (Blog / BreadcrumbList / BlogPosting):
 *    src/components/common/BlogSEO.tsx.
 *  - Blog post data (slug/title/metaTitle/metaDescription/isoPublishedAt/
 *    author.name/keywords/ogImage): src/data/blog/posts.ts — parsed
 *    with the same regex approach as scripts/generate-sitemap.mjs.
 *  - Public route list: src/App.tsx. Redirect-only routes (/privacy-policy,
 *    /privacy -> /legal) are skipped; /dashboard/* and /admin are
 *    robots-disallowed and never prerendered.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * CSP safety: no inline <script> is added except type="application/ld+json"
 * blocks (exempt from script-src, non-executable). The gtag inline script in
 * index.html is left byte-identical.
 *
 * Run manually:  node scripts/prerender-seo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const POSTS_PATH = join(ROOT, 'src', 'data', 'blog', 'posts.ts');

const BASE_URL = 'https://shopeekapp.ir';

// ── Static public routes ──────────────────────────────────────────────────
// Title/description mirror the <SEO>/<BlogSEO> props in the pages listed in
// the header. canonicalPath is the route path itself.
const STATIC_ROUTES = [
  {
    path: '/',
    title: 'شاپیک | پلتفرم هوشمند تحلیل و مشاوره فروش کسب‌وکارها',
    description:
      'سامانه تحلیلی شاپیک پلتفرم جامع تحلیل آمار فروش، مدیریت مشتریان (CRM) و مشاوره هوشمند برای کسب‌وکارهای ایرانی است.',
  },
  {
    path: '/login',
    title: 'ورود و ثبت‌نام | شاپیک',
    description:
      'ورود به حساب کاربری و ثبت‌نام در سامانه تحلیلی شاپیک جهت دسترسی به آمار فروش و مشاوره هوش مصنوعی.',
  },
  {
    path: '/contact',
    title: 'تماس با ما | شاپیک',
    description:
      'ارتباط با پشتیبانی سامانه شاپیک از طریق تلگرام، اینستاگرام و ایمیل جهت خرید و تمدید اشتراک، دریافت راهنمایی و کسب اطلاعات بیشتر.',
  },
  {
    path: '/plans',
    title: 'طرح‌ها و تعرفه‌های شاپیک',
    description:
      'مقایسه طرح‌های اشتراک شاپیک: لایت و پرو، با سهمیه فاکتور، هوش مصنوعی و نشست‌ها. طرح مناسب کسب‌وکار خود را انتخاب کنید.',
  },
  {
    path: '/legal',
    title: 'قوانین و مقررات و حریم خصوصی | شاپیک',
    description:
      'سند کامل شرایط سرویس و قوانین شاپیک به همراه سیاست حفظ حریم خصوصی، ضوابط پردازش داده‌ها، امانت‌داری داده‌های فروش و امنیت هوش مصنوعی در سامانه تحلیلی شاپیک.',
  },
  {
    path: '/blog',
    title: 'وبلاگ و مقالات تحلیلی فروش و کسب‌وکار',
    description:
      'مجموعه مقالات آموزشی و تخصصی شاپیک درباره تحلیل فروش، مدیریت سود و زیان، وفادارسازی مشتریان و ابزارهای هوشمند کسب‌وکارهای خرد.',
  },
];

// ── Blog post parsing (same approach as scripts/generate-sitemap.mjs) ─────
// Only read from the BLOG_POSTS array — BLOG_CATEGORIES also declares
// `slug: '...'` entries and must be excluded, so slice from the BLOG_POSTS
// declaration onward and split the array body into per-post blocks.
function parseBlogPosts() {
  const source = readFileSync(POSTS_PATH, 'utf8');
  const postsStart = source.indexOf('export const BLOG_POSTS');
  if (postsStart === -1) {
    throw new Error('Could not find "export const BLOG_POSTS" in src/data/blog/posts.ts');
  }
  const postsSection = source.slice(postsStart);
  const arrayStart = postsSection.indexOf('[');
  const arrayEnd = postsSection.lastIndexOf(']');
  const arrayBody = postsSection.slice(arrayStart + 1, arrayEnd);

  // Post objects are separated by `  },\n  {` at 2-space indent; nested
  // objects (author/callout/faq/sections) are indented deeper and never match.
  const blocks = arrayBody.split(/\n  \},\n  \{/);

  const field = (block, name) => {
    const match = block.match(new RegExp(`\\n    ${name}:\\s*'([^']*)'`));
    return match ? match[1] : '';
  };

  const posts = [];
  for (const block of blocks) {
    const slug = field(block, 'slug');
    if (!slug) continue;
    const authorMatch = block.match(/author:\s*\{\s*name:\s*'([^']*)'/);
    const keywordsMatch = block.match(/keywords:\s*\[([\s\S]*?)\]/);
    posts.push({
      slug,
      title: field(block, 'title'),
      metaTitle: field(block, 'metaTitle'),
      metaDescription: field(block, 'metaDescription'),
      isoPublishedAt: field(block, 'isoPublishedAt'),
      ogImage: field(block, 'ogImage'),
      authorName: authorMatch ? authorMatch[1] : '',
      keywords: keywordsMatch ? [...keywordsMatch[1].matchAll(/'([^']*)'/g)].map((m) => m[1]) : [],
    });
  }

  if (posts.length === 0) {
    throw new Error('No blog post data found in src/data/blog/posts.ts');
  }
  return posts;
}

// ── Helpers ───────────────────────────────────────────────────────────────
const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Mirrors SEO.tsx / BlogSEO.tsx: append "| شاپیک" unless the title already
// contains it.
const formatTitle = (title) => (title.includes('شاپیک') ? title : `${title} | شاپیک`);

// Replace the first occurrence; throw if the pattern is missing so a changed
// template fails the build loudly instead of silently emitting wrong SEO.
// (Presence is checked via test() — a replacement that equals the existing
// value, e.g. the `/` route's canonical already being the site root, is fine.)
function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-seo: could not find ${label} in dist/index.html template`);
  }
  return html.replace(pattern, replacement);
}

// ── JSON-LD schemas (mirror BlogSEO.tsx) ──────────────────────────────────
function buildBlogJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'وبلاگ و مقالات تحلیلی شاپیک',
    description: route.description,
    url: route.canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'شاپیک',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo.svg` },
    },
  };
}

function buildPostJsonLd(route) {
  const post = route.post;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'صفحه اصلی', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'وبلاگ', item: `${BASE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: route.canonicalUrl },
        ],
      },
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        image: route.fullImageUrl,
        datePublished: post.isoPublishedAt,
        dateModified: post.isoPublishedAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': route.canonicalUrl },
        author: { '@type': 'Organization', name: post.authorName, url: BASE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'شاپیک',
          url: BASE_URL,
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo.svg` },
        },
        keywords: post.keywords.join(', '),
      },
    ],
  };
}

// ── Per-route render ──────────────────────────────────────────────────────
// Only head SEO elements are swapped; every asset/script/link/body tag stays
// byte-identical. Blog posts additionally get og:type=article and the post's
// raster OG card for og:image/twitter:image (as BlogSEO.tsx does). The `/blog`
// index needs no og:image swap — it keeps index.html's site-wide PNG, which is
// what BlogSEO's default resolves to.
function renderRoute(template, route) {
  let html = template;
  const title = formatTitle(route.title);
  const canonicalUrl = route.canonicalUrl;

  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`, 'title');
  html = replaceOnce(
    html,
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeHtml(route.description)}">`,
    'meta description'
  );
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
    'canonical link'
  );
  html = replaceOnce(
    html,
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
    'og:url'
  );
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    'og:title'
  );
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeHtml(route.description)}">`,
    'og:description'
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    'twitter:title'
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}">`,
    'twitter:description'
  );

  if (route.post) {
    html = replaceOnce(
      html,
      /<meta property="og:type" content="[^"]*">/,
      '<meta property="og:type" content="article">',
      'og:type'
    );
    html = replaceOnce(
      html,
      /<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${escapeHtml(route.fullImageUrl)}">`,
      'og:image'
    );
    html = replaceOnce(
      html,
      /<meta name="twitter:image" content="[^"]*">/,
      `<meta name="twitter:image" content="${escapeHtml(route.fullImageUrl)}">`,
      'twitter:image'
    );
  }

  if (route.jsonLd) {
    // Escape `<` so the JSON can never terminate the script tag early.
    const jsonLd = JSON.stringify(route.jsonLd).replace(/</g, '\\u003c');
    const script = `    <script type="application/ld+json" id="blog-jsonld-schema">${jsonLd}</script>`;
    html = replaceOnce(html, /  <\/head>/, `${script}\n  </head>`, 'head close tag');
  }

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────
const template = readFileSync(join(DIST, 'index.html'), 'utf8');

// /blog carries the Blog JSON-LD schema; other static routes carry none.
const routes = STATIC_ROUTES.map((route) => {
  const canonicalUrl = `${BASE_URL}${route.path}`;
  return {
    ...route,
    canonicalUrl,
    jsonLd: route.path === '/blog' ? buildBlogJsonLd({ ...route, canonicalUrl }) : undefined,
  };
});

// Each blog post becomes /blog/<slug> with article JSON-LD + raster OG card.
const postRoutes = parseBlogPosts().map((post) => {
  const path = `/blog/${post.slug}`;
  const canonicalUrl = `${BASE_URL}${path}`;
  // og:image / twitter:image / BlogPosting.image must be raster (see
  // BlogSEO.tsx): crawlers silently drop an SVG, so a link would render with
  // no preview image. Fail the build rather than ship that.
  if (!post.ogImage) {
    throw new Error(`prerender-seo: ${path} has no ogImage in src/data/blog/posts.ts`);
  }
  if (post.ogImage.toLowerCase().endsWith('.svg')) {
    throw new Error(
      `prerender-seo: ${path} ogImage must not be an SVG (crawlers render raster only): ${post.ogImage}`,
    );
  }
  const fullImageUrl = post.ogImage.startsWith('http')
    ? post.ogImage
    : `${BASE_URL}${post.ogImage.startsWith('/') ? post.ogImage : `/${post.ogImage}`}`;
  return {
    path,
    title: post.metaTitle,
    description: post.metaDescription,
    canonicalUrl,
    fullImageUrl,
    post,
    jsonLd: buildPostJsonLd({ canonicalUrl, fullImageUrl, post }),
  };
});

const allRoutes = [...routes, ...postRoutes];

for (const route of allRoutes) {
  const html = renderRoute(template, route);
  if (route.path === '/') {
    writeFileSync(join(DIST, 'index.html'), html);
  } else {
    const dir = join(DIST, route.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
}

console.log(
  `Prerendered SEO head tags for ${allRoutes.length} public routes (${postRoutes.length} blog posts) under ${DIST}`
);