import { describe, expect, it } from 'vitest'
import { getBookletById, listBooklets, loadBookletContent } from './index'

describe('小册子聚合入口', () => {
  it('目录非空且元数据字段齐全', () => {
    const list = listBooklets()
    expect(list.length).toBeGreaterThan(0)
    for (const b of list) {
      expect(b.id).toBeTruthy()
      expect(b.title).toBeTruthy()
      expect(b.chapter).toBeTruthy()
      expect(b.price).toBeGreaterThan(0)
    }
  })

  it('按 id 查询，未找到返回 undefined', () => {
    const first = listBooklets()[0]
    expect(getBookletById(first.id)).toEqual(first)
    expect(getBookletById('not-exist')).toBeUndefined()
  })

  it('正文从题库汇编：条目数等于对应章节题量，双答案非空', () => {
    const first = listBooklets()[0]
    const content = loadBookletContent(first.id)
    expect(content).toBeDefined()
    expect(content!.entryCount).toBeGreaterThan(0)
    const flat = content!.sections.flatMap((s) => s.entries)
    expect(flat).toHaveLength(content!.entryCount)
    for (const entry of flat) {
      expect(entry.answer.professional.length).toBeGreaterThan(0)
      expect(entry.answer.plain.length).toBeGreaterThan(0)
    }
  })

  it('正文按题型分节：选择题在前、实操题在后', () => {
    const first = listBooklets()[0]
    const content = loadBookletContent(first.id)!
    expect(content.sections.map((s) => s.title)).toEqual(['选择题精讲', '动手实践'])
    expect(content.sections[0].entries.every((e) => e.kind === 'choice')).toBe(true)
    expect(content.sections[1].entries.every((e) => e.kind === 'practice')).toBe(true)
  })

  it('查询不存在的小册子返回 undefined', () => {
    expect(loadBookletContent('not-exist')).toBeUndefined()
  })
})
