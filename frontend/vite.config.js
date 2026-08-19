import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// ─────────────────────────────────────────────────────────────────────────────
// Vite Configuration
// Dev server: http://localhost:5173
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // @/ maps to src/ — cleaner imports
            // Example: import { apiClient } from '@/core/api/client'
            '@': path.resolve(__dirname, './src'),
            '@boilerplate/shared': path.resolve(__dirname, '../shared/src/index.ts'),
        },
    },
    server: {
        port: 5173,
        // Proxy API calls to the backend — avoids CORS issues in development
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
    build: {
        // Enable chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    query: ['@tanstack/react-query'],
                },
            },
        },
    },
});
