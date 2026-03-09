
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      'process.env': {},
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
    },
  };
});
