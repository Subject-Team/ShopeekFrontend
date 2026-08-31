import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
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
    },
  },
});
