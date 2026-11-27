import type { ChoiceQuestion, PracticeQuestion } from '../data/types'

/**
 * 判分领域层（纯函数，无副作用）。
 * 选择题：直接比对选项 key。
 * 实操题：接收执行层跑出的测试结果数组，聚合成 GradeResult；不接触 Worker / DOM。
 */

/** 单个测试用例的执行结果（执行层产出，领域层消费） */
export interface TestRunResult {
  input: string
  expectedOutput: string
  hidden: boolean
  actualOutput: string
  passed: boolean
  error?: string
}

export type GradeResult = {
  correct: boolean
  /** 反馈文案标识，由 UI 层映射为具体文案 */
  feedback: 'correct' | 'try-again' | 'invalid'
}

/** 选择题判分。 */
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

/** 实操题判分（自动判题口径）：全部测试通过才算掌握，含隐藏测试。 */
export function gradeCodeFromTests(
  question: PracticeQuestion,
  results: TestRunResult[],
): GradeResult {
  void question
  if (results.length === 0) return { correct: false, feedback: 'try-again' }
  const correct = results.every((r) => r.passed)
  return { correct, feedback: correct ? 'correct' : 'try-again' }
}

/**
 * 兼容旧调用：直接传入通过与否。
 * 一期自评与「上层不动」约定保留此接口；二期由 gradeCodeFromTests 取代实际判分。
 */
export function gradeCode(
  question: PracticeQuestion,
  passed: boolean,
): GradeResult {
  void question
  return { correct: passed, feedback: passed ? 'correct' : 'try-again' }
}
