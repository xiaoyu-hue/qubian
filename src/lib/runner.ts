/**
 * 通用 Worker 执行器：把「单例 Worker + 超时强杀 + ready/result/error 协议」
 * 抽象为工厂，Python（Pyodide）与 JavaScript（原生）各自提供一个实例。
 *
 * 为什么不直接共用：两种语言是不同 Worker 类型，各自维护一个单例；
 * 超时/协议/logic 完全一致，抽成工厂可避免复制粘贴。
 *
 * 死循环无法在 Worker 内中断，只能由主线程 terminate——这是两种语言共同的约束。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'
import type { RunOptions, RunRequest, WorkerMessage } from './runner-types'

export type WorkerFactory = () => Worker
export type RequestBuilder = (code: string, tests: TestCase[]) => RunRequest
export type Runner = (code: string, tests: TestCase[], options?: RunOptions) => Promise<TestRunResult[]>

export function createWorkerRunner(workerFactory: WorkerFactory, buildRequest: RequestBuilder): Runner {
  let worker: Worker | null = null

  const reset = () => {
    worker?.terminate()
    worker = null
  }

  return function run(code, tests, options = {}) {
    return new Promise<TestRunResult[]>((resolve, reject) => {
      const { onPhase, loadTimeout = 90_000, runTimeout = 8_000 } = options
      let settled = false
      let timer: ReturnType<typeof setTimeout>

      const finish = (fn: () => void) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        fn()
      }

      if (!worker) worker = workerFactory()
      const current = worker

      current.onmessage = (event: MessageEvent) => {
        const data = event.data as WorkerMessage
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
      current.postMessage(buildRequest(code, tests))
    })
  }
}
