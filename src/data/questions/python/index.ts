/**
 * 题库加载与聚合入口（T1.5）。
 * 职责：对上提供稳定的查询接口，屏蔽题库文件的存放细节。
 * 约束（架构 5.1 / 9）：数据层只做加载与筛选，不碰 UI、不做业务判分；
 * 结构完整性由校验脚本（T1.4）在构建期保证，这里再做一层运行时守卫兜底。
 */
import type { Difficulty, Question, QuestionType } from '../../types'
import basics from './basics.json'
import controlFlow from './control-flow.json'
import dataStructures from './data-structures.json'

/** 章节标识 → 题目数组的注册表；新增章节时在此登记即可 */
const REGISTRY: Record<string, Question[]> = {
  basics: basics as Question[],
  'control-flow': controlFlow as Question[],
  'data-structures': dataStructures as Question[],
}

/** 查询条件（各字段可选，组合为「与」关系） */
export interface QuestionFilter {
  chapter?: string
  difficulty?: Difficulty
  type?: QuestionType
  tags?: string[]
}

/** 题库结构损坏时抛出，供上层错误态识别 */
export class QuestionBankError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuestionBankError'
  }
}

/** 运行时守卫：确认条目具备最小可渲染结构 */
function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false
  const q = value as Partial<Question>
  return (
    typeof q.id === 'string' &&
    typeof q.type === 'string' &&
    typeof q.stem === 'string' &&
    !!q.answer &&
    typeof q.answer.professional === 'string' &&
    typeof q.answer.plain === 'string'
  )
}

/**
 * 加载题目，可按章节/难度/题型/标签筛选。
 * 题库损坏时抛 QuestionBankError，上层据此显示错误态。
 */
export function loadQuestions(filter: QuestionFilter = {}): Question[] {
  const chapters = filter.chapter ? [filter.chapter] : Object.keys(REGISTRY)
  const result: Question[] = []

  for (const chapter of chapters) {
    const questions = REGISTRY[chapter]
    if (!questions) {
      // 请求了不存在的章节：视为空结果，而不是报错（章节可能尚未解锁）
      continue
    }
    for (const q of questions) {
      if (!isQuestion(q)) {
        throw new QuestionBankError(`题目数据损坏：章节 ${chapter} 中存在结构不合法的条目`)
      }
      if (filter.difficulty && q.difficulty !== filter.difficulty) continue
      if (filter.type && q.type !== filter.type) continue
      if (filter.tags && filter.tags.length > 0 && !filter.tags.every((t) => q.tags?.includes(t))) continue
      result.push(q)
    }
  }
  return result
}

/** 按 ID 查询单题，未找到返回 undefined */
export function getQuestionById(id: string): Question | undefined {
  for (const questions of Object.values(REGISTRY)) {
    const found = questions.find((q) => q.id === id)
    if (found) return found
  }
  return undefined
}

/** 列出已登记且非空章节的 ID（按登记顺序） */
export function listChapters(): string[] {
  return Object.keys(REGISTRY).filter((chapter) => REGISTRY[chapter].length > 0)
}
