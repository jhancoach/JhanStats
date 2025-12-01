import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite de aviso para 1000kb (opcional, mas remove o aviso se o chunk ainda for grandinho)
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // Força a separação das bibliotecas em arquivos diferentes
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
});