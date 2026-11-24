#!/usr/bin/env node
/**
 * 架构边界检查（T0.6）。
 * 目的：强制 docs/02 第 1.2 节的单向依赖——下层禁止 import 上层。
 *
 * 依赖方向：pages/features/components → stores → domain → data
 * - 领域层 domain：纯逻辑，禁止依赖 React/UI/装配层/Store，禁止直接读写存储
 * - 数据层 data：禁止依赖 UI/页面/装配层/Store
 *
 * 这是纯文本路径检查，不需要 TypeScript 类型感知，因此不依赖 typescript-eslint
 * （后者在 TypeScript 7 下无法加载）。故意违规 import 时退出码为 1。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname ?? '.', '..')
const SRC = join(ROOT, 'src')

/** 递归收集某目录下匹配后缀的文件 */
function collectFiles(dir, exts) {
  const out = []
  if (!statSync(dir, { throwIfNoEntry: false })) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectFiles(full, exts))
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

/** 禁止上层模块的路径模式（转为正则片段） */
const UPPER_LAYER_PATTERNS = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^react-router-dom($|\/)/,
  /(^|\/)app($|\/)/,
  /(^|\/)components($|\/)/,
  /(^|\/)features($|\/)/,
  /(^|\/)pages($|\/)/,
  /(^|\/)stores($|\/)/,
]

/** 领域层额外禁止：直接读写存储仓储 */
const DOMAIN_EXTRA_PATTERNS = [
  /(^|\/)repositories($|\/)/,
  /(^|\/)storage($|\/)/,
]

/** 提取源码中的所有 import 模块路径 */
function extractImports(source) {
  const paths = []
  // import ... from 'path' / import 'path' / export ... from 'path'
  const re = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
  let match
  while ((match = re.exec(source)) !== null) {
    paths.push({ path: match[1], line: source.slice(0, match.index).split('\n').length })
  }
  return paths
}

function matchesAny(importPath, patterns) {
  return patterns.some((re) => re.test(importPath))
}

const RULES = [
  {
    name: '领域层 domain',
    dir: join(SRC, 'domain'),
    patterns: UPPER_LAYER_PATTERNS,
    extra: DOMAIN_EXTRA_PATTERNS,
    skip: (f) => f.endsWith('.test.ts'),
  },
  {
    name: '数据层 data',
    dir: join(SRC, 'data'),
    patterns: UPPER_LAYER_PATTERNS,
    extra: [],
    skip: (f) => f.endsWith('.test.ts'),
  },
]

const violations = []
let checkedFiles = 0

for (const rule of RULES) {
  const files = collectFiles(rule.dir, ['.ts', '.tsx']).filter((f) => !rule.skip(f))
  for (const file of files) {
    checkedFiles += 1
    const source = readFileSync(file, 'utf-8')
    for (const { path, line } of extractImports(source)) {
      const hitUpper = matchesAny(path, rule.patterns)
      const hitExtra = matchesAny(path, rule.extra)
      if (hitUpper || hitExtra) {
        violations.push({
          rel: relative(ROOT, file),
          line,
          path,
          rule: rule.name,
          reason: hitExtra
            ? '领域层禁止直接读写存储（docs/02 第 5.3 节）'
            : '下层禁止 import 上层（docs/02 第 1.2 / 325 行）',
        })
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`架构边界检查失败：发现 ${violations.length} 处违规 import\n`)
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}`)
    console.error(`    import "${v.path}"  →  ${v.reason}`)
  }
  process.exit(1)
}

console.log(`架构边界检查通过：${checkedFiles} 个文件，未发现跨层违规 import。`)
