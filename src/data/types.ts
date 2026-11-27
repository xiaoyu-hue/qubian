/**
 * 全局数据契约。
 * 所有跨层传递的数据结构在此集中定义，避免各模块各自定义造成不一致。
 * 字段对应 docs/05-题库数据规范.md 与 docs/02-架构设计.md 第 5 节。
 */

/* ---------- 题目 ---------- */

export type QuestionType = 'choice' | 'practice'
export type Difficulty = 'beginner' | 'advanced'

/** 题目来源与许可（对应 05 规范第 10 节） */
export interface QuestionSource {
  /** ai-generated=AI 原创；mit-import=MIT 题库导入；其余为历史兼容值 */
  type: 'ai-generated' | 'mit-import' | 'community' | 'original'
  license: string
  generatedAt?: string
  author?: string
}

/** 双版本答案：专业版 + 大白话版，两者必填（产品差异化核心） */
export interface Answer {
  professional: string
  plain: string
}

/** 所有题目共有的基础字段 */
interface QuestionBase {
  id: string
  language: string
  chapter: string
  type: QuestionType
  difficulty: Difficulty
  title: string
  stem: string
  answer: Answer
  tags?: string[]
  source: QuestionSource
  version?: number
}

/** 选项 */
export interface ChoiceOption {
  key: string
  text: string
}

/** 选择题：带选项与正确答案 key */
export interface ChoiceQuestion extends QuestionBase {
  type: 'choice'
  options: ChoiceOption[]
  correctKey: string
}

/** 测试用例（对应 05 规范 3.4） */
export interface TestCase {
  input: string
  expectedOutput: string
  hidden?: boolean
}

/** 实操题：带起始代码、参考实现与测试用例 */
export interface PracticeQuestion extends QuestionBase {
  type: 'practice'
  starterCode?: string
  referenceCode: string
  tests: TestCase[]
  hints?: string[]
}

/** 题目联合类型：用 type 字段做判别（discriminated union） */
export type Question = ChoiceQuestion | PracticeQuestion

/* ---------- 书城 ---------- */

/** 小册子元数据（正文由题库按章节汇编，不单独维护副本） */
export interface Booklet {
  id: string
  title: string
  subtitle: string
  description: string
  /** 正文来源的题库章节 id */
  chapter: string
  language: string
  /** 解锁价格（金币），数值来源是 config/economy */
  price: number
  badge: string
}

/** 小册子中的一个阅读条目（由题目转换，保留双答案） */
export interface BookletEntry {
  id: string
  title: string
  stem: string
  answer: Answer
  kind: QuestionType
}

/** 小册子中的一个部分（如选择题、实操题） */
export interface BookletSection {
  title: string
  entries: BookletEntry[]
}

/** 小册子完整内容：元数据 + 从题库汇编的分节正文 */
export interface BookletContent {
  booklet: Booklet
  sections: BookletSection[]
  entryCount: number
}

/** 版权分级：green 可内嵌正文；amber 只做导航（避免 SA 条款绑定产品） */
export type ExternalBookTier = 'green' | 'amber'

/** 外部书籍学习方向分类（书城筛选维度） */
export type ExternalBookCategory = 'language' | 'algorithm' | 'ai' | 'resource'

/** 外部书籍导航条目（只放链接卡片，不复制正文） */
export interface ExternalBook {
  id: string
  title: string
  author: string
  description: string
  url: string
  license: string
  licenseUrl: string
  tier: ExternalBookTier
  category: ExternalBookCategory
}

/* ---------- 主题 ---------- */

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

/* ---------- 用户与经济 ---------- */

/** 金币变动原因，用于经济模块追踪产出/消费 */
export type CoinReason =
  | 'answer-correct'
  | 'daily-task'
  | 'book-read'
  | 'book-purchase'
  | 'achievement'

/** 用户档案（进度、金币、积分、等级） */
export interface UserProfile {
  coins: number
  points: number
  level: number
  /** 已答对的题号（掌握）：只有答对才计入，用于统计与发奖励 */
  answeredIds: string[]
  /** 主动求助查看过解析的题号：仅解锁解析，不计入掌握、不发奖励 */
  revealedIds: string[]
  purchasedBookIds: string[]
  /** 已读完并领取过返币的小册子 id：幂等，防止重复点击重复返币 */
  readBookIds: string[]
  /** 错题复习队列：答错入队、答对移出，用于针对性重练（T2.8） */
  wrongIds: string[]
  /** 已解锁成就及解锁时间：unlockedAt 既是展示信息，也是发奖幂等依据（T2.6） */
  unlockedAchievements: Achievement[]
}

/** 每日任务 */
export interface DailyTask {
  date: string
  target: number
  completed: number
  claimed: boolean
}

/** 成就 */
export interface Achievement {
  id: string
  title: string
  description: string
  unlockedAt?: string
}

/** 成就触发方式：累计答对数 / 完成每日任务 / 连续天数 */
export type AchievementTrigger =
  | { kind: 'answers'; count: number }
  | { kind: 'daily-task' }
  | { kind: 'streak'; days: number }

/** 成就定义（配置层数据，带触发条件；解锁后写入档案时补 unlockedAt） */
export interface AchievementDefinition {
  id: string
  title: string
  description: string
  trigger: AchievementTrigger
}

/* ---------- 设置 ---------- */

export interface Settings {
  theme: ThemeMode
  taskIntensity: number
  onboardingDone: boolean
}
