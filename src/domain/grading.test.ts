import { describe, expect, it } from 'vitest'
import type { ChoiceQuestion } from '../data/types'
import { gradeChoice } from './grading'

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
