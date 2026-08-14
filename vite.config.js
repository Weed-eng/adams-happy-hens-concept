import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so `dist/` can be opened straight from the filesystem.
  base: './',
});
