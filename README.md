<div align="center">

# 趣编 · QuBian

**给编程初学者的游戏化练习场：每道题都有「专业版」和「大白话版」两种答案，用金币把做题、解锁、阅读串成闭环。**

纯前端 · 无需注册 · 数据只存在你自己的浏览器里 · 开源非商用

[![Deploy](https://github.com/xiaoyu-hue/qubian/actions/workflows/deploy.yml/badge.svg)](https://github.com/xiaoyu-hue/qubian/actions/workflows/deploy.yml)
[![Stars](https://img.shields.io/github/stars/xiaoyu-hue/qubian?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xiaoyu-hue/qubian/stargazers)
[![Forks](https://img.shields.io/github/forks/xiaoyu-hue/qubian?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xiaoyu-hue/qubian/forks)
[![Issues](https://img.shields.io/github/issues/xiaoyu-hue/qubian?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xiaoyu-hue/qubian/issues)
[![Contributors](https://img.shields.io/github/contributors/xiaoyu-hue/qubian?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xiaoyu-hue/qubian/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/xiaoyu-hue/qubian?style=for-the-badge)](https://github.com/xiaoyu-hue/qubian/commits/main)
[![License: Code](https://img.shields.io/badge/code-Apache--2.0-blue?style=for-the-badge)](LICENSE)
[![License: Docs](https://img.shields.io/badge/docs-CC%20BY--SA%204.0-green?style=for-the-badge)](LICENSE-DOCS.txt)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

</div>

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-7B3FA0)
![Radix UI](https://img.shields.io/badge/Radix-UI-111827)
![CodeMirror](https://img.shields.io/badge/CodeMirror-6-7A3E00)
![Pyodide](https://img.shields.io/badge/Pyodide-314-3776AB?logo=python&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)
![React Router](https://img.shields.io/badge/React--Router-7-CA4245)
![HashRouter](https://img.shields.io/badge/routing-HashRouter-4B5563)
![localStorage](https://img.shields.io/badge/storage-localStorage-4B5563)
![ESLint-free](https://img.shields.io/badge/boundaries-checked-2E7D32)
![Tests](https://img.shields.io/badge/tests-68%20passed-2E7D32)
![Platform](https://img.shields.io/badge/platform-Web%20%2F%20PWA-6B7280)
![Responsive](https://img.shields.io/badge/responsive-phone%20%7C%20tablet%20%7C%20desktop-6B7280)
![Theme](https://img.shields.io/badge/theme-light%20%7C%20dark%20%7C%20system-6B7280)
![Node](https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-22272E?logo=githubpages&logoColor=white)
![Open Source](https://img.shields.io/badge/open--source-yes-2E7D32?logo=opensecurityfoundation&logoColor=white)

</div>

---

## 在线演示

**https://xiaoyu-hue.github.io/qubian/**

部署在 GitHub Pages，每次推送到 `main` 由 GitHub Actions 自动构建发布。无需后端、无需登录，打开即可使用。

## 它解决什么问题

多数编程入门材料有三个具体缺口，趣编针对它们做了明确设计：

| 缺口 | 趣编的做法 |
|---|---|
| 术语密集，零基础读不下去 | 每道题提供「大白话版」答案，用生活类比逐层解释 |
| 解析只有一个深度，看不懂的人和大牛用同一份内容 | 同一道题并列「专业版 / 大白话版」，读者自行切换 |
| 学了就忘，缺少持续动机 | 金币、任务、积分、等级把练习变成可累积的进度 |

## 核心特性

### 双版本答案

这是产品区别于同类工具的核心。每道题配两份解析：

- **专业版**：用规范术语讲原理，给出完整定义、边界条件与适用场景，面向有基础或想深入的读者。
- **大白话版**：用生活类比和逐行解释，假设读者零基础，面向第一次接触该概念的人。

以「变量」为例：专业版说明它是「带名称的、指向对象内存的引用，Python 中无须声明类型、赋值即绑定」；大白话版写成「一个贴了标签的盒子，你往里放东西，贴着同一个标签就能再找到它，今天放苹果明天换橘子也行」。同一知识点，两种深度，一键切换。

答案的字段结构与写作标准见 [05-题库数据规范](docs/05-题库数据规范.md)。

### 两种题型

| 题型 | 用途 | 判题方式 | 答案形式 |
|---|---|---|---|
| 选择题 | 测概念理解 | 前端比对选项，答完即显示解析 | 选项 + 正确答案 + 双版本解析 |
| 实操题 | 练写代码 | Pyodide 在浏览器内跑测试自动判定 | 参考代码 + 双版本讲解 + 隐藏测试 |

实操题的代码**不上传服务器**：Python 运行时（Pyodide）以本地资源方式随站点分发，在 Web Worker 中隔离执行，并带超时强杀防止死循环。答错可重试；主动看解析只解锁阅读，不计入「已掌握」、不发奖励。

### 金币经济闭环

做题与完成任务获得金币，金币用于购买小册子，读完小册子返还部分金币，回到做题——形成闭环。数值集中在 `src/data/config/economy.ts`，调整数值不需要改逻辑：

| 行为 | 金币变动 |
|---|---|
| 答对一题 | +5 |
| 完成每日任务 | +20 |
| 购买小册子 | −40 |
| 读完小册子 | +10 |
| 解锁成就 | +15 |

「读完返币」按小册子 id 幂等：同一本只返还一次，反复点击不会重复领币。

### 游戏化系统

每日任务、积分、等级、成就四套系统，数据都从做题与阅读行为派生，存于浏览器本地。积分只增不减，达阈值自动升级；等级由积分推导，不单独存储，避免两处数值打架。

### 书城

两条内容来源，版权处理完全不同：

| 板块 | 内容 | 是否消耗金币 | 阅读方式 |
|---|---|---|---|
| 我的小册子 | 双版本答案按章节汇编（项目自有） | 是，购买后永久可读 | 网页内嵌阅读器 |
| 外部书籍导航 | 他人开源书，仅链接卡片 | 否，免费开放 | 跳转原站 |

外部书只放书名、作者、简介、许可徽章，**不复制正文**；仅收录许可明确者，CC BY-SA / BY-NC-SA 归为「仅导航」，避免其「相同方式共享」条款绑定本项目许可。版权分级规则见 [03-技术决策记录](docs/03-技术决策记录ADR.md)。

### 主题与适配

浅色 / 深色 / 跟随系统三种模式，手动切换后刷新保持。布局按三档断点自适应：手机底部标签栏、平板侧边轨道、桌面固定侧栏；刘海屏与底部横条做了安全区适配。

> **关于 PWA**：设计目标包含「添加到主屏幕、离线使用」，但 Service Worker 与 manifest 尚未实现，当前版本**不具备**真正的 PWA 能力。此项列为后续任务，完成时再更新本段。

## 快速开始

### 环境要求

- Node.js 22 LTS（含 npm）
- 现代浏览器（需支持 Web Worker 与 ES Module）

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/xiaoyu-hue/qubian.git
cd qubian

# 安装依赖
npm ci

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

> 站点部署在 `/qubian/` 子路径下，本地开发服务器同样从此前缀提供页面，请访问 `http://localhost:5173/qubian/`。

### 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器，热更新 |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run test` | 运行全部单元测试（当前 68 项） |
| `npm run lint` | 架构分层边界检查 + 题库结构校验 |

## 技术栈

| 层次 | 选型 | 理由 |
|---|---|---|
| 框架 / 语言 | React 19 + TypeScript 7 + Vite 8 | 生态成熟、类型安全、构建快 |
| 样式 | Tailwind CSS 4（CSS-first，`@theme` 定义令牌） | 断点与色彩令牌集中管理，组件不写死像素 |
| 组件 | 布局与视觉自研；Dialog / Dropdown / Toast 用 Radix UI 原语 | 复杂交互的键盘与读屏交给成熟原语，不引入全家桶 |
| 图标 | 自研内联 SVG | 零额外依赖，线性风格统一 |
| 状态 | Zustand 5 | 管理金币、进度、主题等全局状态，动作经 Store |
| 路由 | React Router 7（HashRouter） | 静态托管无需服务端 rewrite，刷新不 404 |
| 代码编辑器 | CodeMirror 6（Python 语言包） | 比 Monaco 轻，`React.lazy` 按需加载不进首屏 |
| 浏览器内判题 | Pyodide 314（Web Worker） | Python 本地运行、代码不出设备，超时可强杀 |
| 测试 | Vitest 5 | 领域逻辑与 Store 单测 |
| 存储 | localStorage（带版本与命名空间封装） | 无后端阶段的持久化，损坏数据回退默认值 |
| 部署 | GitHub Actions + GitHub Pages | 免费静态托管，推送即发布 |

每项选型的备选方案、取舍与后果记录在 [03-技术决策记录 ADR](docs/03-技术决策记录ADR.md)；视觉参数与可访问性规范见 [04-UI/UX 设计规范](docs/04-UIUX设计规范.md)。

## 项目结构

```
src/
├── app/              # 应用入口、HashRouter、全局 Providers
├── pages/            # 页面装配层：home / learning / bookstore / profile / settings / not-found
├── features/         # 业务功能：onboarding / question / book
├── components/
│   ├── layout/       # 三端导航外壳：app-shell / bottom-tabs / side-nav
│   └── ui/           # 通用组件：glass-card / button / dialog / toast / code-editor 等
├── domain/           # 纯领域逻辑：grading / economy / progression / tasks / theme
├── stores/           # Zustand：profileStore / progressStore / settingsStore
├── data/
│   ├── questions/    # 题库 JSON + schema + 加载聚合
│   ├── booklets/     # 小册子目录 + 从题库汇编正文
│   ├── config/       # 经济 / 等级 / 外部书单配置
│   └── repositories/ # localStorage 持久化封装
└── lib/              # Pyodide 封装与 Worker
```

依赖方向自上而下：`pages / features / components → stores → domain → data`。领域层是纯函数，不感知 UI、Store 与存储细节。`npm run lint` 中的边界脚本强制检查这条约束，违规 import 直接报错退出。

设计约束（单文件行数上限、跨层接口、通用逻辑下沉规则）见 [02-架构设计](docs/02-架构设计.md)。

## 题库与内容

首批题库位于 `src/data/questions/python/basics.json`，共 **25 题**（20 选择题 + 5 实操题），全部 AI 原创并标注来源与许可，双答案非空。结构契约 `schema.json` 采用 JSON Schema Draft 2020-12，`npm run lint` 会执行零依赖校验脚本，检查结构、ID 唯一、答案非空、correctKey 合法与来源许可。

题库加载入口 `src/data/questions/python/index.ts` 提供 `loadQuestions(filter)` / `getQuestionById(id)` / `listChapters()`，支持按章节、难度、题型、标签筛选；数据损坏时抛 `QuestionBankError`，由上层显示错误态。

## 文档索引

| 文档 | 说明 |
|---|---|
| [01-PRD](docs/01-PRD.md) | 背景与目标、用户画像、范围边界、功能验收标准、玩法机制、风险与路线图 |
| [02-架构设计](docs/02-架构设计.md) | 技术栈职责、四层分层、目录结构、关键方案、数据流与扩展点 |
| [03-技术决策记录 ADR](docs/03-技术决策记录ADR.md) | 关键技术选型的背景、备选、决定、理由与后果 |
| [04-UI/UX 设计规范](docs/04-UIUX设计规范.md) | 设计原则、液态玻璃参数、双色系统、字体层级、组件状态、动效与可访问性 |
| [05-题库数据规范](docs/05-题库数据规范.md) | 题目 JSON 结构、完整样例、双答案写作标准、校验规则、AI 生成模板 |
| [06-实施计划](docs/06-实施计划.md) | 可执行的任务分解、依赖关系、里程碑、验证规范与当前进度 |

## 路线图与当前状态

| 阶段 | 内容 | 状态 |
|---|---|---|
| 阶段 0 / 0.5 | 工程骨架、三端自适应布局外壳、状态设计系统 | 已完成 |
| 阶段 1 | MVP 闭环：引导 → 答题 → 双答案 → 金币 → 书城 → 本地存储 → 深浅主题 | 已完成，M3 达成 |
| 阶段 2 | Pyodide 自动判题（已完成）；题库工具链、成就、打卡、错题复习（进行中） | 部分完成 |
| 阶段 3 | 第二语言、多语言判题评估、后端可行性评审 | 规划中，需重新评审 |

当前测试 68 项全通过，生产构建与 lint 通过；书城消费闭环已通过浏览器端到端验证（购买 → 解锁 → 阅读 → 返币 → 刷新保持 → 幂等），详见 [06-实施计划](docs/06-实施计划.md) 第 8 章。

## 许可证

分层授权，按内容类型分别适用，并尊重第三方组件的原有权利：

| 内容类型 | 许可证 | 说明 |
|---|---|---|
| 程序源码 | Apache License 2.0 | 含明确专利授权，详见 [LICENSE](LICENSE) |
| 自有文档与题库 | CC BY-SA 4.0 | 署名-相同方式共享，详见 [LICENSE-DOCS.txt](LICENSE-DOCS.txt) |
| 第三方组件 | 各自原许可 | 依赖与参考资料沿用原许可，详见 [NOTICE](NOTICE) |

自有文档采用 CC BY-SA 4.0：允许分享与改编（含商用），前提是署名原作者、改编作品以相同许可发布，使知识内容及其衍生版本持续开放。代码采用 Apache-2.0，与项目所用的主流 MIT 组件兼容。版权归属 `Copyright 2026 xiaoyu-hue`。以上为开源许可说明，不构成法律意见。

## 参与贡献

Issue 与 Pull Request 均欢迎。提交代码前请遵循现有文档约定，保持代码与文档同步更新；题库内容须通过 `npm run lint` 的结构校验。贡献默认地：代码以 Apache-2.0、文档与题库以 CC BY-SA 4.0 授权。详细约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 致谢

外部书籍导航收录了社区开源作品，版权归各自作者所有，本站仅提供链接、不复制正文：

- [Hello 算法](https://github.com/krahets/hello-algo) — CC BY-NC-SA 4.0
- [简明 Python 教程（A Byte of Python）](https://github.com/swaroopch/byte-of-python) — CC BY-SA 4.0

Pyodide、CodeMirror、Radix UI、React、Vite 等开源项目为本项目提供了基础能力，特此致谢。
