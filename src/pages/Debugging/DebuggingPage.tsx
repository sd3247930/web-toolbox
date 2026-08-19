import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { shuffle } from '../../utils/helpers'
import CodeDebugger from './CodeDebugger'
import { checkCorrect, formatAns, genBank, TYPE_NAME, type Question, type QType } from './questionBank'
import styles from './DebuggingPage.module.css'

/** 题库：默认生成 2000 题（1000 单 + 600 多 + 400 判） */
const QB = genBank()

/** 模拟考试配置 */
interface ExamCfg {
  sC: number
  sS: number
  mC: number
  mS: number
  bC: number
  bS: number
  dur: number
  pass: number
}

/** 错题记录 */
interface WrongItem {
  id: number
  q: string
  u: string
  c: string
  type: QType
}

interface Store {
  seqProg: number
  wrong: WrongItem[]
}

type View = 'home' | 'practice' | 'exam' | 'wrong' | 'code'

/** 调试技能鉴定刷题主页面（源自 DSAP / Debugging-skills） */
export default function DebuggingPage() {
  const [store, setStore] = useLocalStorage<Store>('debug_v5', { seqProg: 0, wrong: [] })
  const [view, setView] = useState<View>('home')
  const [mode, setMode] = useState<'seq' | 'rand' | 'type' | null>(null)
  const [qs, setQs] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({})
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [examCfg, setExamCfg] = useState<ExamCfg | null>(null)
  const [score, setScore] = useState<{ total: number; max: number; pass: boolean } | null>(null)
  const [randCount, setRandCount] = useState(10)
  const timerRef = useRef<number | null>(null)
  const finishExamRef = useRef<() => void>(() => {})

  const q = qs[idx]

  /** 清除考试计时器 */
  const clearTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  /** 返回首页 */
  const goHome = () => {
    clearTimer()
    setView('home')
    setMode(null)
    setScore(null)
  }

  /** 启动一轮练习 */
  const startPractice = (m: 'seq' | 'rand' | 'type', questions: Question[], startIdx = 0) => {
    clearTimer()
    setMode(m)
    setQs(questions)
    setIdx(startIdx)
    setAnswers({})
    setShown({})
    setScore(null)
    setView('practice')
  }

  const openSeq = () => {
    const i = Math.min(store.seqProg, QB.length - 1)
    startPractice('seq', QB, i)
  }
  const openRandom = () => {
    const pool = shuffle(QB)
    startPractice('rand', pool.slice(0, Math.min(randCount, QB.length)))
  }
  const openType = (t: QType) => {
    startPractice('type', QB.filter((x) => x.type === t))
  }

  /** 模拟考试 */
  const doExam = (cfg: ExamCfg) => {
    clearTimer()
    const pool = shuffle(QB)
    const singles = pool.filter((x) => x.type === 'single').slice(0, cfg.sC)
    const multis = pool.filter((x) => x.type === 'multi').slice(0, cfg.mC)
    const bools = pool.filter((x) => x.type === 'bool').slice(0, cfg.bC)
    setMode(null)
    setQs(shuffle([...singles, ...multis, ...bools]))
    setIdx(0)
    setAnswers({})
    setShown({})
    setScore(null)
    setExamCfg(cfg)
    setTimeLeft(cfg.dur * 60)
    setView('exam')
  }

  // 考试倒计时
  useEffect(() => {
    if (view !== 'exam') return
    clearTimer()
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer()
          finishExamRef.current()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  /** 选择答案 */
  const pickAns = (oi: number) => {
    if (!q) return
    if (shown[q.id] && view !== 'exam') return
    if (view === 'exam') {
      if (q.type === 'multi') {
        const cur = (answers[q.id] as number[]) || []
        const next = cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi]
        setAnswers({ ...answers, [q.id]: next })
      } else {
        setAnswers({ ...answers, [q.id]: oi })
      }
      return
    }
    if (q.type === 'multi') {
      const cur = (answers[q.id] as number[]) || []
      const next = cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi]
      setAnswers({ ...answers, [q.id]: next })
      // 多选选够数量后立即判题
      if (next.length >= (q.answer as number[]).length) {
        setShown({ ...shown, [q.id]: true })
        if (!checkCorrect(q, next)) addWrong(q, next)
      }
    } else {
      setAnswers({ ...answers, [q.id]: oi })
      setShown({ ...shown, [q.id]: true })
      if (!checkCorrect(q, oi)) addWrong(q, oi)
    }
  }

  /** 记录错题 */
  const addWrong = (qq: Question, u: number | number[]) => {
    const uStr =
      qq.type === 'multi'
        ? (u as number[]).map((i) => 'ABCDEF'[i]).join('')
        : 'ABCDEF'[u as number]
    setStore((s) => {
      if (s.wrong.find((w) => w.id === qq.id)) return s
      return { ...s, wrong: [...s.wrong, { id: qq.id, q: qq.question, u: uStr, c: formatAns(qq), type: qq.type }] }
    })
  }

  /** 下一题 / 完成 */
  const nextQ = () => {
    if (idx < qs.length - 1) {
      const n = idx + 1
      setIdx(n)
      if (mode === 'seq') setStore((s) => ({ ...s, seqProg: n }))
    } else {
      setIdx(qs.length) // 触发完成视图
    }
  }

  /** 交卷并评分 */
  const finishExam = () => {
    clearTimer()
    if (!examCfg) return
    let total = 0
    qs.forEach((qq) => {
      const u = answers[qq.id]
      if (u === undefined) return
      if (!checkCorrect(qq, u)) {
        addWrong(qq, u)
        return
      }
      if (qq.type === 'single') total += examCfg.sS
      else if (qq.type === 'multi') total += examCfg.mS
      else total += examCfg.bS
    })
    const max = examCfg.sC * examCfg.sS + examCfg.mC * examCfg.mS + examCfg.bC * examCfg.bS
    setScore({ total, max, pass: total >= examCfg.pass })
  }

  // 始终指向最新渲染的 finishExam，避免闭包过期
  finishExamRef.current = finishExam

  /** 移除错题 */
  const removeWrong = (i: number) => {
    setStore((s) => ({ ...s, wrong: s.wrong.filter((_, idx2) => idx2 !== i) }))
  }

  /** 时间格式化 mm:ss */
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  /** 首页视图 */
  const renderHome = () => (
    <div>
      <div className={styles.userCard}>
        <span className={styles.avatar}>👤</span>
        <div>
          <div className={styles.userName}>调试学员</div>
          <div className={styles.userSub}>学无止境，继续加油！</div>
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.funcCard} onClick={openSeq}>
          <span className={styles.funcIcon}>📚</span>
          <span className={styles.funcLabel}>顺序练习</span>
          <span className={styles.funcDesc}>按序刷题，夯实基础</span>
        </div>
        <div className={styles.funcCard} onClick={() => setView('home')}>
          <span className={styles.funcIcon}>🎲</span>
          <span className={styles.funcLabel}>随机练习</span>
          <div className={styles.randPicker}>
            <select className="select" value={randCount} onChange={(e) => setRandCount(Number(e.target.value))} onClick={(e) => e.stopPropagation()}>
              <option value={10}>10题</option>
              <option value={20}>20题</option>
              <option value={50}>50题</option>
              <option value={100}>100题</option>
            </select>
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={(e) => { e.stopPropagation(); openRandom(); }}>
              开始
            </button>
          </div>
        </div>
        <div className={styles.funcCard} onClick={() => doExam({ sC: 40, sS: 1, mC: 20, mS: 2, bC: 20, bS: 1, dur: 40, pass: 60 })}>
          <span className={styles.funcIcon}>📝</span>
          <span className={styles.funcLabel}>模拟考试</span>
          <span className={styles.funcDesc}>40分钟全真实战 · 及格60分</span>
        </div>
        <div className={styles.funcCard} onClick={() => setView('wrong')}>
          <span className={styles.funcIcon}>❌</span>
          <span className={styles.funcLabel}>易错题记录</span>
          <span className={styles.funcDesc}>回顾错题，精准提分（{store.wrong.length}）</span>
        </div>
        <div className={`${styles.funcCard} ${styles.fullRow}`} onClick={() => setView('code')}>
          <span className={styles.funcIcon}>🖥️</span>
          <div>
            <span className={styles.funcLabel}>代码调试练习</span>
            <span className={styles.funcDesc} style={{ display: 'block' }}>修改代码 · 运行验证输出</span>
          </div>
        </div>
        <div className={`${styles.funcCard} ${styles.fullRow}`}>
          <span className={styles.funcIcon}>📋</span>
          <div>
            <span className={styles.funcLabel}>题型练习</span>
            <span className={styles.funcDesc} style={{ display: 'block' }}>
              单选 1000 · 多选 600 · 判断 400
            </span>
            <div className={styles.typeRow}>
              <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => openType('single')}>单选</button>
              <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => openType('multi')}>多选</button>
              <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => openType('bool')}>判断</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /** 答题视图 */
  const renderPractice = () => {
    if (idx >= qs.length) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 18, margin: '10px 0' }}>本轮练习已完成！</div>
          <button className="btn btn-primary" onClick={goHome}>返回首页</button>
        </div>
      )
    }
    const u = answers[q.id]
    const isShown = shown[q.id]
    const correct = isShown ? checkCorrect(q, u) : null
    const isExam = view === 'exam'
    const progress = Math.round((idx / qs.length) * 100)
    const typeCls = styles[q.type]

    return (
      <div>
        {/* 顶部信息 */}
        <div className={styles.progressRow}>
          <span>进度</span>
          <div className={styles.pgBar}>
            <div className={styles.pgFill} style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
          <span className={styles.count}>
            {idx + 1}/{qs.length}
          </span>
        </div>
        {isExam && (
          <div className={styles.timer}>
            ⏱️ 剩余 {fmt(timeLeft)} {timeLeft <= 60 && '（请抓紧！）'}
          </div>
        )}

        {/* 题目 */}
        <div className={`card ${styles.qCard}`}>
          <span className={`${styles.qType} ${typeCls}`}>{TYPE_NAME[q.type]}</span>
          <div className={styles.qStem}>
            {q.id}. {q.question}
          </div>
          <div className={styles.opts}>
            {q.options.map((opt, oi) => {
              const selected = q.type === 'multi' ? (u as number[])?.includes(oi) : u === oi
              let cls = styles.opt
              if (isShown) {
                const isAns = q.type === 'multi' ? (q.answer as number[]).includes(oi) : q.answer === oi
                if (isAns) cls += ` ${styles.optCorrect}`
                else if (selected) cls += ` ${styles.optWrong}`
              } else if (selected) {
                cls += ` ${styles.optSelected}`
              }
              return (
                <div key={oi} className={cls} onClick={() => pickAns(oi)}>
                  <span className={styles.optMarker}>{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </div>
              )
            })}
          </div>
          {isShown && (
            <div className={`${styles.feedback} ${correct ? styles.feedbackGood : styles.feedbackBad}`}>
              {correct ? '✅ 回答正确！' : `❌ 回答错误！正确答案：${formatAns(q)}`}
              <div className={styles.explanation}>💡 {q.explanation || '暂无解析'}</div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {isExam ? (
          <div className={styles.examBtns}>
            <button className="btn btn-outline" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
              上一题
            </button>
            {idx >= qs.length - 1 ? (
              <button className="btn btn-primary" onClick={finishExam}>📝 交卷</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIdx((i) => Math.min(qs.length - 1, i + 1))}>
                下一题
              </button>
            )}
          </div>
        ) : (
          isShown && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={nextQ}>
              {idx >= qs.length - 1 ? '✅ 完成本轮' : '👉 下一题'}
            </button>
          )
        )}
      </div>
    )
  }

  /** 错题本 */
  const renderWrong = () => (
    <div>
      <div className={styles.pageHead}>
        <h2 style={{ margin: 0 }}>❌ 易错题记录</h2>
        <button className="btn" onClick={goHome}>返回</button>
      </div>
      {store.wrong.length === 0 ? (
        <div className="empty-tip">🎉 暂无错题记录</div>
      ) : (
        store.wrong.map((w, i) => (
          <div key={w.id} className="card" style={{ borderLeft: '4px solid var(--red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>#{w.id}</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{TYPE_NAME[w.type]}</span>
            </div>
            <div style={{ margin: '6px 0' }}>{w.q}</div>
            <div style={{ fontSize: 13, display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--red)' }}>你答：{w.u}</span>
              <span>→</span>
              <span style={{ color: 'var(--green)' }}>正确：{w.c}</span>
            </div>
            <button className="btn btn-outline" style={{ marginTop: 8, fontSize: 12 }} onClick={() => removeWrong(i)}>
              移除
            </button>
          </div>
        ))
      )}
    </div>
  )

  /** 考试成绩 */
  const renderScore = () =>
    score && (
      <div className={styles.modalMask}>
        <div className={styles.modal}>
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>📋 成绩单</div>
          <div style={{ textAlign: 'center', fontSize: 42, fontWeight: 800, color: score.pass ? 'var(--green)' : 'var(--red)' }}>
            {score.total}
            <span style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 400 }}> / {score.max}</span>
          </div>
          <div style={{ textAlign: 'center', margin: '10px 0 16px', fontWeight: 700, color: score.pass ? 'var(--green)' : 'var(--red)' }}>
            {score.pass ? '🎉 恭喜通过！' : '😞 未通过（及格线60分）'}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={goHome}>
            关闭
          </button>
        </div>
      </div>
    )

  /** 根据视图渲染 */
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.h1}>🛠️ 调试技能鉴定刷题</h1>
        <p className={styles.sub}>顺序 / 随机 / 题型 / 模拟考试 · 2000 道题（源自 DSAP 与 Debugging 仓库）</p>
      </div>
      {view === 'home' && renderHome()}
      {(view === 'practice' || view === 'exam') && renderPractice()}
      {view === 'wrong' && renderWrong()}
      {view === 'code' && (
        <div>
          <div className={styles.pageHead}>
            <h2 style={{ margin: 0 }}>🖥️ 代码调试练习</h2>
            <button className="btn" onClick={goHome}>返回</button>
          </div>
          <div className="card">
            <CodeDebugger />
          </div>
        </div>
      )}
      {renderScore()}
    </div>
  )
}
