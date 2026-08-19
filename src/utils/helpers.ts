/** 通用工具函数 */

/** 计算 dateStr（YYYY-MM-DD）距离今天的天数（负数表示已过期） */
export function getDaysDiff(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/** 提醒等级：'urgent'（≤7天）、'warning'（≤30天）、'normal' */
export type RemindLevel = 'urgent' | 'warning' | 'normal'
export function getRemindLevel(daysDiff: number): RemindLevel {
  if (daysDiff <= 7 && daysDiff >= 0) return 'urgent'
  if (daysDiff <= 30 && daysDiff >= 0) return 'warning'
  return 'normal'
}

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** 生成唯一 id */
export function genId(): string {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

/** Fisher-Yates 洗牌 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 简单防 XSS 转义 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[m]
  })
}
