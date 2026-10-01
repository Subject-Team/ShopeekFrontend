import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Vite 8 bundles with Rolldown, so the bundler options are `rolldownOptions`
    // (`rollupOptions` is a deprecated alias) and chunking is expressed through
    // `output.codeSplitting`. Both older spellings are ignored when it is set:
    //   - `output.manualChunks`  — deprecated (object form not even supported)
    //   - `output.advancedChunks` — deprecated alias kept for compatibility
    // Reference: https://rolldown.rs/reference/OutputOptions.codeSplitting
    rolldownOptions: {
      output: {
        // Groups are matched in declaration order unless `priority` says
        // otherwise, and a module claimed by a higher-priority group is removed
        // from every lower-priority one. That is why the specific families below
        // outrank the `vendor` catch-all rather than relying on ordering alone.
        //
        // Each group name becomes the chunk filename prefix, so a dependency bump
        // invalidates only its own chunk and the rest stay in the browser cache.
        //
        // Separator discipline in the `test` patterns below: patterns ending in
        // `[\\/]` list EXACT package names, and the separator is mandatory so
        // `react` cannot swallow `react-router`. Patterns for family prefixes
        // (`d3-`, `mdast-`, `remark-`) use `[\\/]?` instead — a mandatory
        // separator can never match `mdast-util-gfm-table`, which silently drops
        // those packages into `vendor` and drags them onto the critical path.
        codeSplitting: {
          groups: [
            // React core (react + react-dom + scheduler) versions in lockstep;
            // splitting them would invalidate two files on every React bump.
            // Trailing `[\\/]` pins the package boundary — without it `/react/`
            // style prefixes also swallow `react-dom` and `react-router`.
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            // recharts and its whole dependency family (victory-vendor, d3-*,
            // decimal.js-light, eventemitter3, internmap). Only DashboardPage
            // and AnalyticsPage pull this in, so it stays out of the landing
            // page's module graph.
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|victory-vendor|d3-|decimal\.js-light|eventemitter3|internmap)[\\/]?/,
              priority: 30,
            },
            // react-router v7 plus its runtime deps, needed by every route.
            {
              name: 'router',
              test: /node_modules[\\/](react-router|cookie|set-cookie-parser|tiny-invariant|minimatch)[\\/]/,
              priority: 30,
            },
            // react-markdown + the unified/remark/micromark stack. Only the chat
            // drawer needs it, and the drawer is mounted on demand, so this
            // chunk is never part of any initial page load.
            {
              name: 'markdown',
              test: /node_modules[\\/](react-markdown|remark-|micromark|mdast-|hast-|unist-|character-|vfile|unified|zwitch|trough|bail|ccount|devlop|extend|trim-lines|stringify-entities|parse-entities|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference)[\\/]?/,
              priority: 30,
            },
            // Everything else third-party (lucide-react, clsx, tailwind-merge,
            // @marsidev/react-turnstile, ...). Deliberately last and lowest
            // priority: it is the fallback bucket, so it must not shadow a
            // family above.
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
