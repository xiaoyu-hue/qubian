import { describe, expect, it } from 'vitest'
import basics from './basics.json'
import controlFlow from './control-flow.json'
import dataStructures from './data-structures.json'
import { getQuestionById, listChapters, loadQuestions } from './index'

describe('题库加载入口', () => {
  it('默认加载全部题目（跨章节聚合）', () => {
    const all = loadQuestions()
    expect(all).toHaveLength(basics.length + controlFlow.length + dataStructures.length)
    expect(all.length).toBeGreaterThan(basics.length)
  })

  it('按章节筛选', () => {
    expect(loadQuestions({ chapter: 'basics' })).toHaveLength(basics.length)
    expect(loadQuestions({ chapter: 'control-flow' })).toHaveLength(controlFlow.length)
    expect(loadQuestions({ chapter: 'data-structures' })).toHaveLength(dataStructures.length)
    expect(loadQuestions({ chapter: 'not-exist' })).toHaveLength(0)
  })

  it('按难度筛选', () => {
    const beginner = loadQuestions({ difficulty: 'beginner' })
    const advanced = loadQuestions({ difficulty: 'advanced' })
    expect(beginner.length).toBeGreaterThan(0)
    expect(advanced.length).toBeGreaterThan(0)
    expect(beginner.length + advanced.length).toBe(loadQuestions().length)
    expect(beginner.every((q) => q.difficulty === 'beginner')).toBe(true)
  })

  it('按题型筛选', () => {
    const choices = loadQuestions({ type: 'choice' })
    const practices = loadQuestions({ type: 'practice' })
    expect(choices.length + practices.length).toBe(loadQuestions().length)
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

  it('按 ID 查询（跨章节）', () => {
    const first = basics[0]
    const newChapterFirst = controlFlow[0]
    const dataStructuresFirst = dataStructures[0]
    expect(getQuestionById(first.id)).toEqual(first)
    expect(getQuestionById(newChapterFirst.id)).toEqual(newChapterFirst)
    expect(getQuestionById(dataStructuresFirst.id)).toEqual(dataStructuresFirst)
    expect(getQuestionById('py-basics-999')).toBeUndefined()
  })

  it('列出已登记章节（按登记顺序）', () => {
    expect(listChapters()).toEqual(['basics', 'control-flow', 'data-structures'])
  })
})
