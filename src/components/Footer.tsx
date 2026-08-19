import styles from './Footer.module.css'

/** 页脚：说明四个模块来源与离线支持 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>四合一工具集 · 由 4 个开源仓库合并而来</p>
        <p>
          MYFirstPWA · DSAP · radio-exam · Debugging-skills-assessment-practice
        </p>
        <p className={styles.tip}>📴 支持离线使用：首次访问后数据与页面均缓存在本地</p>
      </div>
    </footer>
  )
}
