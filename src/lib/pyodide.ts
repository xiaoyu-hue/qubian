/**
 * 浏览器内代码执行封装（T2.1）：按需加载 + Worker 隔离 + 超时强杀。
 * - 按需：首次调用 runPractice 才创建 Worker 并加载 Pyodide（约 13MB），之后复用同一实例。
 * - 隔离：Python 跑在 module Worker，不卡 UI。
 * - 超时：加载阶段较长（弱网下载 WASM），进入执行阶段后缩短；超时 terminate Worker 并重置，下次重建。
 * 该层有副作用（Worker/DOM），判分聚合仍是 domain.grading 的纯函数。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'

export type { TestRunResult } from '../domain/grading'

export type RunPhase = 'loading' | 'running'
export interface RunOptions {
  onPhase?: (phase: RunPhase) => void
  /** 加载超时（毫秒），默认 90 秒，覆盖首次下载 WASM */
  loadTimeout?: number
  /** 单个执行批次超时（毫秒），默认 8 秒，覆盖死循环 */
  runTimeout?: number
}

let worker: Worker | null = null
let baseUrl = '/'

function resolveBaseUrl(): string {
  // 资源位于 public/pyodide/，线上路径为 {BASE_URL}pyodide/
  const base = import.meta.env.BASE_URL || '/'
  const withSlash = base.endsWith('/') ? base : `${base}/`
  return `${withSlash}pyodide/`
}

function reset(): void {
  worker?.terminate()
  worker = null
}

/**
 * 运行用户代码对全部测试用例，返回结果数组。
 * 注意：一次只支持一个在途请求（答题页同一时刻只有一道实操题在跑）。
 */
export function runPractice(
  code: string,
  tests: TestCase[],
  options: RunOptions = {},
): Promise<TestRunResult[]> {
  return new Promise((resolve, reject) => {
    const { onPhase, loadTimeout = 90_000, runTimeout = 8_000 } = options
    baseUrl = resolveBaseUrl()
    let settled = false
    let timer: ReturnType<typeof setTimeout>

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }

    if (!worker) {
      worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' })
    }
    const current = worker

    current.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { type: 'ready' }
        | { type: 'result'; results: TestRunResult[] }
        | { type: 'error'; message: string }
      if (data.type === 'ready') {
        clearTimeout(timer)
        onPhase?.('running')
        timer = setTimeout(() => {
          reset()
          finish(() => reject(new Error('代码执行超时，可能存在死循环')))
        }, runTimeout)
      } else if (data.type === 'result') {
        finish(() => resolve(data.results))
      } else if (data.type === 'error') {
        finish(() => reject(new Error(data.message)))
      }
    }
    current.onerror = (event) => {
      finish(() => reject(new Error(event.message || '运行环境加载失败')))
      reset()
    }

    onPhase?.('loading')
    timer = setTimeout(() => {
      reset()
      finish(() => reject(new Error('运行环境加载超时，请检查网络后重试')))
    }, loadTimeout)
    current.postMessage({ type: 'run', baseUrl, code, tests })
  })
}
