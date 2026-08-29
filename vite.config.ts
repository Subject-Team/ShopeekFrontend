import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      output: {
        // Group third-party code by change-frequency + shared ownership so a
        // dependency bump invalidates only its own chunk (better HTTP caching).
        // Function form is used (not the object form) because deps must not be
        // hand-enumerated: transitive deps (d3-*, victory-vendor, micromark,
        // react-router v7 runtime, ...) are captured by path and the config
        // self-heals when packages are added/removed.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          // React core (react + react-dom + scheduler) MUST stay in one chunk:
          // they version in lockstep. Splitting them (e.g. react in vendor,
          // react-dom folded elsewhere) invalidates two files on every React bump.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react'
          }

          // recharts + its entire dependency family (victory-vendor, d3-*,
          // decimal.js-light, eventemitter3, internmap). Everything here is
          // recharts-only, so a recharts upgrade stays isolated from all other
          // chunks — and this family can move to a lazy-loaded route later.
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/victory-vendor/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/decimal.js-light/') ||
            id.includes('node_modules/eventemitter3/') ||
            id.includes('node_modules/internmap/')
          ) {
            return 'charts'
          }

          // react-router-dom v7 + its runtime deps, shared by every page.
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/cookie') ||
            id.includes('node_modules/set-cookie-parser') ||
            id.includes('node_modules/tiny-invariant') ||
            id.includes('node_modules/minimatch')
          ) {
            return 'router'
          }

          // react-markdown + the unified/remark/micromark stack, used only by
          // the chat drawer. Own chunk keeps it out of the entry and gives it
          // isolated cache invalidation.
          if (
            id.includes('node_modules/react-markdown/') ||
            id.includes('node_modules/remark-') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/mdast-') ||
            id.includes('node_modules/hast-') ||
            id.includes('node_modules/unified/') ||
            id.includes('node_modules/unist-') ||
            id.includes('node_modules/vfile') ||
            id.includes('node_modules/zwitch/') ||
            id.includes('node_modules/trough/') ||
            id.includes('node_modules/bail/') ||
            id.includes('node_modules/ccount/') ||
            id.includes('node_modules/devlop/') ||
            id.includes('node_modules/extend/') ||
            id.includes('node_modules/character-') ||
            id.includes('node_modules/stringify-entities/') ||
            id.includes('node_modules/parse-entities/') ||
            id.includes('node_modules/property-information/') ||
            id.includes('node_modules/space-separated-tokens/') ||
            id.includes('node_modules/comma-separated-tokens/') ||
            id.includes('node_modules/decode-named-character-reference/') ||
            id.includes('node_modules/trim-lines/')
          ) {
            return 'markdown'
          }

          // Catch-all for the remaining third-party code (lucide-react,
          // @marsidev/react-turnstile, clsx, tailwind-merge, ...).
          return 'vendor'
        }
      }
    }
  }
})
