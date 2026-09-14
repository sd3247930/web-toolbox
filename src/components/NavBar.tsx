import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'
import { OPEN_INSTALL_GUIDE } from './InstallGuide'

/** 顶部导航菜单项 */
const LINKS = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/pwa', label: '设备校验', icon: '📋' },
  { to: '/dsap', label: '算法可视化', icon: '🧮' },
  { to: '/radio', label: '培训闯关', icon: '☢️' },
  { to: '/debug', label: '调试刷题', icon: '🛠️' },
]

/**
 * 顶栏导航：四个功能模块 + 首页，高亮当前激活项。
 * 移动端为横向滚动胶囊导航。
 */
export default function NavBar() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>🧰 工具集</div>
          <button
            className={styles.installBtn}
            onClick={() => window.dispatchEvent(new Event(OPEN_INSTALL_GUIDE))}
            title="安装到手机主屏"
          >
            📲 安装
          </button>
        </div>
        <nav className={styles.links}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              <span className={styles.icon}>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
