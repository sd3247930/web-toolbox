import { useEffect, useMemo, useState } from 'react'
import styles from './InstallGuide.module.css'

/** Chrome/Edge 的安装事件（Safari、多数国产浏览器与 WebView 不会触发） */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Brand = 'honor' | 'huawei' | 'xiaomi' | 'oppo' | 'vivo' | 'samsung' | 'other'
type BrowserKind =
  | 'chrome'
  | 'edge'
  | 'miui'
  | 'heytap'
  | 'honor'
  | 'samsung'
  | 'wechat'
  | 'qq'
  | 'dingtalk'
  | 'safari'
  | 'other'

/** 顶栏「安装」按钮通过该事件唤起引导 */
export const OPEN_INSTALL_GUIDE = 'open-install-guide'

const DISMISS_KEY = 'install_guide_dismissed'
/** 等待 beforeinstallprompt 的兜底时间，超时后改为展示手动步骤 */
const MANUAL_FALLBACK_MS = 2500

function detectBrand(ua: string): Brand {
  if (/HONOR|MagicOS/i.test(ua)) return 'honor'
  if (/Huawei|HarmonyOS/i.test(ua)) return 'huawei'
  if (/MIUI|Xiaomi|HyperOS|Redmi|POCO/i.test(ua)) return 'xiaomi'
  if (/OPPO|ColorOS|HeyTap|realme|OnePlus/i.test(ua)) return 'oppo'
  if (/vivo|iQOO|Funtouch|OriginOS/i.test(ua)) return 'vivo'
  if (/Samsung|SM-[A-Z0-9]/i.test(ua)) return 'samsung'
  return 'other'
}

function detectBrowser(ua: string): BrowserKind {
  if (/MicroMessenger/i.test(ua)) return 'wechat'
  if (/DingTalk/i.test(ua)) return 'dingtalk'
  if (/QQ\/|QQBrowser/i.test(ua)) return 'qq'
  if (/MiuiBrowser/i.test(ua)) return 'miui'
  if (/HeyTapBrowser|OppoBrowser/i.test(ua)) return 'heytap'
  if (/HONORBrowser|HuaweiBrowser/i.test(ua)) return 'honor'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/Edg/i.test(ua)) return 'edge'
  if (/Chrome|CriOS/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua)) return 'safari'
  return 'other'
}

function isIOSDevice(ua: string): boolean {
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document)
}

/** 应用内浏览器（微信/QQ/钉钉）无法安装 PWA，必须引导用户换到系统浏览器 */
const IN_APP_BROWSERS: BrowserKind[] = ['wechat', 'qq', 'dingtalk']

interface ManualSteps {
  title: string
  steps: string[]
}

function manualSteps(browser: BrowserKind, isIOS: boolean): ManualSteps {
  switch (browser) {
    case 'wechat':
      return {
        title: '当前在微信内置浏览器中打开，无法直接安装',
        steps: [
          '点右上角「···」→ 选择「在浏览器中打开」',
          '在系统浏览器里打开后，再点菜单里的「安装应用」或「添加到主屏幕」',
        ],
      }
    case 'qq':
      return {
        title: '当前在 QQ 内置浏览器中打开，无法直接安装',
        steps: ['点右上角「···」→ 选择「在浏览器中打开」', '在系统浏览器里点菜单「添加到主屏幕」'],
      }
    case 'dingtalk':
      return {
        title: '当前在钉钉内置浏览器中打开，无法直接安装',
        steps: ['点右上角「···」→ 选择「在浏览器中打开」', '在系统浏览器里点菜单「添加到主屏幕」'],
      }
    case 'safari':
      return isIOS
        ? {
            title: 'iPhone / iPad 安装步骤',
            steps: [
              '点底部中间（iOS 15+ 在地址栏左侧）的「分享」按钮 ⬆',
              '在弹出菜单里选择「添加到主屏幕」',
              '点右上角「添加」',
            ],
          }
        : {
            title: '浏览器菜单安装步骤',
            steps: ['点右上角菜单', '选择「添加到主屏幕」', '确认后点「添加」'],
          }
    case 'miui':
      return {
        title: '小米浏览器安装步骤',
        steps: ['点右下角「≡」菜单', '选择「添加到主屏幕」', '确认名称后点「添加」'],
      }
    case 'heytap':
      return {
        title: 'OPPO / 一加浏览器安装步骤',
        steps: ['点右下角「≡」菜单', '选择「添加到主屏幕」', '确认后点「添加」'],
      }
    case 'honor':
      return {
        title: '荣耀 / 华为浏览器安装步骤',
        steps: ['点底部「≡」或右上角菜单', '选择「添加到主屏幕」', '确认后点「添加」'],
      }
    case 'samsung':
      return {
        title: '三星浏览器安装步骤',
        steps: ['点右下角「≡」菜单', '选择「添加页面到」→「主屏幕」', '确认后点「添加」'],
      }
    default:
      return {
        title: '浏览器菜单安装步骤',
        steps: [
          '点右上角「⋮」或「≡」打开菜单',
          '选择「安装应用」或「添加到主屏幕」',
          '在弹窗里点「安装」确认',
        ],
      }
  }
}

/** 国产 ROM 常见「装完不能独立启动/没有图标」的补充设置 */
const ROM_TIPS: Partial<Record<Brand, string>> = {
  honor: '荣耀/华为：若安装后无法独立启动，请在「设置 → 应用 → 特殊访问权限」里允许该应用自启动。',
  huawei: '荣耀/华为：若安装后无法独立启动，请在「设置 → 应用 → 特殊访问权限」里允许该应用自启动。',
  xiaomi: '小米：安装时若出现「允许创建快捷方式」弹窗，请点允许，否则主屏不会出现图标。',
  oppo: 'OPPO/一加：若主屏没有图标，请到「设置 → 应用管理」确认应用已创建。',
  vivo: 'vivo：若主屏没有图标，请到「设置 → 应用管理」确认应用已创建。',
  samsung: '三星：若安装后无法独立启动，请在「设置 → 应用程序 → 该应用 → 电池」里取消限制。',
}

export default function InstallGuide() {
  const ua = navigator.userAgent
  const brand = useMemo(() => detectBrand(ua), [ua])
  const browser = useMemo(() => detectBrowser(ua), [ua])
  const isIOS = useMemo(() => isIOSDevice(ua), [ua])
  const inAppBrowser = IN_APP_BROWSERS.includes(browser)

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [manualReady, setManualReady] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [expanded, setExpanded] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [copied, setCopied] = useState(false)

  // 已作为独立应用运行时不显示引导
  useEffect(() => {
    const queries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
    ]
    const sync = () =>
      setStandalone(
        queries.some((q) => q.matches) ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true,
      )
    sync()
    queries.forEach((q) => q.addEventListener('change', sync))
    return () => queries.forEach((q) => q.removeEventListener('change', sync))
  }, [])

  // 捕获原生安装能力；超时未触发则退化为手动步骤
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setManualReady(false)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    const timer = window.setTimeout(() => setManualReady(true), MANUAL_FALLBACK_MS)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.clearTimeout(timer)
    }
  }, [])

  // 顶栏「安装」按钮可随时重新唤起引导
  useEffect(() => {
    const open = () => {
      setDismissed(false)
      setExpanded(true)
    }
    window.addEventListener(OPEN_INSTALL_GUIDE, open)
    return () => window.removeEventListener(OPEN_INSTALL_GUIDE, open)
  }, [])

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    } else {
      setManualReady(true)
      setExpanded(true)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (installed || standalone || dismissed) return null

  const canPrompt = !inAppBrowser && !isIOS && deferred !== null
  const guide = manualSteps(browser, isIOS)
  const tip = ROM_TIPS[brand]
  // 应用内浏览器必须立刻给出换浏览器指引，不等兜底计时
  const stepsVisible = expanded || inAppBrowser

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.text}>📲 安装本应用，可离线使用全部功能</span>
          {canPrompt ? (
            <button className={styles.btn} onClick={install}>
              安装到主屏
            </button>
          ) : (
            <button className={styles.btn} onClick={() => setExpanded((v) => !v)}>
              {stepsVisible ? '收起步骤' : '查看安装步骤'}
            </button>
          )}
          <button className={styles.close} onClick={dismiss} aria-label="不再提示">
            ✕
          </button>
        </div>

        {stepsVisible && (
          <div className={styles.steps}>
            <div className={styles.stepsTitle}>{guide.title}</div>
            <ol>
              {guide.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {inAppBrowser && (
              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={copyLink}>
                  {copied ? '已复制 ✓' : '复制网址'}
                </button>
              </div>
            )}
            {tip && <div className={styles.tip}>{tip}</div>}
          </div>
        )}

        {!stepsVisible && manualReady && !canPrompt && (
          <div className={styles.tip}>当前浏览器未提供自动安装入口，点「查看安装步骤」按图文操作即可。</div>
        )}
      </div>
    </div>
  )
}
