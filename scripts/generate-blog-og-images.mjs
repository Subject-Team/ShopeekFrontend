#!/usr/bin/env node
/**
 * Regenerates the raster Open Graph cards for blog posts.
 *
 * WHY THIS EXISTS
 * Open Graph / Twitter card crawlers (Facebook, X, WhatsApp, Telegram,
 * LinkedIn, Slack) only render raster images — JPEG, PNG, GIF, WebP. SVG is
 * NOT supported by any of them, so a card whose `og:image` points at an `.svg`
 * is silently dropped and the shared link renders with no preview image. The
 * blog artwork is authored as SVG (crisp, tiny, path-only) for use in the page
 * body, which is why every post needs a separate raster twin.
 *
 * WHAT IT DOES
 * Wraps each `public/images/blog/<slug>.svg` in a 1200x630 (the size Facebook
 * and X document for a large link card) SVG canvas and rasterizes it with
 * resvg. Composition is done in the SVG domain via a nested `<svg>` element
 * rather than with an image library, so the script stays dependency-free and
 * needs no PNG encode/decode code.
 *
 * FIT STRATEGY — contain, never cover
 * The artwork is scaled to fit *inside* 1200x630 and centred, with the
 * leftover margin filled in the cards' own flat background colour. Nothing is
 * ever cropped, so editing a card can never silently clip its text or chart.
 * Because every card already paints that exact colour edge-to-edge, the
 * padding is invisible.
 *
 * WHY A KNOWN-VIEWBOX TABLE
 * `ARTWORK_VIEWBOX` maps a source `viewBox` to the sub-rectangle of it holding
 * real artwork. The house card is authored on 800x450 with a `0 0` origin. One
 * card (sales-analytics-guide.svg) is an Illustrator export that keeps its
 * original 595.3-unit coordinate space rather than being rescaled to 800x450,
 * so its viewBox origin sits at y=130.2 and the mapping is the identity. Any
 * source viewBox missing from the table throws, so a re-authored card fails
 * loudly here instead of quietly producing a letterboxed or half-empty OG
 * image.
 *
 * ── SYNC POINTS (update BOTH sides when editing) ──────────────────────────
 *  - Output path: the `ogImage` value of each post in
 *    src/data/blog/posts.ts (consumed by src/components/common/BlogSEO.tsx
 *    and scripts/prerender-seo.mjs).
 *  - Artwork/background colours: the source SVGs in public/images/blog/.
 *
 * NOT PART OF `npm run build` — the PNGs are committed, and this script only
 * needs to run when a card is added or re-designed (it fetches resvg via npx,
 * so the first run needs network access).
 *
 * Run manually:  node scripts/generate-blog-og-images.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SVG_DIR = join(ROOT, 'public', 'images', 'blog');

// Facebook / X documented ideal for `summary_large_image`.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Flat, full-bleed background shared by every card (verified in each SVG's
// first <rect>), so contain-fit padding is seamless.
const CARD_BG = '#f7faf9';

// source viewBox -> artwork sub-rectangle ("minX minY width height").
const ARTWORK_VIEWBOX = new Map([
  ['0 0 800 450', '0 0 800 450'],
  ['0 130.2 595.3 334.8', '0 130.2 595.3 334.8'],
]);

// ── Helpers ───────────────────────────────────────────────────────────────
const readViewBox = (svg, name) => {
  const match = svg.match(/viewBox="([^"]*)"/);
  if (!match) {
    throw new Error(`${name}: no viewBox attribute found`);
  }
  return match[1].trim().replace(/\s+/g, ' ');
};

/**
 * Wrap a card's inner markup in a 1200x630 canvas. The source's own <svg>
 * element is replaced by a nested <svg> carrying the artwork viewBox, so its
 * children keep working in their original user units.
 */
function buildCanvas(name, sourceSvg, artworkViewBox) {
  const inner = sourceSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  if (!inner.trim()) {
    throw new Error(`${name}: could not extract inner markup from <svg>`);
  }

  const [, minX, minY, artWidth, artHeight] = artworkViewBox.split(' ').map(Number);
  const scale = Math.min(OG_WIDTH / artWidth, OG_HEIGHT / artHeight);
  const drawWidth = artWidth * scale;
  const drawHeight = artHeight * scale;
  const x = (OG_WIDTH - drawWidth) / 2;
  const y = (OG_HEIGHT - drawHeight) / 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">`,
    `  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${CARD_BG}" />`,
    `  <svg x="${round(x)}" y="${round(y)}" width="${round(drawWidth)}" height="${round(drawHeight)}" viewBox="${artworkViewBox}">`,
    inner,
    '  </svg>',
    '</svg>',
    '',
  ].join('\n');
}

const round = (value) => Math.round(value * 1000) / 1000;

// ── Main ──────────────────────────────────────────────────────────────────
const sources = readdirSync(SVG_DIR)
  .filter((file) => file.endsWith('.svg'))
  .sort();

if (sources.length === 0) {
  throw new Error(`No .svg cards found in ${SVG_DIR}`);
}

const workDir = mkdtempSync(join(tmpdir(), 'blog-og-'));
let written = 0;

try {
  for (const file of sources) {
    const slug = basename(file, '.svg');
    const sourceSvg = readFileSync(join(SVG_DIR, file), 'utf8');
    const viewBox = readViewBox(sourceSvg, file);

    const artworkViewBox = ARTWORK_VIEWBOX.get(viewBox);
    if (!artworkViewBox) {
      throw new Error(
        `${file}: viewBox "${viewBox}" is not in ARTWORK_VIEWBOX.\n` +
          `Confirm where the real artwork sits in this card, then add an entry.`,
      );
    }

    const canvasPath = join(workDir, `${slug}.svg`);
    const outputPath = join(SVG_DIR, `${slug}.og.png`);
    writeFileSync(canvasPath, buildCanvas(file, sourceSvg, artworkViewBox), 'utf8');

    mkdirSync(dirname(outputPath), { recursive: true });
    execFileSync(
      'npx',
      ['--yes', '@resvg/resvg-js-cli', canvasPath, outputPath],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );

    written += 1;
    console.log(`generate-blog-og-images: ${file} -> ${slug}.og.png (${OG_WIDTH}x${OG_HEIGHT})`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`generate-blog-og-images: wrote ${written} raster OG card(s) to public/images/blog/`);
