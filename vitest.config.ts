import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['spec/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      // Visibility only — no thresholds/hard gate per the review (HBSP-12).
      // `text` prints a summary table to stdout so CI surfaces the number;
      // `html` writes a browsable report under coverage/ (gitignored).
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
});
