/**
 * 多语言执行层统一入口。
 * 上层（如 PracticeCard）只依赖本文件，按题目 language 分发到对应 runner，
 * 不接触具体引擎（Pyodide / 原生 JS Worker）。新增语言时：
 *   1) 实现对应 runner（基于 runner 工厂）；
 *   2) 在 RUNNERS 登记；
 *   3) 在 LANGUAGES / LANGUAGE_LABEL 补展示信息。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'
import type { RunOptions } from './runner-types'
import { runPractice } from './pyodide'
import { createWorkerRunner } from './runner'
import { runJavaScript } from './javascript-runner'

export type { RunPhase, RunOptions } from './runner-types'
export type { TestRunResult } from '../domain/grading'

/** 支持的教学语言 */
export type ProgrammingLanguage = 'python' | 'javascript'

/** 语言的中文展示名，UI 各处以语言 key 取值，避免散落硬编码 */
export const LANGUAGE_LABEL: Record<ProgrammingLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
}

/** 语言列表（引导页 / 设置页 / 学习页复用） */
export const LANGUAGES: { value: ProgrammingLanguage; label: string; available: boolean }[] = [
  { value: 'python', label: 'Python', available: true },
  { value: 'javascript', label: 'JavaScript', available: true },
]

/** language 字符串是否为受支持的语言 */
export function isProgrammingLanguage(value: unknown): value is ProgrammingLanguage {
  return value === 'python' || value === 'javascript'
}

const RUNNERS: Record<ProgrammingLanguage, ReturnType<typeof createWorkerRunner>> = {
  python: runPractice,
  javascript: runJavaScript,
}

/** 按语言运行用户代码对全部测试用例，返回结果数组。未知语言回退 python（容错）。 */
export function runCode(
  language: string,
  code: string,
  tests: TestCase[],
  options?: RunOptions,
): Promise<TestRunResult[]> {
  const runner = isProgrammingLanguage(language) ? RUNNERS[language] : RUNNERS.python
  return runner(code, tests, options)
}
