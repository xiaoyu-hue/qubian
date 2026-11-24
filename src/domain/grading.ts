import type { ChoiceQuestion, PracticeQuestion } from '../data/types'

/**
 * 判分领域层（纯函数，无副作用）。
 * 一期实操题走「对照参考答案自评」，gradeCode 保留接口，二期切换 Pyodide 自动判题时上层不变。
 */

export type GradeResult = {
  correct: boolean
  /** 反馈文案标识，由 UI 层映射为具体文案 */
  feedback: 'correct' | 'try-again' | 'invalid'
}

/**
 * 选择题判分。
 * @param question 选择题
 * @param answerKey 用户选择的 key
 */
export function gradeChoice(
  question: ChoiceQuestion,
  answerKey: string,
): GradeResult {
  if (!question.options.some((option) => option.key === answerKey)) {
    return { correct: false, feedback: 'invalid' }
  }
  return {
    correct: answerKey === question.correctKey,
    feedback: answerKey === question.correctKey ? 'correct' : 'try-again',
  }
}

/**
 * 实操题判分占位。
 * 一期：调用方传入自评结果（懂了/需练习）；二期：由 Pyodide 执行 tests 后传入实际结果。
 * @param question 实操题
 * @param passed 是否通过（自评或自动判题结果）
 */
export function gradeCode(
  question: PracticeQuestion,
  passed: boolean,
): GradeResult {
  void question
  return { correct: passed, feedback: passed ? 'correct' : 'try-again' }
}
