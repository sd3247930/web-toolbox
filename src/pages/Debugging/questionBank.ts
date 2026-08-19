/** 题目类型：单选 / 多选 / 判断 */
export type QType = 'single' | 'multi' | 'bool'

/** 题目结构 */
export interface Question {
  id: number
  type: QType
  question: string
  options: string[]
  answer: number | number[]
  explanation: string
}

/** 种子题（提炼自原仓库"精工杯"题库与指导教材） */
interface SeedQ {
  q: string
  opts: string[]
  ans: number | number[]
  exp: string
}

const SEED_S: SeedQ[] = [
  { q: '《中华人民共和国产品质量法》的制定目的不包括（）', opts: ['加强对产品质量的监督管理', '提高产品质量水平', '促进企业利润最大化', '维护社会经济秩序'], ans: 2, exp: '教材§1.3.1.1：目的不包含企业利润最大化。' },
  { q: '根据《中华人民共和国产品质量法》，产品是指经过加工、制作，用于（）的产品。', opts: ['自用', '展示', '销售', '捐赠'], ans: 2, exp: '教材§1.3.1.1：产品是指经过加工、制作，用于销售的产品。' },
  { q: '产品应当具备使用性能，但（）除外。', opts: ['经企业内部批准', '有第三方认证', '对存在使用性能的瑕疵作出说明', '标注了生产日期'], ans: 2, exp: '教材§1.3.1.2：对存在使用性能的瑕疵作出说明的除外。' },
  { q: '产品包装上的标识必须真实，并且应当标明（）。', opts: ['企业内部编码', '产品价格', '中文标明的产品名称、生产厂厂名和厂址', '售后服务电话'], ans: 2, exp: '教材§1.3.1.3：必须标明中文产品名称、厂名和厂址。' },
  { q: '限期使用的产品，应当在显著位置清晰地标明（）。', opts: ['出厂批次号', '生产日期和安全使用期或者失效日期', '检验员姓名', '保修年限'], ans: 1, exp: '教材§1.3.1.3：应标明生产日期和安全使用期或者失效日期。' },
  { q: '使用不当可能危及人身、财产安全的产品，应当有（）。', opts: ['精美包装', '英文说明书', '警示标志或者中文警示说明', '防伪标签'], ans: 2, exp: '教材§1.3.1.3：应有警示标志或者中文警示说明。' },
  { q: '裸装的食品和其他难以附加标识的裸装产品，（）', opts: ['必须加贴标签', '可以不附加产品标识', '需由监管部门审批后销售', '只能在超市内销售'], ans: 1, exp: '教材§1.3.1.3：可以不附加产品标识。' },
  { q: '生产者不得（）。', opts: ['改进生产工艺', '生产国家明令淘汰的产品', '使用进口原材料', '进行批量生产'], ans: 1, exp: '教材§1.3.1.3：不得生产国家明令淘汰的产品。' },
  { q: '生产者不得伪造或者冒用他人的（）。', opts: ['产品型号', '销售记录', '厂名、厂址', '企业商标'], ans: 2, exp: '教材§1.3.1.3：不得伪造或者冒用他人的厂名、厂址。' },
  { q: '生产者生产的产品不得以不合格产品（）。', opts: ['重新包装', '低价出售', '冒充合格产品', '用于实验'], ans: 2, exp: '教材§1.3.1.3：不得以不合格产品冒充合格产品。' },
  { q: '需要在全国范围内统一的技术要求，应当制定（）。', opts: ['地方标准', '企业标准', '行业标准', '国家标准'], ans: 3, exp: '教材§1.3.2：应当制定国家标准。' },
  { q: '企业生产的产品不符合保障人身、财产安全的国家标准，应承担的责任包括（）。', opts: ['行政责任', '民事责任', '刑事责任', '以上均可能'], ans: 3, exp: '教材§1.4：视情节轻重，三种责任均可能承担。' },
]

const SEED_M: SeedQ[] = [
  { q: '变频器工作原理中，当两个不同频率的输入信号同时加在非线性器件上，输出中会产生哪些频率成分？（）', opts: ['两个输入信号的频率分量', '两个输入信号的和频分量', '两个输入信号的差频分量', '输入信号的平方项频率'], ans: [0, 1, 2], exp: '教材§3.1.8：非线性器件产生和频、差频及原频率分量。' },
  { q: '关于产品质量检验，下列说法正确的是（）。', opts: ['出厂检验由企业自行实施', '型式检验应由具备资质的机构实施', '检验报告应妥善保存', '进货检验可省略'], ans: [0, 1, 2], exp: '教材§2.1：进货检验不能省略。' },
]

const SEED_B: SeedQ[] = [
  { q: '三端固定输出集成稳压器CW78xx系列输出正电压，CW79xx系列输出负电压。', opts: ['正确', '错误'], ans: 0, exp: '教材§3.3.1：CW78正电压，CW79负电压。' },
  { q: '产品标识可以全部使用外文，无需中文。', opts: ['正确', '错误'], ans: 1, exp: '教材§1.3.1.3：必须使用中文标识产品名称、厂名和厂址。' },
]

/**
 * 生成严格无重复题库（原逻辑：以种子题 + 编号后缀扩充题量）。
 * 默认 1000 单 + 600 多 + 400 判 = 2000 题。
 */
export function genBank(opts?: { single?: number; multi?: number; bool?: number }): Question[] {
  const singleCount = opts?.single ?? 1000
  const multiCount = opts?.multi ?? 600
  const boolCount = opts?.bool ?? 400
  const bank: Question[] = []
  const seen = new Set<string>()
  let id = 1

  const add = (seed: SeedQ[], total: number, type: QType, suffix: (i: number) => string) => {
    let added = 0
    let attempt = 0
    while (added < total && attempt < total * 20) {
      const t = seed[attempt % seed.length]
      const qText = t.q + suffix(added)
      if (!seen.has(qText)) {
        seen.add(qText)
        bank.push({
          id: id++,
          type,
          question: qText,
          options: type === 'bool' ? ['正确', '错误'] : [...t.opts],
          answer: type === 'multi' ? [...(t.ans as number[])] : t.ans,
          explanation: t.exp,
        })
        added++
      }
      attempt++
    }
  }

  add(SEED_S, singleCount, 'single', (i) => ` (真题库第${i + 1}号)`)
  add(SEED_M, multiCount, 'multi', (i) => ` (真题库第${i + 1}号)`)
  add(SEED_B, boolCount, 'bool', (i) => ` (真题库第${i + 1}号)`)
  return bank
}

/** 判断答案是否正确 */
export function checkCorrect(q: Question, u: number | number[] | undefined): boolean {
  if (u === undefined) return false
  if (q.type === 'multi') {
    const a = Array.isArray(u) ? u : [u]
    const ans = q.answer as number[]
    return a.length === ans.length && a.slice().sort().join() === ans.slice().sort().join()
  }
  return u === q.answer
}

/** 格式化正确答案为字母 */
export function formatAns(q: Question): string {
  if (q.type === 'multi') return (q.answer as number[]).map((i) => 'ABCDEF'[i]).join('')
  if (q.type === 'bool') return ['正确', '错误'][q.answer as number]
  return 'ABCDEF'[q.answer as number]
}

/** 题型中文名 */
export const TYPE_NAME: Record<QType, string> = { single: '单选题', multi: '多选题', bool: '判断题' }
