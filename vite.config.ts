import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MVP konfiguracija. Karta i vanjski servisi nisu dio ove verzije, ali
// `VITE_HALAL_DATA_URL` (vidi src/data/loadCatalog.ts) ostavlja otvoren put
// prema udaljenom izvoru podataka bez promjene UI sloja.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
