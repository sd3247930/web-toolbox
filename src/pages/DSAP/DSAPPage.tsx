import { useState } from 'react'
import SortingPanel from './SortingPanel'
import SearchingPanel from './SearchingPanel'
import GraphPanel from './GraphPanel'
import styles from './DSAPPage.module.css'

/** 算法列表（分组） */
const GROUPS = [
  {
    name: '排序算法',
    items: [
      { key: 'sorting', label: '五种排序可视化', icon: '📊' },
    ],
  },
  {
    name: '搜索算法',
    items: [{ key: 'search', label: '二分查找', icon: '🔍' }],
  },
  {
    name: '图遍历',
    items: [{ key: 'graph', label: 'DFS / BFS', icon: '🕸️' }],
  },
]

/** 算法可视化练习主页面 */
export default function DSAPPage() {
  const [active, setActive] = useState('sorting')

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.h1}>🧮 算法可视化练习</h1>
        <p className={styles.sub}>逐步动画演示排序、搜索与图遍历，理解算法执行过程</p>
      </div>

      <div className={styles.layout}>
        {/* 侧边算法列表 */}
        <aside className={styles.side}>
          {GROUPS.map((g) => (
            <div key={g.name} className={styles.group}>
              <div className={styles.groupName}>{g.name}</div>
              {g.items.map((it) => (
                <button
                  key={it.key}
                  className={`${styles.item} ${active === it.key ? styles.itemActive : ''}`}
                  onClick={() => setActive(it.key)}
                >
                  <span>{it.icon}</span>
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* 主面板 */}
        <section className={styles.main}>
          <div className="card">
            {active === 'sorting' && <SortingPanel />}
            {active === 'search' && <SearchingPanel />}
            {active === 'graph' && <GraphPanel />}
          </div>
        </section>
      </div>
    </div>
  )
}
