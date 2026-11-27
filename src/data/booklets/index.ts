/**
 * 小册子聚合入口（T1.15）。
 * 职责：目录查询 + 从题库按章节汇编正文，供书城与阅读器使用。
 * 约束（架构 5.1）：数据层只做加载与组装，不碰 UI、不做业务判分、不读写存储。
 */
import type { Booklet, BookletContent, BookletEntry, BookletSection, Question } from '../types'
import { loadQuestions } from '../questions/python/index'
import { BOOKLETS } from './catalog'

/** 列出全部小册子（返回浅拷贝，避免调用方改动目录源） */
export function listBooklets(): Booklet[] {
  return [...BOOKLETS]
}

/** 按 id 查询小册子元数据 */
export function getBookletById(id: string): Booklet | undefined {
  return BOOKLETS.find((b) => b.id === id)
}

/** 把一道题转成阅读条目（只取正文需要的字段，双答案原样保留） */
function toEntry(question: Question): BookletEntry {
  return {
    id: question.id,
    title: question.title,
    stem: question.stem,
    answer: question.answer,
    kind: question.type,
  }
}

/**
 * 从题库汇编小册子正文：按题型分节（选择题在前、实操题在后）。
 * 题库无对应章节时返回空 sections，由上层显示空态；不抛错。
 */
export function loadBookletContent(bookletId: string): BookletContent | undefined {
  const booklet = getBookletById(bookletId)
  if (!booklet) return undefined

  const questions = loadQuestions({ chapter: booklet.chapter })
  const choice = questions.filter((q) => q.type === 'choice')
  const practice = questions.filter((q) => q.type === 'practice')

  const sections: BookletSection[] = []
  if (choice.length > 0) {
    sections.push({ title: '选择题精讲', entries: choice.map(toEntry) })
  }
  if (practice.length > 0) {
    sections.push({ title: '动手实践', entries: practice.map(toEntry) })
  }

  return { booklet, sections, entryCount: questions.length }
}
