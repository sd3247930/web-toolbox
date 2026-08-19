import { useRef, useState } from 'react'
import styles from './CodeDebugger.module.css'

/** 预置"有 Bug 的代码片段"，供学员调试修复 */
const SNIPPETS: { name: string; code: string; expect: string }[] = [
  {
    name: '求和函数（越界 Bug）',
    code: `function sum(arr) {
  let total = 0;
  for (let i = 1; i <= arr.length; i++) {
    total += arr[i];
  }
  return total;
}
console.log(sum([1, 2, 3]));`,
    expect: '期望输出：6（循环应从 0 开始，且不越界）',
  },
  {
    name: '偶数过滤（条件 Bug）',
    code: `function filterEven(nums) {
  return nums.filter(n => n % 2 === 1);
}
console.log(filterEven([1, 2, 3, 4, 5]));`,
    expect: '期望输出：[2, 4]（应过滤偶数，不是奇数）',
  },
  {
    name: '字符串反转（方法 Bug）',
    code: `function reverse(str) {
  return str.split('').reverse().join('');
}
console.log(reverse('hello'));`,
    expect: '期望输出：olleh（本片段无 Bug，可自行修改测试）',
  },
]

/**
 * 代码调试环境：修改 JavaScript 代码并运行，查看输出与错误信息。
 * 通过自定义 console 捕获日志，try/catch 捕获运行错误。
 */
export default function CodeDebugger() {
  const [code, setCode] = useState(SNIPPETS[0].code)
  const [expect, setExpect] = useState(SNIPPETS[0].expect)
  const [output, setOutput] = useState<string[]>([])
  const [error, setError] = useState('')
  const [time, setTime] = useState(0)
  const lastCode = useRef('')

  const loadSnippet = (i: number) => {
    setCode(SNIPPETS[i].code)
    setExpect(SNIPPETS[i].expect)
    setOutput([])
    setError('')
  }

  /** 运行代码：捕获 console.log 与运行时错误 */
  const run = () => {
    if (code === lastCode.current && output.length === 0 && !error) {
      // 同一代码再次运行也继续执行
    }
    setOutput([])
    setError('')
    const logs: string[] = []
    const fakeConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push('❌ ' + args.map(String).join(' ')),
      warn: (...args: unknown[]) => logs.push('⚠️ ' + args.map(String).join(' ')),
      info: (...args: unknown[]) => logs.push('ℹ️ ' + args.map(String).join(' ')),
    }
    const t0 = performance.now()
    try {
      const fn = new Function('console', `"use strict";\n${code}`)
      const result = fn(fakeConsole)
      if (result !== undefined) logs.push('→ 返回值: ' + String(result))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setTime(Math.round((performance.now() - t0) * 100) / 100)
    setOutput(logs)
    lastCode.current = code
  }

  return (
    <div>
      <div className={styles.snippetRow}>
        {SNIPPETS.map((s, i) => (
          <button key={s.name} className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => loadSnippet(i)}>
            {s.name}
          </button>
        ))}
      </div>
      <div className={styles.editorRow}>
        <div className={styles.editorCol}>
          <div className={styles.colTitle}>📝 代码（可直接修改）</div>
          <textarea
            className={styles.editor}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className={styles.expect}>{expect}</div>
        </div>
        <div className={styles.editorCol}>
          <div className={styles.colTitle}>🖥️ 运行结果</div>
          <div className={styles.output}>
            {output.length === 0 && !error && <div className={styles.empty}>点击「运行」查看输出</div>}
            {output.map((line, i) => (
              <div key={i} className={styles.line}>
                {line}
              </div>
            ))}
            {error && <div className={styles.error}>💥 运行错误：{error}</div>}
            {(output.length > 0 || error) && <div className={styles.time}>⏱ {time} ms</div>}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <button className="btn btn-primary" onClick={run}>
          ▶ 运行代码
        </button>
      </div>
    </div>
  )
}
