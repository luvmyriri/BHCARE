import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/register': 'http://localhost:5000',
            '/login': 'http://localhost:5000',
            '/ocr': 'http://localhost:5000',
            '/user': 'http://localhost:5000',
            '/appointments': 'http://localhost:5000',
            '/services': 'http://localhost:5000',
        },
    },
    build: {
        outDir: 'build',
    },
})
