import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 项目站点部署在 /web-toolbox/ 子路径下
// PWA 的 start_url / scope / navigateFallback 都必须带上该前缀，
// 否则安装到手机主屏后启动会跳到域名根（无 Pages 站点）而 404
const base = '/web-toolbox/'

// Vite 配置：React + PWA（离线缓存 + 安装）
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 需要被预缓存的静态资源（图标等）
      includeAssets: ['icon-192.png', 'icon-512.png'],
      // Web App Manifest：让整个应用可安装为 PWA
      manifest: {
        id: base,
        name: '四合一工具集 PWA',
        short_name: '工具集',
        description: '设备校验提醒 / 算法可视化 / 培训闯关 / 调试刷题',
        theme_color: '#2563eb',
        background_color: '#f0f4f8',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'zh-CN',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // 预缓存构建产物与静态资源
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // SPA 路由回退到 index.html，保证离线访问任意路由都可用
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
