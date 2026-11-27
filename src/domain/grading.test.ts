import { describe, expect, it } from 'vitest'
import type { ChoiceQuestion, PracticeQuestion } from '../data/types'
import { gradeChoice, gradeCodeFromTests, type TestRunResult } from './grading'

const question: ChoiceQuestion = {
  id: 'py-basics-001',
  language: 'python',
  chapter: 'basics',
  type: 'choice',
  difficulty: 'beginner',
  title: '什么是变量？',
  stem: '下列关于变量的说法，正确的是？',
  options: [
    { key: 'A', text: '可换值' },
    { key: 'B', text: '不可变' },
  ],
  correctKey: 'A',
  answer: { professional: '专业答案', plain: '大白话答案' },
  source: { type: 'ai-generated', license: 'project-apache-2.0' },
}

describe('gradeChoice', () => {
  it('答对返回 correct', () => {
    expect(gradeChoice(question, 'A')).toEqual({ correct: true, feedback: 'correct' })
  })

  it('答错返回 try-again', () => {
    expect(gradeChoice(question, 'B')).toEqual({ correct: false, feedback: 'try-again' })
  })

  it('非法 key 返回 invalid', () => {
    expect(gradeChoice(question, 'Z')).toEqual({ correct: false, feedback: 'invalid' })
  })
})

const practiceQuestion: PracticeQuestion = {
  ...question,
  id: 'py-basics-021',
  type: 'practice',
  stem: '定义函数 add(a, b)',
  referenceCode: 'def add(a, b):\n    return a + b\n',
  tests: [
    { input: 'add(1, 2)', expectedOutput: '3' },
    { input: 'add(-1, 1)', expectedOutput: '0', hidden: true },
  ],
}

const result = (input: string, expectedOutput: string, actualOutput: string): TestRunResult => ({
  input,
  expectedOutput,
  hidden: false,
  actualOutput,
  passed: actualOutput === expectedOutput,
})

describe('gradeCodeFromTests', () => {
  it('全部测试通过才算掌握（含隐藏测试）', () => {
    const results = [
      result('add(1, 2)', '3', '3'),
      result('add(-1, 1)', '0', '0'),
    ]
    expect(gradeCodeFromTests(practiceQuestion, results)).toEqual({ correct: true, feedback: 'correct' })
  })

  it('任一测试失败即不通过', () => {
    const results = [
      result('add(1, 2)', '3', '3'),
      result('add(-1, 1)', '0', '2'),
    ]
    expect(gradeCodeFromTests(practiceQuestion, results)).toEqual({ correct: false, feedback: 'try-again' })
  })

  it('空结果集不通过（执行失败兜底）', () => {
    expect(gradeCodeFromTests(practiceQuestion, [])).toEqual({ correct: false, feedback: 'try-again' })
  })
})
