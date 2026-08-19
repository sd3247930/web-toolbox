import { useMemo, useState } from 'react'
import StepPlayer from './StepPlayer'
import {
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  mergeSortSteps,
  quickSortSteps,
} from './generators'
import type { SortStep } from './types'
import styles from './Panels.module.css'

/** 排序算法配置 */
const ALGOS: Record<string, { name: string; gen: (a: number[]) => SortStep[] }> = {
  bubble: { name: '冒泡排序', gen: bubbleSortSteps },
  selection: { name: '选择排序', gen: selectionSortSteps },
  insertion: { name: '插入排序', gen: insertionSortSteps },
  merge: { name: '归并排序', gen: mergeSortSteps },
  quick: { name: '快速排序', gen: quickSortSteps },
}

const COMPLEXITY: Record<string, string> = {
  bubble: 'O(n²)',
  selection: 'O(n²)',
  insertion: 'O(n²)',
  merge: 'O(n log n)',
  quick: '平均 O(n log n)',
}

/** 生成随机数组 */
function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
}

/** 排序可视化面板 */
export default function SortingPanel() {
  const [algo, setAlgo] = useState('bubble')
  const [size, setSize] = useState(12)
  const [arr, setArr] = useState<number[]>(() => randomArray(12))

  const steps = useMemo(() => ALGOS[algo].gen(arr), [algo, arr])
  const max = Math.max(...arr)

  const renderStep = (step: SortStep) => (
    <div>
      <div className={styles.bars}>
        {step.arr.map((v, i) => {
          let cls = styles.bar
          if (step.compare && (step.compare[0] === i || step.compare[1] === i)) cls += ` ${styles.compare}`
          if (step.swap && (step.swap[0] === i || step.swap[1] === i)) cls += ` ${styles.swap}`
          if (step.sorted.includes(i) && !step.compare && !step.swap) cls += ` ${styles.sorted}`
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
        <select className="select" value={algo} onChange={(e) => setAlgo(e.target.value)} style={{ width: 150 }}>
          {Object.entries(ALGOS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={size}
          onChange={(e) => {
            const s = Number(e.target.value)
            setSize(s)
            setArr(randomArray(s))
          }}
          style={{ width: 110 }}
        >
          <option value={8}>8 个数据</option>
          <option value={12}>12 个数据</option>
          <option value={16}>16 个数据</option>
        </select>
        <button
          className="btn btn-outline"
          onClick={() => {
            setArr(randomArray(size))
          }}
        >
          🎲 随机数据
        </button>
        <span className={styles.complexity}>时间复杂度：{COMPLEXITY[algo]}</span>
      </div>
      <StepPlayer steps={steps} render={renderStep} />
      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.dCompare}`} />比较</span>
        <span><i className={`${styles.dot} ${styles.dSwap}`} />交换</span>
        <span><i className={`${styles.dot} ${styles.dSorted}`} />已就位</span>
      </div>
    </div>
  )
}
