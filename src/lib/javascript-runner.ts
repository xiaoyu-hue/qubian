/**
 * JavaScript 执行封装：复用通用 runner 工厂，Worker 隔离 + 超时强杀。
 * 与 Python 的差异：JS 浏览器原生执行，无 WASM 下载，Worker 启动即就绪；
 * 因此把默认加载超时压到 10 秒（仅覆盖 Worker 脚本加载），执行超时仍为 8 秒。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'
import type { RunOptions } from './runner-types'
import { createWorkerRunner } from './runner'

const runJsImpl = createWorkerRunner(
  () => new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' }),
  (code, tests) => ({ type: 'run', code, tests }),
)

/** 运行用户 JS 代码对全部测试用例，返回结果数组。 */
export function runJavaScript(
  code: string,
  tests: TestCase[],
  options: RunOptions = {},
): Promise<TestRunResult[]> {
  return runJsImpl(code, tests, { loadTimeout: 10_000, ...options })
}
