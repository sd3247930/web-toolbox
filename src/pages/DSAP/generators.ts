import type { SortStep, SearchStep, GraphStep } from './types'

/* ========== 排序算法步骤生成器 ========== */

/** 冒泡排序 */
export function bubbleSortSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const sorted: number[] = []
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ arr: [...arr], compare: [j, j + 1], swap: null, sorted: [...sorted], message: `比较 arr[${j}]=${arr[j]} 与 arr[${j + 1}]=${arr[j + 1]}` })
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        steps.push({ arr: [...arr], compare: null, swap: [j, j + 1], sorted: [...sorted], message: `交换：${arr[j]} 与 ${arr[j + 1]}` })
      }
    }
    sorted.push(n - 1 - i)
    steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...sorted], message: `${arr[n - 1 - i]} 已就位` })
  }
  sorted.push(0)
  steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...sorted], message: '✅ 排序完成' })
  return steps
}

/** 选择排序 */
export function selectionSortSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const sorted: number[] = []
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ arr: [...arr], compare: [minIdx, j], swap: null, sorted: [...sorted], message: `比较：当前最小 ${arr[minIdx]} vs arr[${j}]=${arr[j]}` })
      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({ arr: [...arr], compare: [minIdx, j], swap: null, sorted: [...sorted], message: `更新最小值为 arr[${minIdx}]=${arr[minIdx]}` })
      }
    }
    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      steps.push({ arr: [...arr], compare: null, swap: [i, minIdx], sorted: [...sorted], message: `将最小值 ${arr[i]} 放到位置 ${i}` })
    }
    sorted.push(i)
  }
  sorted.push(n - 1)
  steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...sorted], message: '✅ 排序完成' })
  return steps
}

/** 插入排序 */
export function insertionSortSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const sorted: number[] = []
  const n = arr.length
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      steps.push({ arr: [...arr], compare: [j, i], swap: null, sorted: [...sorted], message: `arr[${j}]=${arr[j]} > key=${key}，向后移动` })
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
    sorted.push(i)
    steps.push({ arr: [...arr], compare: null, swap: [j + 1, i], sorted: [...sorted], message: `将 key=${key} 插入位置 ${j + 1}` })
  }
  steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...Array(n).keys()], message: '✅ 排序完成' })
  return steps
}

/** 归并排序（自底向上） */
export function mergeSortSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const sorted: number[] = []
  const n = arr.length
  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n; left += 2 * width) {
      const mid = Math.min(left + width, n)
      const right = Math.min(left + 2 * width, n)
      const leftPart = arr.slice(left, mid)
      const rightPart = arr.slice(mid, right)
      let i = 0
      let j = 0
      let k = left
      while (i < leftPart.length && j < rightPart.length) {
        steps.push({ arr: [...arr], compare: [left + i, mid + j], swap: null, sorted: [...sorted], message: `归并比较 ${leftPart[i]} 与 ${rightPart[j]}` })
        arr[k++] = leftPart[i] <= rightPart[j] ? leftPart[i++] : rightPart[j++]
      }
      while (i < leftPart.length) arr[k++] = leftPart[i++]
      while (j < rightPart.length) arr[k++] = rightPart[j++]
      steps.push({ arr: [...arr], compare: null, swap: [left, right - 1], sorted: [...sorted], message: `合并区间 [${left}, ${right - 1}]` })
    }
  }
  steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...Array(n).keys()], message: '✅ 排序完成' })
  return steps
}

/** 快速排序（显式栈） */
export function quickSortSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const sorted: number[] = []
  const n = arr.length
  const stack: [number, number][] = [[0, n - 1]]
  const partition = (lo: number, hi: number): number => {
    const pivot = arr[hi]
    steps.push({ arr: [...arr], compare: [hi, hi], swap: null, sorted: [...sorted], message: `选取基准 pivot = ${pivot}` })
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      steps.push({ arr: [...arr], compare: [j, hi], swap: null, sorted: [...sorted], message: `比较 arr[${j}]=${arr[j]} 与 pivot=${pivot}` })
      if (arr[j] < pivot) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({ arr: [...arr], compare: null, swap: [i, j], sorted: [...sorted], message: `交换 ${arr[i]} 与 ${arr[j]}` })
        }
      }
    }
    i++
    ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
    steps.push({ arr: [...arr], compare: null, swap: [i, hi], sorted: [...sorted], message: `基准 ${arr[i]} 归位到位置 ${i}` })
    sorted.push(i)
    return i
  }
  while (stack.length) {
    const [lo, hi] = stack.pop()!
    if (lo >= hi) {
      if (!sorted.includes(lo)) sorted.push(lo)
      continue
    }
    const p = partition(lo, hi)
    if (p - 1 > lo) stack.push([lo, p - 1])
    if (p + 1 < hi) stack.push([p + 1, hi])
  }
  steps.push({ arr: [...arr], compare: null, swap: null, sorted: [...Array(n).keys()], message: '✅ 排序完成' })
  return steps
}

/* ========== 二分查找步骤生成器 ========== */
export function binarySearchSteps(sortedArr: number[], target: number): SearchStep[] {
  const arr = [...sortedArr]
  const steps: SearchStep[] = []
  let lo = 0
  let hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ arr, lo, hi, mid, found: false, message: `中间下标 mid=${mid}，arr[${mid}]=${arr[mid]}` })
    if (arr[mid] === target) {
      steps.push({ arr, lo, hi, mid, found: true, message: `✅ 找到目标 ${target}，位于下标 ${mid}` })
      return steps
    } else if (arr[mid] < target) {
      lo = mid + 1
      steps.push({ arr, lo, hi, mid: null, found: false, message: `${arr[mid]} < ${target}，向右半区查找` })
    } else {
      hi = mid - 1
      steps.push({ arr, lo, hi, mid: null, found: false, message: `${arr[mid]} > ${target}，向左半区查找` })
    }
  }
  steps.push({ arr, lo, hi, mid: null, found: false, message: `❌ 未找到目标 ${target}` })
  return steps
}

/* ========== 图遍历步骤生成器（固定示例图） ========== */
/** 无向示例图：邻接表 */
export const SAMPLE_GRAPH: Record<number, number[]> = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 5],
  3: [1],
  4: [1, 5],
  5: [2, 4],
}

/** 深度优先遍历 DFS */
export function dfsSteps(start = 0): GraphStep[] {
  const visited: number[] = []
  const steps: GraphStep[] = []
  const stack: number[] = [start]
  const seen = new Set<number>()
  while (stack.length) {
    const cur = stack.pop()!
    if (seen.has(cur)) continue
    seen.add(cur)
    visited.push(cur)
    steps.push({ visited: [...visited], current: cur, frontier: [...stack], message: `访问节点 ${cur}` })
    const neighbors = [...SAMPLE_GRAPH[cur]].reverse()
    neighbors.forEach((nb) => {
      if (!seen.has(nb)) stack.push(nb)
    })
  }
  steps.push({ visited: [...visited], current: null, frontier: [], message: '✅ 遍历完成' })
  return steps
}

/** 广度优先遍历 BFS */
export function bfsSteps(start = 0): GraphStep[] {
  const visited: number[] = []
  const steps: GraphStep[] = []
  const queue: number[] = [start]
  const seen = new Set<number>([start])
  while (queue.length) {
    const cur = queue.shift()!
    visited.push(cur)
    steps.push({ visited: [...visited], current: cur, frontier: [...queue], message: `访问节点 ${cur}` })
    SAMPLE_GRAPH[cur].forEach((nb) => {
      if (!seen.has(nb)) {
        seen.add(nb)
        queue.push(nb)
      }
    })
  }
  steps.push({ visited: [...visited], current: null, frontier: [], message: '✅ 遍历完成' })
  return steps
}
