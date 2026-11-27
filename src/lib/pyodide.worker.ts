/// <reference lib="webworker" />
/**
 * Pyodide 执行 Worker（T2.1）：在独立线程运行用户 Python 代码，不阻塞界面。
 * 约束（参考调研报告 py-runner）：无文件系统依赖、逐题重置命名空间、异常即判失败。
 * 主线程通过 terminate 实现超时强杀——Python 死循环只能靠销毁 Worker 中断。
 */
import type { TestCase } from '../data/types'
import type { TestRunResult } from '../domain/grading'

interface RunRequest {
  type: 'run'
  baseUrl: string
  code: string
  tests: TestCase[]
}

type PyodideLike = {
  runPython: (code: string) => unknown
  setStdout: (options: { batched: (line: string) => void }) => void
  setStderr: (options: { batched: (line: string) => void }) => void
}

let pyodide: PyodideLike | null = null
let initPromise: Promise<PyodideLike> | null = null

async function ensurePyodide(baseUrl: string): Promise<PyodideLike> {
  if (pyodide) return pyodide
  if (!initPromise) {
    initPromise = (async () => {
      // 运行时动态导入 public 下的本地资源（@vite-ignore：保留原生 URL，由浏览器加载）
      const mod = await import(/* @vite-ignore */ `${baseUrl}pyodide.mjs`)
      const instance = (await mod.loadPyodide({ indexURL: baseUrl })) as PyodideLike
      // stdout/stderr 吞掉，避免用户代码里的 print 干扰返回值比对
      instance.setStdout({ batched: () => {} })
      instance.setStderr({ batched: () => {} })
      pyodide = instance
      return instance
    })()
  }
  return initPromise
}

function normalize(value: unknown): string {
  if (value === null || value === undefined) return 'None'
  return String(value)
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { type, baseUrl, code, tests } = event.data
  if (type !== 'run') return
  try {
    const py = await ensurePyodide(baseUrl)
    self.postMessage({ type: 'ready' })

    const results: TestRunResult[] = []
    for (const test of tests) {
      try {
        // 每个测试重置命名空间：拼成一段执行，末尾用 str() 把返回值转成字符串再交给 JS
        const program = `${code}\nstr(${test.input})`
        const actual = normalize(py.runPython(program))
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
    self.postMessage({ type: 'result', results })
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}

export {}
