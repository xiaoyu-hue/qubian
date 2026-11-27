/**
 * JavaScript 判题核心：纯逻辑，无 Worker/DOM 依赖，可在 Node 环境单测。
 *
 * 判题契约与 Python 完全一致：
 * - 用户 code 定义函数（如 function total(nums) {...}）
 * - test.input 是调用表达式（如 total([1, 2, 3])）
 * - 用 String(表达式) 得到实际输出，与 expectedOutput 做字符串比对
 *
 * 与 Python 的差异：JS 由浏览器原生执行，无需加载 WASM；
 * 每个用例用独立 Function 作用域，天然实现「逐题重置命名空间」。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'

/** 屏蔽用户代码里的 console 输出，避免干扰返回值比对 */
function silentConsole(): Record<string, () => void> {
  return { log() {}, info() {}, warn() {}, error() {}, debug() {} }
}

/**
 * 执行用户 JS 代码并逐条比对测试用例。
 * 同步纯函数：不接触 Worker、不读写存储，异常均收敛为 passed=false。
 */
export function executeJavaScript(code: string, tests: TestCase[]): TestRunResult[] {
  const results: TestRunResult[] = []
  for (const test of tests) {
    try {
      // new Function 每次创建独立作用域 → 用例之间互不污染（等价 Python 重置命名空间）
      // 必须显式 return：JS 不像 Python 的 runPython 会自动返回末条表达式的值
      // 末尾把调用结果转字符串，对齐 Python worker 的 str(...) 口径
      const program = `${code}\n;return String(${test.input});`
      const run = new Function('console', program) as (c: Record<string, () => void>) => unknown
      const actual = String(run(silentConsole()))
      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        hidden: !!test.hidden,
        actualOutput: actual,
        passed: actual === test.expectedOutput,
      })
    } catch (err) {
      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        hidden: !!test.hidden,
        actualOutput: '',
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  return results
}
