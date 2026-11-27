/**
 * Python（Pyodide）执行封装（T2.1）。
 * - 按需：首次调用才创建 Worker 并加载 Pyodide（约 13MB），之后复用同一实例。
 * - 隔离：Python 跑在 module Worker，不卡 UI。
 * - 超时：加载阶段较长（弱网下载 WASM），进入执行阶段后缩短；超时 terminate Worker 并重置。
 *
 * Worker 单例/超时/协议由通用 runner 工厂承担；本文件只负责 Python 特有的：
 * 资源路径解析 + 把 run 请求带上 baseUrl。导出的 runPractice 签名保持不变，
 * 上层（PracticeCard）与既有测试无需改动。
 */
import { createWorkerRunner } from './runner'

export type { RunPhase, RunOptions } from './runner-types'
export type { TestRunResult } from '../domain/grading'

function resolveBaseUrl(): string {
  // 资源位于 public/pyodide/，线上路径为 {BASE_URL}pyodide/
  const base = import.meta.env.BASE_URL || '/'
  const withSlash = base.endsWith('/') ? base : `${base}/`
  return `${withSlash}pyodide/`
}

const runPracticeImpl = createWorkerRunner(
  () => new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' }),
  (code, tests) => ({ type: 'run', baseUrl: resolveBaseUrl(), code, tests }),
)

/** 运行用户 Python 代码对全部测试用例，返回结果数组；一次只支持一个在途请求。 */
export const runPractice = runPracticeImpl
