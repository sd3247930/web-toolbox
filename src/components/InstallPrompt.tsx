import { useEffect, useState } from 'react'
import styles from './InstallPrompt.module.css'

/**
 * PWA 安装提示：监听 beforeinstallprompt 事件，
 * 用户点击"安装应用"后触发系统安装流程。
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  if (installed) return null
  if (!deferred) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.text}>📲 安装本应用，可离线使用全部功能</span>
        <button className={styles.btn} onClick={install}>
          安装应用
        </button>
      </div>
    </div>
  )
}
