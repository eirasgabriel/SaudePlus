<<<<<<< HEAD
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api vai para o Spring Boot. Assim o front chama
    // caminhos relativos e nao precisa lidar com CORS nem com URL fixa.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Sem isto, um node_modules acima de frontend/ faz o Vite resolver duas
    // cópias de React no mesmo bundle. Dois Reacts significam dois registros de
    // hooks, e todo componente estoura com "Invalid hook call". O dedupe força
    // uma instância só, venha o import de onde vier.
    dedupe: ['react', 'react-dom', 'react-router-dom'],

    // Encurta os caminhos: '@/components/Sidebar' no lugar de '../../components'.
    // Os arquivos entregues continuam usando caminhos relativos, então isto é
    // opcional e não quebra nada que já existe.
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },

  optimizeDeps: {
    // O pré-bundle também precisa enxergar uma instância só, senão o dev server
    // serve uma cópia diferente da que o build usa.
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  server: {
    port: 5173,
    open: '/paciente',
  },
});
>>>>>>> feature/dashboard-paciente
