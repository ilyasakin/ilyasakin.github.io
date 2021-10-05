import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
    }),
  ],
});
