import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import InstallPrompt from './components/InstallPrompt'
import HomePage from './pages/Home/HomePage'
import PwaPage from './pages/PWA/PwaPage'
import DSAPPage from './pages/DSAP/DSAPPage'
import RadioExamPage from './pages/RadioExam/RadioExamPage'
import DebuggingPage from './pages/Debugging/DebuggingPage'

/**
 * 应用根组件：统一布局（导航 + 内容 + 页脚）+ 路由配置。
 * 路由：
 *   /       首页（欢迎导航页）
 *   /pwa    设备校验提醒器（MYFirstPWA）
 *   /dsap   算法可视化练习（DSAP）
 *   /radio  培训闯关（radio-exam）
 *   /debug  调试刷题（Debugging-skills）
 */
export default function App() {
  const navigate = useNavigate()

  // 处理 GitHub Pages 深链：从 404.html 的 sessionStorage 恢复目标路由
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      navigate(redirect, { replace: true })
    }
  }, [navigate])

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pwa" element={<PwaPage />} />
          <Route path="/dsap" element={<DSAPPage />} />
          <Route path="/radio" element={<RadioExamPage />} />
          <Route path="/debug" element={<DebuggingPage />} />
          {/* 未匹配路由回首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  )
}
