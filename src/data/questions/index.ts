/**
 * 题库统一加载入口（多语言）。
 * 职责：对上提供稳定的查询接口，屏蔽题库文件的语言/章节存放细节。
 * 结构：REGISTRY 为「语言 → 章节 → 题目」两级；新增语言或章节时在此登记即可。
 * 约束（架构 5.1 / 9）：数据层只做加载与筛选，不碰 UI、不做业务判分；
 * 结构完整性由校验脚本在构建期保证，这里再做一层运行时守卫兜底。
 */
import type { Difficulty, Question, QuestionType } from '../types'
import basics from './python/basics.json'
import controlFlow from './python/control-flow.json'
import dataStructures from './python/data-structures.json'
import jsBasics from './javascript/basics.json'

/** 语言 → 章节 → 题目数组；新增语言/章节时在此登记 */
const REGISTRY: Record<string, Record<string, Question[]>> = {
  python: {
    basics: basics as Question[],
    'control-flow': controlFlow as Question[],
    'data-structures': dataStructures as Question[],
  },
  javascript: {
    basics: jsBasics as Question[],
  },
}

/** 查询条件（各字段可选，组合为「与」关系）；language 不传则跨语言聚合 */
export interface QuestionFilter {
  language?: string
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
 * 加载题目，可按语言/章节/难度/题型/标签筛选。
 * 题库损坏时抛 QuestionBankError，上层据此显示错误态。
 */
export function loadQuestions(filter: QuestionFilter = {}): Question[] {
  const languageKeys = filter.language ? [filter.language] : Object.keys(REGISTRY)
  const result: Question[] = []

  for (const language of languageKeys) {
    const chapters = REGISTRY[language]
    if (!chapters) continue
    const chapterKeys = filter.chapter ? [filter.chapter] : Object.keys(chapters)
    for (const chapter of chapterKeys) {
      const questions = chapters[chapter]
      if (!questions) continue
      for (const q of questions) {
        if (!isQuestion(q)) {
          throw new QuestionBankError(`题目数据损坏：${language}/${chapter} 中存在结构不合法的条目`)
        }
        if (filter.difficulty && q.difficulty !== filter.difficulty) continue
        if (filter.type && q.type !== filter.type) continue
        if (filter.tags && filter.tags.length > 0 && !filter.tags.every((t) => q.tags?.includes(t))) continue
        result.push(q)
      }
    }
  }
  return result
}

/** 按 ID 查询单题（跨语言、跨章节），未找到返回 undefined */
export function getQuestionById(id: string): Question | undefined {
  for (const chapters of Object.values(REGISTRY)) {
    for (const questions of Object.values(chapters)) {
      const found = questions.find((q) => q.id === id)
      if (found) return found
    }
  }
  return undefined
}

/** 列出有题目的语言 ID（按登记顺序） */
export function listLanguages(): string[] {
  return Object.keys(REGISTRY).filter((language) =>
    Object.values(REGISTRY[language]).some((questions) => questions.length > 0),
  )
}

/** 列出指定语言下已登记且非空章节的 ID（按登记顺序）；不传语言则列出全部语言的章节 */
export function listChapters(language?: string): string[] {
  const languageKeys = language ? [language] : Object.keys(REGISTRY)
  const out: string[] = []
  for (const lang of languageKeys) {
    const chapters = REGISTRY[lang]
    if (!chapters) continue
    for (const chapter of Object.keys(chapters)) {
      if (chapters[chapter].length > 0 && !out.includes(chapter)) out.push(chapter)
    }
  }
  return out
}
