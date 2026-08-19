import { useMemo, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { formatDate, genId, getDaysDiff, getRemindLevel } from '../../utils/helpers'
import styles from './PwaPage.module.css'

/** 设备数据结构 */
interface Device {
  id: string
  name: string
  date: string // YYYY-MM-DD
}

/**
 * 设备校验提醒器（源自 MYFirstPWA）：
 * 添加设备与下次校验日期，按日期排序展示，
 * 距离校验日 ≤30 天橙色预警、≤7 天红色预警、过期红色标记。
 */
export default function PwaPage() {
  const [devices, setDevices] = useLocalStorage<Device[]>('device_calibration_list', [])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  /** 按校验日期从近到远排序 */
  const sorted = useMemo(() => [...devices].sort((a, b) => +new Date(a.date) - +new Date(b.date)), [devices])

  /** 添加设备 */
  const addDevice = () => {
    const n = name.trim()
    if (!n) return alert('请填写设备名称')
    if (!date) return alert('请选择校验日期')
    if (devices.some((d) => d.name === n)) {
      if (!confirm(`设备"${n}"已存在，是否继续添加？`)) return
    }
    setDevices([...devices, { id: genId(), name: n, date }])
    setName('')
    setDate('')
  }

  /** 删除设备 */
  const removeDevice = (id: string) => {
    if (!confirm('确定要删除这个设备吗？')) return
    setDevices(devices.filter((d) => d.id !== id))
  }

  /** 改期：复用原逻辑（prompt 输入新日期） */
  const editDate = (id: string) => {
    const dev = devices.find((d) => d.id === id)
    if (!dev) return
    const newDate = prompt(`请输入 ${dev.name} 的新校验日期 (格式: YYYY-MM-DD)`, dev.date)
    if (!newDate) return
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return alert('日期格式错误，请使用 YYYY-MM-DD 格式')
    setDevices(devices.map((d) => (d.id === id ? { ...d, date: newDate } : d)))
  }

  /** 清空全部 */
  const clearAll = () => {
    if (!confirm('⚠️ 确定要删除所有设备吗？不可撤销。')) return
    setDevices([])
  }

  /** 渲染单台设备 */
  const renderDevice = (dev: Device) => {
    const days = getDaysDiff(dev.date)
    const level = getRemindLevel(days)

    let statusText = ''
    let statusClass = ''
    if (days < 0) {
      statusText = `⚠️ 已过期 ${Math.abs(days)} 天`
      statusClass = styles.urgent
    } else if (level === 'urgent') {
      statusText = `🔴 紧急！仅剩 ${days} 天`
      statusClass = styles.urgent
    } else if (level === 'warning') {
      statusText = `🟠 即将到期 (剩 ${days} 天)`
      statusClass = styles.warning
    } else {
      statusText = `✅ 剩余 ${days} 天`
    }

    const itemClass = level === 'urgent' ? styles.itemUrgent : level === 'warning' ? styles.itemWarning : ''
    return (
      <div key={dev.id} className={`${styles.item} ${itemClass}`}>
        <div className={styles.info}>
          <div className={styles.name}>🔧 {dev.name}</div>
          <div className={styles.date}>📅 校验日期：{formatDate(dev.date)}</div>
        </div>
        <div className={`${styles.status} ${statusClass}`}>{statusText}</div>
        <div className={styles.actions}>
          <button className={styles.smallBtn} onClick={() => editDate(dev.id)}>
            ✏️ 改期
          </button>
          <button className={`${styles.smallBtn} ${styles.del}`} onClick={() => removeDevice(dev.id)}>
            🗑️ 删除
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.h1}>📋 设备校验提醒器</h1>
        <p className={styles.sub}>✅ 提前30天高亮提醒 · 数据保存在手机/电脑本地</p>
      </div>

      {/* 添加表单 */}
      <div className="card">
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>设备名称</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：高压灭菌锅"
              autoComplete="off"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>下次校验日期</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={addDevice}>
            ➕ 添加设备
          </button>
        </div>
      </div>

      {/* 设备清单 */}
      <div className="card">
        <div className={styles.listHead}>
          <h3 style={{ margin: 0 }}>📌 设备清单</h3>
          <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={clearAll}>
            清空全部
          </button>
        </div>
        {sorted.length === 0 ? (
          <div className="empty-tip">✨ 暂无设备，请在上方添加 ✨</div>
        ) : (
          <div className={styles.list}>{sorted.map(renderDevice)}</div>
        )}
      </div>

      <div className={styles.note}>
        ⏰ 距离校验日 ≤30天 显示橙色预警，≤7天 红色预警。
        <br />
        数据自动保存在浏览器中，关闭页面不丢失。
      </div>
    </div>
  )
}
