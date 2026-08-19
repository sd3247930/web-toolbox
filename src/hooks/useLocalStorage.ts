import { useEffect, useState } from 'react'

/**
 * 自定义 Hook：读写 localStorage 的 JSON 值。
 * @param key 存储键
 * @param initial 初始值（无缓存时使用）
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略存储失败（如隐私模式）
    }
  }, [key, value])

  return [value, setValue] as const
}
