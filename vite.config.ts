
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Define 'process.env' como um objeto vazio para evitar "process is not defined"
      'process.env': {},
      // Substitui especificamente a chave da API pelo valor real
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  };
});
