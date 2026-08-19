import { useMemo, useState } from 'react'
import StepPlayer from './StepPlayer'
import { binarySearchSteps } from './generators'
import type { SearchStep } from './types'
import styles from './Panels.module.css'

/** 生成有序不重复数组 */
function sortedArray(size: number): number[] {
  const s = new Set<number>()
  while (s.size < size) s.add(Math.floor(Math.random() * 90) + 5)
  return [...s].sort((a, b) => a - b)
}

/** 二分查找可视化面板 */
export default function SearchingPanel() {
  const [arr, setArr] = useState<number[]>(() => sortedArray(12))
  const [target, setTarget] = useState('50')
  const [targetNum, setTargetNum] = useState(50)

  const steps = useMemo(() => binarySearchSteps(arr, targetNum), [arr, targetNum])
  const max = Math.max(...arr)

  const run = () => {
    const n = Number(target)
    if (!Number.isFinite(n)) return
    setTargetNum(n)
  }

  const renderStep = (step: SearchStep) => (
    <div>
      <div className={styles.bars}>
        {step.arr.map((v, i) => {
          let cls = styles.bar
          if (step.mid === i) cls += ` ${styles.mid}`
          else if (i >= step.lo && i <= step.hi) cls += ` ${styles.range}`
          if (step.found && step.mid === i) cls += ` ${styles.found}`
          return (
            <div key={i} className={styles.barCol}>
              <div className={styles.barVal}>{v}</div>
              <div className={cls} style={{ height: `${(v / max) * 100}%` }} />
              <div className={styles.barIdx}>{i}</div>
            </div>
          )
        })}
      </div>
      <div className={styles.msg}>{step.message}</div>
    </div>
  )

  return (
    <div>
      <div className={styles.controls}>
        <input
          className="input"
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="输入目标值"
          style={{ width: 130 }}
        />
        <button className="btn btn-primary" onClick={run}>
          🔍 开始查找
        </button>
        <button
          className="btn btn-outline"
          onClick={() => {
            setArr(sortedArray(12))
          }}
        >
          🎲 随机数组
        </button>
      </div>
      <StepPlayer steps={steps} render={renderStep} />
      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.dRange}`} />查找区间</span>
        <span><i className={`${styles.dot} ${styles.dMid}`} />中间值</span>
        <span><i className={`${styles.dot} ${styles.dFound}`} />命中</span>
      </div>
      <div className={styles.tip}>要求：数组必须是有序的（本面板自动生成升序数组）</div>
    </div>
  )
}
