import { useEffect, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import styles from './RadioExamPage.module.css'

/** 题目结构 */
interface Question {
  id: number
  text: string
  options: string[]
  correct: string
}

/** 阶段状态 */
interface PhaseState {
  unlocked: boolean
  watched: boolean
  answers: Record<number, string>
  allCorrect: boolean
}

const EMPTY_PHASE: PhaseState = { unlocked: false, watched: false, answers: {}, allCorrect: false }

/** 第一阶段题库（问题上视频） */
const phaseAQuestions: Question[] = [
  {
    id: 1,
    text: '人员进入一更后，首先需要完成的动作是：',
    options: [
      'A. 直接进入二更更换洁净服',
      'B. 更换外套、换鞋、戴一次性帽子，填写出入记录，并进行手部消毒',
      'C. 佩戴个人剂量胸章和手环',
      'D. 填写《外来人员进入放射性工作区域安全告知书》',
    ],
    correct: 'B',
  },
  {
    id: 2,
    text: '手部消毒过程中，自动喷淋消毒液后下一步操作是：',
    options: ['A. 七步洗手法', 'B. 流动纯化水冲洗', 'C. 烘手器干燥', 'D. 检查手部清洁度'],
    correct: 'C',
  },
  {
    id: 3,
    text: '喷淋消毒液时，双手应伸至以下哪个设备的红外感应区？',
    options: ['A. 自动烘手器', 'B. 自动杀菌净手器', 'C. 洗手池水龙头', 'D. 洁净服存放柜'],
    correct: 'B',
  },
]

/** 第二阶段题库（问题下视频） */
const phaseBQuestions: Question[] = [
  {
    id: 1,
    text: '一次性PE手套或一次性灭菌橡胶外科手套在穿戴时，应确保：',
    options: ['A. 手套口覆盖在袖口外', 'B. 袖口扎进手套内', 'C. 手套与袖口之间留有缝隙', 'D. 无需检查有效期'],
    correct: 'B',
  },
  {
    id: 2,
    text: '进入二更（8202）前，戴一次性口罩的正确要求是：',
    options: [
      'A. 口罩只需遮盖口部',
      'B. 口罩可重复使用',
      'C. 检查有效期，确保完全遮盖口鼻',
      'D. 从口袋内取出后直接佩戴，无需检查',
    ],
    correct: 'C',
  },
  {
    id: 3,
    text: '穿洁净服过程中，以下哪项操作不符合规程？',
    options: [
      'A. 通过穿衣镜穿戴',
      'B. 脚不得接触地面',
      'C. 洁净服脚部以外的部分可以接触地面',
      'D. 头发、胡须等全部遮盖',
    ],
    correct: 'C',
  },
  {
    id: 4,
    text: '工作人员进入洁净区前需要佩戴的个人剂量监测器具包括：',
    options: ['A. 铅衣和铅手套', 'B. 剂量胸章、手环等', 'C. α、β表面污染仪', 'D. 一次性PE手套'],
    correct: 'B',
  },
  {
    id: 5,
    text: '若工作人员只到监督区进行操作，应穿哪种颜色的洁净服？',
    options: ['A. 白色', 'B. 黄色', 'C. 蓝色', 'D. 绿色'],
    correct: 'C',
  },
  {
    id: 6,
    text: '进入二更（8202）后，首先应进行的操作是：',
    options: ['A. 更换洁净服', 'B. 佩戴个人剂量胸章', 'C. 戴一次性口罩', 'D. 选择黄色或蓝色洁净服'],
    correct: 'C',
  },
]

/** 培训视频地址（原仓库为 GitHub 文件，需部署后替换为可播放地址） */
const VIDEO_A = 'https://github.com/sd3247930/radio-exam/blob/main/question_up.mp4'
const VIDEO_B = 'https://github.com/sd3247930/radio-exam/blob/main/question_down.mp4'

/**
 * 培训闯关（源自 radio-exam）：
 * 两个阶段，先看视频并"标记已看完"解锁题目，
 * 全部答对才通关；答错需重新观看视频；第二阶段依赖第一阶段通关。
 */
export default function RadioExamPage() {
  const [phaseA, setPhaseA] = useLocalStorage<PhaseState>('radio_phaseA', EMPTY_PHASE)
  const [phaseB, setPhaseB] = useLocalStorage<PhaseState>('radio_phaseB', EMPTY_PHASE)
  const [msgA, setMsgA] = useState('')
  const [msgB, setMsgB] = useState('')

  // 消息自动消失
  useEffect(() => {
    if (!msgA) return
    const t = setTimeout(() => setMsgA(''), 3000)
    return () => clearTimeout(t)
  }, [msgA])
  useEffect(() => {
    if (!msgB) return
    const t = setTimeout(() => setMsgB(''), 3000)
    return () => clearTimeout(t)
  }, [msgB])

  /** 标记已看完视频 */
  const markWatched = (phase: 'A' | 'B') => {
    if (phase === 'A') {
      if (phaseA.allCorrect) return
      setPhaseA({ ...phaseA, watched: true, unlocked: true })
    } else {
      if (!phaseA.allCorrect) return alert('请先完成第一阶段并全对，再观看第二阶段视频')
      if (phaseB.allCorrect) return
      setPhaseB({ ...phaseB, watched: true, unlocked: true })
    }
  }

  /** 选择答案 */
  const pick = (phase: 'A' | 'B', qid: number, letter: string) => {
    const st = phase === 'A' ? phaseA : phaseB
    if (st.allCorrect) return
    if (phase === 'A') setPhaseA({ ...phaseA, answers: { ...phaseA.answers, [qid]: letter } })
    else setPhaseB({ ...phaseB, answers: { ...phaseB.answers, [qid]: letter } })
  }

  /** 提交阶段（全部正确才通关） */
  const submit = (phase: 'A' | 'B') => {
    const questions = phase === 'A' ? phaseAQuestions : phaseBQuestions
    const st = phase === 'A' ? phaseA : phaseB
    const setSt = phase === 'A' ? setPhaseA : setPhaseB
    const setMsg = phase === 'A' ? setMsgA : setMsgB

    if (phase === 'B' && !phaseA.allCorrect) return alert('必须先完成第一阶段所有题目')
    if (st.allCorrect) return

    // 检查是否全部作答
    if (questions.some((q) => !st.answers[q.id])) {
      setMsg('⚠️ 请完成本阶段所有题目的选择后再提交。')
      return
    }

    let hasError = false
    questions.forEach((q) => {
      if (st.answers[q.id] !== q.correct) hasError = true
    })

    if (hasError) {
      // 答错：锁定阶段，要求重新观看视频
      setSt({ unlocked: false, watched: false, answers: {}, allCorrect: false })
      setMsg(`❌ 存在错误答案！请重新观看${phase === 'A' ? '问题上' : '问题下'}视频并再次标记后重试。`)
    } else {
      // 全对通关
      setSt({ ...st, allCorrect: true })
      setMsg(phase === 'A' ? '🎉 第一阶段全部正确！第二阶段已解锁。' : '🏆 恭喜！第二阶段全部正确，培训圆满完成！')
    }
  }

  /** 重置单个阶段 */
  const resetPhase = (phase: 'A' | 'B') => {
    const st = phase === 'A' ? phaseA : phaseB
    if (st.allCorrect) return
    if (phase === 'A') setPhaseA({ ...EMPTY_PHASE })
    else setPhaseB({ ...EMPTY_PHASE })
  }

  /** 重置全部进度 */
  const resetAll = () => {
    if (!confirm('确定要重置全部进度吗？')) return
    setPhaseA({ ...EMPTY_PHASE })
    setPhaseB({ ...EMPTY_PHASE })
    setMsgA('')
    setMsgB('')
  }

  /** 分享当前页面链接（替代原 QRCode） */
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: '放射性药品更衣与手消培训', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('链接已复制到剪贴板，可粘贴发送给同事。')
      }
    } catch {
      /* 用户取消分享 */
    }
  }

  /** 渲染一个阶段 */
  const renderPhase = (phase: 'A' | 'B') => {
    const questions = phase === 'A' ? phaseAQuestions : phaseBQuestions
    const st = phase === 'A' ? phaseA : phaseB
    const isA = phase === 'A'
    const video = isA ? VIDEO_A : VIDEO_B
    const phaseTitle = isA ? '📹 第一阶段 · 问题上视频' : '🎥 第二阶段 · 问题下视频'

    // 解锁判断
    const locked =
      st.allCorrect ? 'done' : st.unlocked ? 'open' : isA ? 'locked-video' : phaseA.allCorrect ? 'locked-video' : 'locked-phase'

    return (
      <div className="card">
        <div className={styles.phaseHeader}>
          <span className={styles.phaseTitle}>{phaseTitle}</span>
          <span className={`${styles.badge} ${styles[locked]}`}>
            {st.allCorrect ? '🏆 已通关' : st.unlocked ? '📖 答题中 (需全对)' : '🔒 未解锁'}
          </span>
        </div>

        {/* 视频区 */}
        <div className={styles.videoArea}>
          <video key={video} controls preload="metadata" className={styles.video}>
            <source src={video} />
            您的浏览器不支持 video 标签。请将视频地址替换为可播放的培训视频 URL。
          </video>
          <div className={styles.watchControl}>
            <span className={styles.watchStatus}>
              {st.allCorrect
                ? '✅ 已通关'
                : st.watched
                  ? '✅ 已观看并标记，现在可以答题！'
                  : '⏳ 未观看 / 未确认'}
            </span>
            <button
              className={`btn btn-primary ${styles.markBtn}`}
              disabled={st.allCorrect || (isA ? false : !phaseA.allCorrect)}
              onClick={() => markWatched(phase)}
            >
              ✅ 标记我已看完视频
            </button>
          </div>
        </div>

        {/* 题目区 */}
        {locked === 'locked-video' && (
          <div className={styles.lockedMsg}>
            {isA
              ? '🔐 请先观看视频并点击「标记我已看完」解锁题目'
              : '🎬 请观看第二阶段视频并点击「标记我已看完」解锁题目'}
          </div>
        )}
        {locked === 'locked-phase' && (
          <div className={styles.lockedMsg}>🚫 必须先完成第一阶段（问题上视频全部正确）才能解锁第二阶段。</div>
        )}
        {locked !== 'locked-video' && locked !== 'locked-phase' && (
          <>
            <div className={styles.questions}>
              {questions.map((q) => (
                <div key={q.id} className={styles.questionItem}>
                  <div className={styles.qText}>
                    {q.id}. {q.text}
                  </div>
                  <div className={styles.options}>
                    {q.options.map((opt) => {
                      const letter = opt.charAt(0)
                      const checked = st.answers[q.id] === letter
                      return (
                        <label key={letter} className={`${styles.optionLabel} ${checked ? styles.optionChecked : ''}`}>
                          <input
                            type="radio"
                            name={`${phase}-q${q.id}`}
                            value={letter}
                            checked={checked}
                            disabled={st.allCorrect}
                            onChange={() => pick(phase, q.id, letter)}
                          />
                          <span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className={styles.feedback}>
                    {st.allCorrect ? '✅ 正确' : ''}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.phaseActions}>
              <button className="btn" style={{ background: '#6c757d', color: '#fff' }} onClick={() => resetPhase(phase)}>
                🗑️ 重置本阶段
              </button>
              <button className="btn btn-primary" onClick={() => submit(phase)}>
                📝 提交本阶段 (全部正确才通关)
              </button>
            </div>
          </>
        )}
        {st.allCorrect && (
          <div className={styles.successCongrats}>
            {isA ? '✅ 本阶段已通关！继续第二阶段。' : '🎉 恭喜！第二阶段已全对通关，培训完成！'}
          </div>
        )}
        {(isA ? msgA : msgB) && <div className={styles.feedbackMsg}>{isA ? msgA : msgB}</div>}
      </div>
    )
  }

  return (
    <div>
      <div className={styles.headerCard}>
        <h1 className={styles.h1}>☢️ 放射性药品更衣与手消培训</h1>
        <p className={styles.sub}>分阶段视频学习 · 必须全对闯关 · 错题强制重温视频</p>
        <div className={styles.headerActions}>
          <button className="btn" style={{ background: '#475569', color: '#fff' }} onClick={resetAll}>
            🔄 重置全部进度
          </button>
          <button className="btn" style={{ background: '#3b82f6', color: '#fff' }} onClick={share}>
            📤 分享链接
          </button>
        </div>
      </div>

      {renderPhase('A')}
      {renderPhase('B')}

      <div className={styles.footerNote}>
        ✅ 规则：每个阶段必须完整观看视频并手动标记「已观看」，然后作答全部题目。若有任一题错误，该阶段立即锁止，
        需重新观看视频并重新标记，再次答题，直至全对通关。
        <br />
        💡 视频需部署后替换为可播放地址（原仓库为 GitHub 文件链接）。
      </div>
    </div>
  )
}
