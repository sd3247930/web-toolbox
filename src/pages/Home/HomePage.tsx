import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

/** 首页模块卡片配置 */
const MODULES = [
  {
    to: '/pwa',
    icon: '📋',
    title: '设备校验提醒器',
    from: 'MYFirstPWA',
    desc: '管理设备校验日期，≤30 天橙色预警、≤7 天红色预警，数据保存在本地。',
  },
  {
    to: '/dsap',
    icon: '🧮',
    title: '算法可视化练习',
    from: 'DSAP',
    desc: '排序、搜索、图遍历等 6 种经典算法，逐步动画演示 + 交互练习。',
  },
  {
    to: '/radio',
    icon: '☢️',
    title: '培训闯关',
    from: 'radio-exam',
    desc: '放射性药品更衣与手消培训：视频学习 + 分阶段闯关，全对才能通关。',
  },
  {
    to: '/debug',
    icon: '🛠️',
    title: '调试刷题',
    from: 'Debugging-skills',
    desc: '2000 道调试技能题（单选/多选/判断），顺序/随机/模拟考试 + 代码调试。',
  },
]

/** 欢迎页：应用介绍 + 四个模块入口 */
export default function HomePage() {
  return (
    <div>
      <div className={styles.hero}>
        <h1 className={styles.title}>🧰 四合一工具集</h1>
        <p className={styles.sub}>
          一个 SPA 合并四个独立仓库：设备校验提醒 · 算法可视化 · 培训闯关 · 调试刷题
        </p>
        <p className={styles.pwa}>📴 支持 PWA：离线可用、可安装到桌面 / 手机</p>
      </div>

      <div className={styles.grid}>
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className={styles.card}>
            <div className={styles.icon}>{m.icon}</div>
            <div className={styles.name}>{m.title}</div>
            <div className={styles.from}>{m.from}</div>
            <div className={styles.desc}>{m.desc}</div>
            <div className={styles.go}>进入模块 →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
