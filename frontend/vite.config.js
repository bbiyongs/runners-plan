export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@api': '/src/api',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});