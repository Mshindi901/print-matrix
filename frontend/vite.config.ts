import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from 'vite-plugin-pwa'

const apiBaseUrl = process.env.VITE_API_BASE_URL || '/printer/api'
const remotePath = apiBaseUrl.replace(/^https?:\/\/[^/]+/, '') || '/printer/api'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PrintMatrix",
        short_name: "PrintMatrix",
        description: "PrintMatrix Printer Management System",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/login",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          }
        ]
      },
      
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://104.168.65.62',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})