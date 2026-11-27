import { describe, expect, it } from 'vitest'
import { executeJavaScript } from './javascript'

/**
 * JS 判题核心单测：契约与 Python 一致（code 定义函数 + test.input 调用表达式 + String 转字符串）。
 * 纯函数在 Node 环境执行，无需浏览器 Worker。
 */
const code = `function total(nums) {
  let s = 0
  for (const n of nums) s += n
  return s
}`
const tests = [
  { input: 'total([1, 2, 3])', expectedOutput: '6' },
  { input: 'total([])', expectedOutput: '0' },
  { input: 'total([10, -3, 5])', expectedOutput: '12', hidden: true },
]

describe('executeJavaScript', () => {
  it('正确实现应全部通过（含隐藏测试）', () => {
    const results = executeJavaScript(code, tests)
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.passed)).toBe(true)
    expect(results.map((r) => r.actualOutput)).toEqual(['6', '0', '12'])
    expect(results[2].hidden).toBe(true)
  })

  it('错误实现应判失败并回报实际输出', () => {
    const wrong = `function total(nums) { return 999 }`
    const results = executeJavaScript(wrong, tests)
    expect(results.every((r) => !r.passed)).toBe(true)
    expect(results[0].actualOutput).toBe('999')
    expect(results[0].expectedOutput).toBe('6')
  })

  it('运行时异常收敛为 passed=false，不抛出', () => {
    const broken = `function total(nums) { throw new Error('boom') }`
    const results = executeJavaScript(broken, tests)
    expect(results.every((r) => !r.passed)).toBe(true)
    expect(results[0].error).toContain('boom')
  })

  it('语法错误收敛为 passed=false，不抛出', () => {
    const results = executeJavaScript('function total( {', tests)
    expect(results.every((r) => !r.passed)).toBe(true)
    expect(results[0].error).toBeTruthy()
  })

  it('用例之间状态隔离：每个用例重新执行 code，计数器不会累加', () => {
    // counter 在 code 里初始化为 0；两个用例都调用 inc()，期望都得到 1
    // 若用例间状态共享，第二个会得到 2 —— 以此验证逐题重置命名空间
    const counterCode = `var counter = 0; function inc() { return ++counter }`
    const twoTests = [
      { input: 'inc()', expectedOutput: '1' },
      { input: 'inc()', expectedOutput: '1' },
    ]
    const results = executeJavaScript(counterCode, twoTests)
    expect(results[0].passed).toBe(true)
    expect(results[1].passed).toBe(true)
  })

  it('console 输出被吞掉，不干扰返回值比对', () => {
    const noisy = `function total(nums) { console.log('debug'); return nums.length }`
    const results = executeJavaScript(noisy, [{ input: 'total([1,2])', expectedOutput: '2' }])
    expect(results[0].passed).toBe(true)
  })
})
