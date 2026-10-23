import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative assets work both locally and when hosted under /zodcat/ on GitHub Pages.
  base: './',
  plugins: [react()],
});
