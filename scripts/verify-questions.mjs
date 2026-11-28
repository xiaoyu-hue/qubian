#!/usr/bin/env node
/**
 * 实操题质量验证器（零依赖，离线运行）
 * 对应 05-题库数据规范第 8.3 节，是 ADR-007「脚本自动验证 + 自愈」的落地。
 *
 * 对每道实操题做三层验证：
 *   1. 参考实现跑通全部测试（含隐藏测试）——保证题目有正确答案；
 *   2. 起始代码不得已经通过全部测试——保证题目不是「送分」；
 *   3. 注入烂代码，每段都必须被测试拦下——保证测试有区分度、不是弱测试。
 *
 * 判题口径与浏览器端完全一致：
 *   - Python：code + str(input) 取末表达式值（见 pyodide.worker.ts）；
 *   - JavaScript：code + return String(input)（见 javascript.ts）。
 *   stdout 均被吞掉，只比对返回值字符串。
 *
 * 用法：
 *   npm run verify:questions   # 只做实操题三层验证
 *   npm run lint               # 已包含本脚本
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const QUESTIONS_DIR = join(ROOT, 'src', 'data', 'questions')
const PY_TIMEOUT_MS = 5000

const failures = []
const stats = { practice: 0, checks: 0, passed: 0 }

/** 递归列出题库目录下所有题目 JSON（排除 schema.json） */
function listJsonFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listJsonFiles(full))
    else if (name.endsWith('.json') && name !== 'schema.json') out.push(full)
  }
  return out
}

/** 把 JS 字符串转成可嵌入源码的 Python 字符串字面量（JSON 字面量与 Python 3 兼容） */
function pyStr(s) {
  return JSON.stringify(s)
}

/**
 * 构造 Python 程序：复现 Pyodide worker 口径。
 * 用户代码里的 print 被重定向吞掉，末尾用 str(input) 取末表达式值并输出。
 */
function buildPythonProgram(code, input) {
  return [
    'import sys, io, contextlib',
    '_g = {}',
    '_b = io.StringIO()',
    'with contextlib.redirect_stdout(_b), contextlib.redirect_stderr(_b):',
    `    exec(${pyStr(code)}, _g)`,
    `    _r = eval(${pyStr(input)}, _g)`,
    'sys.stdout.write(str(_r))',
  ].join('\n')
}

/** 在 Node 里跑一段 Python，返回 stdout 字符串；异常/超时返回 { error } */
function runPython(code, input) {
  try {
    const out = execFileSync('python3', ['-c', buildPythonProgram(code, input)], {
      encoding: 'utf-8',
      timeout: PY_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { output: out }
  } catch (err) {
    const msg = err.killed ? '执行超时（疑似死循环）' : (err.stderr || err.message || String(err)).toString().trim().split('\n').pop()
    return { error: msg }
  }
}

/** 在 Node 里跑一段 JS，复现线上 javascript.ts 口径；异常返回 { error } */
function runJavaScript(code, input) {
  try {
    const silent = { log() {}, info() {}, warn() {}, error() {}, debug() {} }
    const program = `${code}\n;return String(${input});`
    const run = new Function('console', program)
    return { output: String(run(silent)) }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

function runCode(language, code, input) {
  return language === 'javascript' ? runJavaScript(code, input) : runPython(code, input)
}

/** 跑一道题的全部测试，返回 { allPassed, details } */
function runTests(question, code) {
  const details = []
  for (const test of question.tests) {
    const r = runCode(question.language, code, test.input)
    const actual = r.error ? `<错误: ${r.error}>` : r.output
    details.push({
      input: test.input,
      expected: test.expectedOutput,
      actual,
      hidden: !!test.hidden,
      passed: !r.error && actual === test.expectedOutput,
    })
  }
  return { allPassed: details.every((d) => d.passed), details }
}

/** 从参考实现提取函数签名，用于生成同签名的烂代码 */
function extractSignature(question) {
  const code = question.referenceCode
  if (question.language === 'javascript') {
    // 支持 function name(a, b) / const name = (a, b) => / name(a, b) {
    const m = code.match(/(?:function\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/)
    return m ? { name: m[1], params: m[2] } : null
  }
  // Python: def name(a, b):
  const m = code.match(/def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/)
  return m ? { name: m[1], params: m[2] } : null
}

/** 生成烂代码：同签名、恒返回固定值。返回数组 [描述, 代码] */
function buildBadImplementations(question) {
  const sig = extractSignature(question)
  if (!sig) return []
  const { name, params } = sig
  const uniqOutputs = [...new Set(question.tests.map((t) => t.expectedOutput))]
  const bad = []

  if (question.language === 'javascript') {
    bad.push(['空实现（返回 undefined）', `function ${name}(${params}) {}`])
    // 「背答案」式：恒返回第一个期望值，只有测试有区分度才会被拦下
    if (uniqOutputs.length > 1) {
      bad.push(['恒返回固定值', `function ${name}(${params}) { return ${JSON.stringify(uniqOutputs[0])}; }`])
    }
  } else {
    bad.push(['空实现（返回 None）', `def ${name}(${params}):\n    return None`])
    if (uniqOutputs.length > 1) {
      bad.push(['恒返回固定值', `def ${name}(${params}):\n    return ${pyStr(uniqOutputs[0])}`])
    }
  }
  return bad
}

function fail(q, layer, msg, details) {
  failures.push({ id: q.id, layer, msg, details })
}

// ---------------- 主流程 ----------------
const files = listJsonFiles(QUESTIONS_DIR)
if (files.length === 0) {
  console.error('未找到任何题目 JSON 文件')
  process.exit(1)
}

for (const file of files) {
  const rel = relative(ROOT, file)
  let questions
  try {
    questions = JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) {
    fail({ id: rel }, '解析', `JSON 解析失败：${e.message}`)
    continue
  }
  if (!Array.isArray(questions)) continue

  for (const q of questions) {
    if (q.type !== 'practice') continue
    stats.practice++

    // 层 1：参考实现必须跑通全部测试
    stats.checks++
    const ref = runTests(q, q.referenceCode)
    if (!ref.allPassed) {
      const bad = ref.details.filter((d) => !d.passed)
        .map((d) => `${d.input}→期望 ${JSON.stringify(d.expected)}，实得 ${JSON.stringify(d.actual)}${d.hidden ? '（隐藏）' : ''}`)
        .join('；')
      fail(q, '参考实现', `未通过全部测试：${bad}`, ref.details)
      continue // 参考实现都错了，后续两层无意义
    }
    stats.passed++

    // 层 2：起始代码不得已经通过全部测试（送分题）
    if (typeof q.starterCode === 'string' && q.starterCode.trim()) {
      stats.checks++
      const starter = runTests(q, q.starterCode)
      if (starter.allPassed) {
        fail(q, '起始代码', '起始代码已通过全部测试，题目形同送分', starter.details)
      } else {
        stats.passed++
      }
    }

    // 层 3：注入烂代码，每段都必须被测试拦下（防弱测试）
    for (const [label, badCode] of buildBadImplementations(q)) {
      stats.checks++
      const r = runTests(q, badCode)
      if (r.allPassed) {
        fail(q, '防弱测试', `烂代码「${label}」竟通过了全部测试，说明测试区分度不足`, r.details)
      } else {
        stats.passed++
      }
    }
  }
}

// ---------------- 报告 ----------------
if (failures.length > 0) {
  console.error(`实操题质量验证失败：${failures.length} 项未通过（检查 ${stats.checks} 项 / 实操题 ${stats.practice} 道）\n`)
  for (const f of failures) console.error(`  ✗ [${f.id}] ${f.layer}：${f.msg}`)
  process.exit(1)
}

console.log(
  `实操题质量验证通过：${stats.practice} 道实操题、${stats.checks} 项检查全绿。` +
  `（参考实现全过测试 / 起始代码非送分 / 烂代码被全部拦下）`
)
