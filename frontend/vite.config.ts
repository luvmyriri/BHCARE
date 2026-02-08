import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['images/**/*', 'favicon.ico'],
            manifest: {
                name: 'Barangay 174 Health Center',
                short_name: 'BHCare 174',
                description: 'Access your medical records and book appointments at Barangay 174 Health Center',
                theme_color: '#14B8A6',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/images/Logo.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff,woff2}'],
                skipWaiting: true,
                clientsClaim: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 5 // 5 minutes
                            },
                            networkTimeoutSeconds: 10
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    server: {
        port: 3000,
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/register': 'http://localhost:5000',
            '/login': 'http://localhost:5000',
            '/ocr': 'http://localhost:5000',
            '/ocr-dual': 'http://localhost:5000',
            '/user': 'http://localhost:5000',
            '/appointments': 'http://localhost:5000',
            '/services': 'http://localhost:5000',
        },
    },
    build: {
        outDir: 'build',
    },
})
