import { defineConfig } from 'vitest/config';

// Testovi pokrivaju čiste module podatkovnog sloja (parser, klasifikacija
// područja, izgradnja kataloga, pretraga i sortiranje).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
