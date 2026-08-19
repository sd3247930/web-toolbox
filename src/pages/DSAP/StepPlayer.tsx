import { ReactNode, useEffect, useRef, useState } from 'react'
import styles from './StepPlayer.module.css'

/**
 * 通用步骤播放器：播放 / 暂停 / 上一步 / 下一步 / 速度调节。
 * @param steps 步骤数组（任意类型）
 * @param render 渲染当前步骤的回调
 */
export default function StepPlayer<T>({
  steps,
  render,
  onEnd,
}: {
  steps: T[]
  render: (step: T, index: number) => ReactNode
  onEnd?: () => void
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(400) // 每步间隔毫秒
  const timerRef = useRef<number | null>(null)

  // 步骤变化时重置到开头
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  // 播放循环
  useEffect(() => {
    if (!playing) return
    timerRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false)
          onEnd?.()
          return i
        }
        return i + 1
      })
    }, speed)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [playing, speed, steps.length, onEnd])

  const step = steps[Math.min(index, steps.length - 1)]
  const total = steps.length

  return (
    <div>
      {/* 步骤内容 */}
      <div className={styles.stage}>{step !== undefined ? render(step, index) : null}</div>

      {/* 控制条 */}
      <div className={styles.controls}>
        <button className="btn" onClick={() => setIndex(0)} disabled={playing}>
          ⏮ 开头
        </button>
        <button className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={playing || index === 0}>
          ◀ 上一步
        </button>
        <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)} disabled={total === 0}>
          {playing ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button
          className="btn"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={playing || index >= total - 1}
        >
          下一步 ▶
        </button>
        <div className={styles.speedWrap}>
          <span className={styles.speedLabel}>速度</span>
          <input
            type="range"
            min={80}
            max={1200}
            step={20}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      {/* 进度 */}
      <div className={styles.progressRow}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${total ? (index / total) * 100 : 0}%` }} />
        </div>
        <span className={styles.progressText}>
          {total ? `${index + 1} / ${total}` : '0 / 0'}
        </span>
      </div>
    </div>
  )
}
