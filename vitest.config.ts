import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test type tagging convention.
//
// Every test file under src/ carries a machine-readable type tag:
//   - a `// @test-type <type>` header comment (unit | service | component | page)
//   - a top-level describe prefixed with `[<type>] ` (e.g. `describe('[component] ...')`)
//
// Type mapping (by directory):
//   unit      -> src/utils/** and src/config/**
//   service   -> src/services/**
//   component -> src/components/**, src/context/**, src/hooks/**, src/__tests__/App.test.tsx
//   page      -> src/pages/**
//
// Filtering by tag (both work):
//   - by path:  `vitest run src/services`            (service), `vitest run src/pages` (page), etc.
//   - by name:  `vitest run -t '\[component\]'`      (matches the `[<type>] ` describe prefix)
// The npm scripts test:unit / test:service / test:component / test:page in
// package.json wrap the path-based form.

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Reuse one jsdom environment per worker instead of re-creating it per file.
    pool: 'vmThreads',
    setupFiles: ['./src/test/setup.ts'],
    // Node >=22.4 exposes a non-functional experimental localStorage that
    // shadows jsdom's working implementation; disable it for worker processes.
    // Vitest 4 moved pool execArgv to top-level `test.execArgv`.
    execArgv: ['--no-experimental-webstorage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/vite-env.d.ts', 'src/main.tsx', 'src/types/**'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
    },
  },
});
