import { describe, expect, it } from 'vitest'
import type { Question } from '../../types'
import { executeJavaScript } from '../../../lib/javascript'
import basics from './basics.json'

/** JavaScript 首章契约校验：结构、双答案、判题可执行性 */
const questions = basics as Question[]

describe('JavaScript 首章 basics.json', () => {
  it('能被 Question[] 类型契约识别，数量与题型分布达标', () => {
    expect(questions.length).toBeGreaterThanOrEqual(10)
    expect(questions.length).toBeLessThanOrEqual(30)
    const choices = questions.filter((q) => q.type === 'choice').length
    const practices = questions.filter((q) => q.type === 'practice').length
    expect(choices).toBe(10)
    expect(practices).toBe(5)
  })

  it('id 全局唯一且前缀为 js-；language 为 javascript；chapter 为 basics', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const q of questions) {
      expect(q.id.startsWith('js-basics-')).toBe(true)
      expect(q.language).toBe('javascript')
      expect(q.chapter).toBe('basics')
    }
  })

  it('每题双版本答案均非空', () => {
    for (const q of questions) {
      expect(q.answer.professional.trim().length).toBeGreaterThan(0)
      expect(q.answer.plain.trim().length).toBeGreaterThan(0)
    }
  })

  it('选择题 correctKey 落在选项内；实操题有参考实现与隐藏测试', () => {
    for (const q of questions) {
      if (q.type === 'choice') {
        const keys = q.options.map((o) => o.key)
        expect(keys).toContain(q.correctKey)
      } else {
        expect(q.referenceCode.trim().length).toBeGreaterThan(0)
        expect(q.tests.length).toBeGreaterThanOrEqual(2)
        expect(q.tests.some((t) => t.hidden === true)).toBe(true)
      }
    }
  })

  it('每题来源标注合法且许可干净', () => {
    for (const q of questions) {
      expect(q.source.type).toBe('ai-generated')
      expect(q.source.license).toBe('project-apache-2.0')
    }
  })

  /** 端到端契约：参考代码必须能通过自己全部测试用例（含隐藏测试） */
  it('每道实操题的参考实现都能通过全部测试用例', () => {
    const practices = questions.filter((q) => q.type === 'practice')
    for (const q of practices) {
      if (q.type !== 'practice') continue
      const results = executeJavaScript(q.referenceCode, q.tests)
      expect(results.every((r) => r.passed), `${q.id} 参考代码未通过：${JSON.stringify(results)}`).toBe(true)
    }
  })
})
