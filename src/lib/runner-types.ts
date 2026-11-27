/**
 * 执行层公共类型契约（多语言共用）。
 * 所有语言 runner 遵循同一套选项与消息协议，便于 runtime 统一分发、
 * 也便于上层只依赖统一入口而不接触具体引擎（Pyodide / 原生 JS Worker）。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'

export type RunPhase = 'loading' | 'running'

export interface RunOptions {
  onPhase?: (phase: RunPhase) => void
  /** 加载/启动超时（毫秒）：Python 首次下载 WASM 需较长，JS 通常瞬间完成 */
  loadTimeout?: number
  /** 单个执行批次超时（毫秒），覆盖死循环 */
  runTimeout?: number
}

/** worker → 主线程的消息协议 */
export type WorkerMessage =
  | { type: 'ready' }
  | { type: 'result'; results: TestRunResult[] }
  | { type: 'error'; message: string }

/** 主线程 → worker 的运行请求（各语言按需取用字段） */
export interface RunRequest {
  type: 'run'
  code: string
  tests: TestCase[]
  /** Python 需要 WASM 资源基址；JS 不需要 */
  baseUrl?: string
}
