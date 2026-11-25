import { describe, expect, it } from 'vitest'
import basics from './basics.json'
import { getQuestionById, listChapters, loadQuestions } from './index'

describe('题库加载入口', () => {
  it('默认加载全部题目', () => {
    expect(loadQuestions()).toHaveLength(basics.length)
  })

  it('按章节筛选', () => {
    expect(loadQuestions({ chapter: 'basics' })).toHaveLength(basics.length)
    expect(loadQuestions({ chapter: 'not-exist' })).toHaveLength(0)
  })

  it('按难度筛选', () => {
    const beginner = loadQuestions({ difficulty: 'beginner' })
    const advanced = loadQuestions({ difficulty: 'advanced' })
    expect(beginner.length).toBeGreaterThan(0)
    expect(advanced.length).toBeGreaterThan(0)
    expect(beginner.length + advanced.length).toBe(basics.length)
    expect(beginner.every((q) => q.difficulty === 'beginner')).toBe(true)
  })

  it('按题型筛选', () => {
    const choices = loadQuestions({ type: 'choice' })
    const practices = loadQuestions({ type: 'practice' })
    expect(choices).toHaveLength(20)
    expect(practices).toHaveLength(5)
    expect(choices.every((q) => q.type === 'choice')).toBe(true)
    expect(practices.every((q) => q.type === 'practice')).toBe(true)
  })

  it('组合条件为「与」关系', () => {
    const result = loadQuestions({ chapter: 'basics', type: 'practice', difficulty: 'advanced' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((q) => q.chapter === 'basics' && q.type === 'practice' && q.difficulty === 'advanced')).toBe(true)
  })

  it('按标签筛选（同时包含所有指定标签）', () => {
    const all = loadQuestions()
    const target = all.find((q) => q.tags && q.tags.length >= 2)!
    const tags = target.tags!.slice(0, 2)
    const result = loadQuestions({ tags })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((q) => tags.every((t) => q.tags?.includes(t)))).toBe(true)
  })

  it('按 ID 查询', () => {
    const first = basics[0]
    expect(getQuestionById(first.id)).toEqual(first)
    expect(getQuestionById('py-basics-999')).toBeUndefined()
  })

  it('列出已登记章节', () => {
    expect(listChapters()).toContain('basics')
  })
})
