# 四合一工具集（Merged Web App）

一个单页应用（SPA），合并了四个 GitHub 仓库的核心功能：

| 路由 | 模块 | 来源仓库 |
| ---- | ---- | -------- |
| `/` | 首页（导航） | - |
| `/pwa` | 设备校验提醒器 | MYFirstPWA |
| `/dsap` | 算法可视化练习 | DSAP |
| `/radio` | 培训闯关 | radio-exam |
| `/debug` | 调试刷题 + 代码调试 | Debugging-skills-assessment-practice |

整个应用是 **PWA**：支持离线缓存、可安装到桌面/手机。

---

## 技术栈

- React 18（函数组件 + Hooks）
- React Router v6（路由）
- Vite 5（构建）
- TypeScript
- CSS Modules（样式，原因见下）
- vite-plugin-pwa（PWA / Service Worker）

### 为什么选 CSS Modules 而不是 Tailwind

- 四个仓库原始样式是各自的原生 CSS，CSS Modules 可以**直接沿用/局部改造**原有配色与结构，类名自动隔离，互不污染；
- 不引入 Tailwind 配置与学习成本，项目零额外运行时依赖；
- 全局主题（颜色、圆角、阴影）统一放在 `styles/global.css` 的 CSS 变量里，各模块通过变量保持一致。

---

## 快速开始

```bash
npm install
npm run dev        # 开发（Vite Dev Server）
npm run build      # 构建到 dist/（含 PWA 产物）
npm run preview    # 预览构建产物
```

生产部署：把 `dist/` 目录上传到任意静态托管（GitHub Pages / Netlify / Nginx 等）。

---

## 目录结构

```
merged-webapp/
├─ index.html
├─ package.json
├─ vite.config.ts          # Vite + PWA 配置
├─ tsconfig.json
├─ public/
│  ├─ icon-192.png         # PWA 图标（来自 MYFirstPWA）
│  └─ icon-512.png
└─ src/
   ├─ main.tsx             # 入口（注册 Service Worker + 挂载 React）
   ├─ App.tsx              # 路由配置 + 统一布局
   ├─ vite-env.d.ts
   ├─ styles/global.css    # 全局主题变量与基础样式
   ├─ components/
   │  ├─ NavBar.tsx(.module.css)      # 顶栏导航（高亮当前模块）
   │  ├─ Footer.tsx(.module.css)      # 页脚
   │  └─ InstallPrompt.tsx(.module.css) # PWA 安装提示
   ├─ hooks/useLocalStorage.ts        # localStorage 读写 Hook
   ├─ utils/helpers.ts                # 日期/洗牌/转义等工具
   └─ pages/
      ├─ Home/HomePage.tsx(.module.css)
      ├─ PWA/PwaPage.tsx(.module.css)        # 设备校验提醒器
      ├─ DSAP/
      │  ├─ DSAPPage.tsx(.module.css)        # 算法可视化主页面
      │  ├─ types.ts                          # 步骤类型定义
      │  ├─ generators.ts                     # 8 个算法步骤生成器
      │  ├─ StepPlayer.tsx(.module.css)       # 通用步进播放器
      │  ├─ SortingPanel.tsx                  # 五种排序可视化
      │  ├─ SearchingPanel.tsx                # 二分查找可视化
      │  ├─ GraphPanel.tsx                    # DFS/BFS 图遍历
      │  └─ Panels.module.css
      ├─ RadioExam/
      │  ├─ RadioExamPage.tsx(.module.css)    # 分阶段培训闯关
      │  └─ (题库内嵌)
      └─ Debugging/
         ├─ DebuggingPage.tsx(.module.css)    # 刷题主页面
         ├─ questionBank.ts                   # 2000 题生成器（原逻辑）
         ├─ CodeDebugger.tsx(.module.css)     # 代码调试环境
         └─ (题库种子数据)
```

---

## 模块说明与数据方案

### `/pwa` 设备校验提醒器（MYFirstPWA）
- 添加设备（名称 + 下次校验日期），按日期排序；
- 距离校验日 ≤30 天橙色预警、≤7 天红色预警、过期红色标记；
- 支持改期、删除、清空；数据存 `localStorage`（键 `device_calibration_list`）。

### `/dsap` 算法可视化练习（DSAP）
> 说明：原 DSAP 仓库实际内容是"调试技能鉴定刷题"，与 Debugging 仓库完全相同。按需求将其实现为**算法可视化**模块。
- 排序：冒泡、选择、插入、归并、快速（柱状图逐步动画 + 比较/交换高亮）；
- 搜索：二分查找（区间/中间值/命中高亮）；
- 图遍历：DFS / BFS（SVG 图 + 访问顺序/栈/队列展示）；
- 通用步进播放器：播放/暂停/上一步/下一步/速度调节/进度。

### `/radio` 培训闯关（radio-exam）
- 两个阶段：先观看视频 → 标记"已看完"解锁题目 → 全部答对才通关；
- 答错锁止并要求重新观看视频；第二阶段依赖第一阶段通关；
- 进度持久化到 `localStorage`（`radio_phaseA` / `radio_phaseB`）；
- 视频为占位地址：原仓库为 GitHub 文件链接，无法直接播放，部署后请替换为可播放 URL；
- 原 QRCode 分享改为「分享链接」（Web Share / 剪贴板），不依赖外部库。

### `/debug` 调试刷题（Debugging-skills）
- 2000 道题（1000 单选 + 600 多选 + 400 判断），沿用原"种子题 + 编号"生成逻辑（`questionBank.ts`）；
- 顺序 / 随机 / 题型练习 / 模拟考试（40/20/20、40 分钟、及格 60 分，可自定义）；
- 答题即时反馈 + 解析，错题自动进"易错题记录"（localStorage `debug_v5`）；
- 附加**代码调试环境**：修改 JS 代码 → 运行 → 查看输出/报错，内置 3 个预置片段。

### 数据与外部依赖
- 全部数据均为静态/本地存储（localStorage），无后端、无数据库；
- 唯一外部资源为 radio 模块的视频地址（占位，需替换）；
- 模拟/替代说明：原 QRCode → 分享链接；原"我的"页（暂无功能）未移植。

---

## PWA 说明

- `vite-plugin-pwa`（generateSW）自动生成 `sw.js`，预缓存构建产物与图标；
- `navigateFallback: '/index.html'` 保证任意路由离线可访问；
- `manifest` 含名称、图标、主题色，触发浏览器"安装应用"；
- `InstallPrompt` 组件监听 `beforeinstallprompt` 显示安装按钮。

---

## 已知取舍

- DSAP 与 Debugging 仓库内容完全相同（同一文件哈希），为满足"DSAP 展示算法"的要求，DSAP 模块为新建实现；
- radio-exam 的视频与二维码：视频改为占位地址；二维码分享改为复制链接/Web Share；
- 题库中的多选种子题仅 2 道、判断 2 道、单选 12 道，其余为"编号后缀"扩充，与原仓库逻辑一致。
