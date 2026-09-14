import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import { registerSW } from 'virtual:pwa-register'

// PWA：注册 Service Worker（自动更新 + 离线缓存）
registerSW({ immediate: true })

// GitHub Pages 部署在子路径（生产为 /web-toolbox/）时，BrowserRouter 必须带 basename：
// 否则 /web-toolbox/ 匹配不到任何路由，会被兜底路由改写成域名根，
// 导致地址栏跳出子路径、刷新时命中 GitHub 的全局 404。
// React Router 的 basename 约定不带末尾斜杠，这里统一去掉。
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
