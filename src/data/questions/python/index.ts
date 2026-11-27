/**
 * Python 题库兼容入口。
 * 多语言统一入口已上移到 ../index.ts；本文件保留是为了兼容既有 import 与测试，
 * 语义 = 「只看 Python 题库」：loadQuestions 默认 language='python'，
 * listChapters 只列 Python 章节。新增语言请用 ../index.ts。
 */
import {
  loadQuestions as loadAll,
  listChapters as listAllChapters,
  type QuestionFilter,
} from '../index'
import type { Question } from '../../types'

export { getQuestionById, QuestionBankError } from '../index'
export type { QuestionFilter } from '../index'

/** 只加载 Python 题目（默认 language='python'） */
export function loadQuestions(filter: QuestionFilter = {}): Question[] {
  return loadAll({ ...filter, language: filter.language ?? 'python' })
}

/** 只列出 Python 章节 */
export function listChapters(): string[] {
  return listAllChapters('python')
}

export type { Question }
