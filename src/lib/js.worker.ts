/// <reference lib="webworker" />
/**
 * JavaScript 执行 Worker：在独立线程运行用户 JS 代码，不阻塞界面。
 * 与 Python Worker 的差别：JS 浏览器原生执行，无需加载 WASM，因此没有加载阶段；
 * 但同样放进 Worker——因为死循环会卡死主线程，仍需靠 terminate 强杀。
 * 判题核心委托 lib/javascript.ts 的纯函数 executeJavaScript。
 */
import type { RunRequest, WorkerMessage } from './runner-types'
import { executeJavaScript } from './javascript'

const post = (message: WorkerMessage) => self.postMessage(message)

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { type, code, tests } = event.data
  if (type !== 'run') return
  try {
    // JS 无加载阶段，立即告知主线程进入执行阶段并启动超时计时
    post({ type: 'ready' })
    const results = executeJavaScript(code, tests)
    post({ type: 'result', results })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}

export {}
