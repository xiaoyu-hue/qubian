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
  answeredIds: string[]
  purchasedBookIds: string[]
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

/* ---------- 设置 ---------- */

export interface Settings {
  theme: ThemeMode
  taskIntensity: number
  onboardingDone: boolean
}
