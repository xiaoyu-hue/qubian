import { describe, expect, it } from 'vitest'
import type { Question } from '../../types'
import controlFlow from './control-flow.json'

/** 控制流章节契约校验：结构与 05 规范一致，双答案与测试齐全 */
const questions = controlFlow as Question[]

describe('控制流章节 control-flow.json', () => {
  it('能被 Question[] 类型契约识别，且数量达标', () => {
    expect(questions.length).toBeGreaterThanOrEqual(10)
    expect(questions.length).toBeLessThanOrEqual(30)
  })

  it('id 全局唯一且前缀正确', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith('py-control-flow-'))).toBe(true)
  })

  it('每题归属 control-flow 章节且双版本答案均非空', () => {
    for (const q of questions) {
      expect(q.chapter).toBe('control-flow')
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
})
