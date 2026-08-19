/** 排序动画步骤 */
export interface SortStep {
  arr: number[]
  compare: [number, number] | null
  swap: [number, number] | null
  sorted: number[]
  message: string
}

/** 二分查找步骤 */
export interface SearchStep {
  arr: number[]
  lo: number
  hi: number
  mid: number | null
  found: boolean
  message: string
}

/** 图遍历步骤 */
export interface GraphStep {
  visited: number[]
  current: number | null
  frontier: number[]
  message: string
}
