import { describe, expect, it } from 'vitest'
import type { Question } from '../types'
import basics from './python/basics.json'

/** 首批题库契约校验：确保 JSON 能被 Question[] 类型识别且字段合规 */
const questions = basics as Question[]

describe('首批题库 basics.json', () => {
  it('能被 Question[] 类型契约识别，且数量达标', () => {
    expect(questions.length).toBeGreaterThanOrEqual(20)
    expect(questions.length).toBeLessThanOrEqual(30)
  })

  it('id 全局唯一', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每题双版本答案均非空', () => {
    for (const q of questions) {
      expect(q.answer.professional.trim().length).toBeGreaterThan(0)
      expect(q.answer.plain.trim().length).toBeGreaterThan(0)
    }
  })

  it('选择题 correctKey 落在选项内；实操题有参考实现与测试', () => {
    for (const q of questions) {
      if (q.type === 'choice') {
        const keys = q.options.map((o) => o.key)
        expect(keys).toContain(q.correctKey)
      } else {
        expect(q.referenceCode.trim().length).toBeGreaterThan(0)
        expect(q.tests.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('每题来源标注合法且许可干净', () => {
    for (const q of questions) {
      expect(q.source.type).toBe('ai-generated')
      expect(q.source.license).toBe('project-apache-2.0')
    }
  })

  it('以选择题为主', () => {
    const choices = questions.filter((q) => q.type === 'choice').length
    expect(choices / questions.length).toBeGreaterThan(0.6)
  })
})
