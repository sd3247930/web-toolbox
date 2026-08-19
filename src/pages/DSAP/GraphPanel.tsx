import { useMemo, useState } from 'react'
import StepPlayer from './StepPlayer'
import { dfsSteps, bfsSteps, SAMPLE_GRAPH } from './generators'
import type { GraphStep } from './types'
import styles from './Panels.module.css'

/** 节点在圆环上的坐标 */
const NODES = Object.keys(SAMPLE_GRAPH).map(Number)
const POS: Record<number, { x: number; y: number }> = {}
NODES.forEach((n, i) => {
  const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2
  POS[n] = { x: 150 + 110 * Math.cos(angle), y: 120 + 110 * Math.sin(angle) }
})

/** 图遍历（DFS/BFS）可视化面板 */
export default function GraphPanel() {
  const [mode, setMode] = useState<'dfs' | 'bfs'>('dfs')
  const [start, setStart] = useState(0)

  const steps = useMemo(() => (mode === 'dfs' ? dfsSteps(start) : bfsSteps(start)), [mode, start])

  const renderStep = (step: GraphStep) => (
    <div>
      <svg viewBox="0 0 300 240" className={styles.graphSvg}>
        {/* 边 */}
        {Object.entries(SAMPLE_GRAPH).flatMap(([a, neighbors]) =>
          neighbors.filter((b) => Number(a) < b).map((b) => {
            const p1 = POS[Number(a)]
            const p2 = POS[b]
            return <line key={`${a}-${b}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={styles.edge} />
          }),
        )}
        {/* 节点 */}
        {NODES.map((n) => {
          const pos = POS[n]
          const visited = step.visited.includes(n)
          const isCurrent = step.current === n
          const inFrontier = step.frontier.includes(n)
          let cls = styles.node
          if (isCurrent) cls += ` ${styles.nodeCurrent}`
          else if (visited) cls += ` ${styles.nodeVisited}`
          else if (inFrontier) cls += ` ${styles.nodeFrontier}`
          return (
            <g key={n}>
              <circle cx={pos.x} cy={pos.y} r={18} className={cls} />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" className={styles.nodeText}>
                {n}
              </text>
            </g>
          )
        })}
      </svg>
      <div className={styles.msg}>
        {step.message} ｜ 访问顺序：{step.visited.join(' → ') || '—'}
        {step.frontier.length > 0 && ` ｜ ${mode === 'bfs' ? '队列' : '栈'}：[${step.frontier.join(', ')}]`}
      </div>
    </div>
  )

  return (
    <div>
      <div className={styles.controls}>
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value as 'dfs' | 'bfs')} style={{ width: 130 }}>
          <option value="dfs">深度优先 DFS</option>
          <option value="bfs">广度优先 BFS</option>
        </select>
        <select className="select" value={start} onChange={(e) => setStart(Number(e.target.value))} style={{ width: 110 }}>
          {NODES.map((n) => (
            <option key={n} value={n}>
              起点 {n}
            </option>
          ))}
        </select>
      </div>
      <StepPlayer steps={steps} render={renderStep} />
      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.dCurrent}`} />当前节点</span>
        <span><i className={`${styles.dot} ${styles.dVisited}`} />已访问</span>
        <span><i className={`${styles.dot} ${styles.dFrontier}`} />待访问</span>
      </div>
    </div>
  )
}
