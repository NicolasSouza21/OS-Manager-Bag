import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✨ ALTERAÇÃO AQUI: Configuração para injetar o React dentro do Spring Boot
  build: {
    // 1. Joga os arquivos construídos (HTML, CSS, JS) direto na pasta pública do Java
    outDir: '../src/main/resources/static',
    // 2. Limpa a pasta antes de construir (para não sobrar lixo antigo)
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://192.168.0.11:8080',
    },
  },
})