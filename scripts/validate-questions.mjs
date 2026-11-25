#!/usr/bin/env node
/**
 * 题库校验脚本（零依赖）
 * 对应 05-题库数据规范第 8 节：结构校验 + 内容校验。
 *
 * 读取 src/data/questions/schema.json 作为字段契约，扫描所有章节 JSON，
 * 校验：结构合规、ID 全局唯一、双答案非空、correctKey 落在选项内、
 * 实操题参考实现与测试齐全、来源许可合法。
 *
 * 用法：
 *   npm run validate:questions   # 只校验
 *   npm run lint                 # 已包含本脚本
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const QUESTIONS_DIR = join(ROOT, 'src', 'data', 'questions')
const SCHEMA_PATH = join(QUESTIONS_DIR, 'schema.json')

const errors = []
const fail = (file, msg) => errors.push(`${file}: ${msg}`)

/** 递归列出目录下所有 .json 文件（排除 schema.json） */
function listJsonFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listJsonFiles(full))
    else if (name.endsWith('.json') && name !== 'schema.json') out.push(full)
  }
  return out
}

/** 解析 $ref（仅支持本地 #/$defs/... 引用） */
function resolveRef(ref, schema) {
  if (!ref.startsWith('#/')) throw new Error(`不支持的 $ref: ${ref}`)
  let node = schema
  for (const part of ref.slice(2).split('/')) node = node[part]
  if (!node) throw new Error(`$ref 指向不存在的定义: ${ref}`)
  return node
}

/** 对单个值做 schema 校验，收集错误信息到 errs */
function validateValue(value, schemaNode, schema, path, errs) {
  if (!schemaNode || typeof schemaNode !== 'object') return

  // $ref
  if (schemaNode.$ref) {
    validateValue(value, resolveRef(schemaNode.$ref, schema), schema, path, errs)
    return
  }
  // allOf：每一项都要满足
  if (Array.isArray(schemaNode.allOf)) {
    for (const sub of schemaNode.allOf) validateValue(value, sub, schema, path, errs)
  }
  // oneOf：恰好满足一项
  if (Array.isArray(schemaNode.oneOf)) {
    let matched = 0
    for (const sub of schemaNode.oneOf) {
      const subErrs = []
      validateValue(value, sub, schema, path, subErrs)
      if (subErrs.length === 0) matched++
    }
    if (matched !== 1) errs.push(`${path} 满足 ${matched} 个 oneOf 分支（应恰好 1 个）`)
  }

  // type
  if (schemaNode.type) {
    const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value
    const ok =
      schemaNode.type === 'integer' ? Number.isInteger(value) :
      schemaNode.type === 'object' ? actual === 'object' && value !== null && !Array.isArray(value) :
      actual === schemaNode.type
    if (!ok) {
      errs.push(`${path} 类型应为 ${schemaNode.type}，实际为 ${actual}`)
      return
    }
  }
  // const / enum
  if ('const' in schemaNode && value !== schemaNode.const) {
    errs.push(`${path} 应为固定值 ${JSON.stringify(schemaNode.const)}，实际 ${JSON.stringify(value)}`)
  }
  if (Array.isArray(schemaNode.enum) && !schemaNode.enum.includes(value)) {
    errs.push(`${path} 值 ${JSON.stringify(value)} 不在枚举 ${JSON.stringify(schemaNode.enum)} 内`)
  }
  // 字符串：长度
  if (typeof value === 'string') {
    if (schemaNode.minLength !== undefined && value.length < schemaNode.minLength) {
      errs.push(`${path} 长度 ${value.length} < 最小 ${schemaNode.minLength}`)
    }
  }
  // 数组：元素数量、元素校验
  if (Array.isArray(value)) {
    if (schemaNode.minItems !== undefined && value.length < schemaNode.minItems) {
      errs.push(`${path} 元素数 ${value.length} < 最小 ${schemaNode.minItems}`)
    }
    if (schemaNode.items) {
      value.forEach((item, i) => validateValue(item, schemaNode.items, schema, `${path}[${i}]`, errs))
    }
  }
  // 对象：必填、属性、额外字段
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schemaNode.required || []) {
      if (!(key in value)) errs.push(`${path} 缺少必填字段 ${key}`)
    }
    if (schemaNode.properties) {
      for (const [key, sub] of Object.entries(schemaNode.properties)) {
        if (key in value) validateValue(value[key], sub, schema, `${path}.${key}`, errs)
      }
    }
    if (schemaNode.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in (schemaNode.properties || {}))) errs.push(`${path} 存在未定义字段 ${key}`)
      }
    }
  }
}

/** 校验 id 格式（与 schema pattern 一致，单独提示更友好） */
const ID_PATTERN = /^[a-z]+-[a-z]+-\d{3,}$/

let schema
try {
  schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'))
} catch (e) {
  console.error(`无法读取 schema：${SCHEMA_PATH}`)
  console.error(e.message)
  process.exit(1)
}

const files = listJsonFiles(QUESTIONS_DIR)
if (files.length === 0) {
  console.error('未找到任何题目 JSON 文件')
  process.exit(1)
}

const seenIds = new Map()
let total = 0

for (const file of files) {
  const rel = relative(ROOT, file)
  let questions
  try {
    questions = JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) {
    fail(rel, `JSON 解析失败：${e.message}`)
    continue
  }
  if (!Array.isArray(questions)) {
    fail(rel, '顶层必须是题目数组')
    continue
  }

  questions.forEach((q, i) => {
    total++
    const at = `${rel}[${i}]`

    // 结构校验（按 schema 的 items）
    const errs = []
    validateValue(q, schema.items, schema, at, errs)
    for (const e of errs) fail(rel, e)

    if (!q || typeof q !== 'object') return

    // ID 全局唯一 + 格式
    if (typeof q.id === 'string') {
      if (!ID_PATTERN.test(q.id)) fail(rel, `${at} id 格式不合法：${q.id}`)
      if (seenIds.has(q.id)) fail(rel, `${at} id 重复：${q.id}（首次出现于 ${seenIds.get(q.id)}）`)
      else seenIds.set(q.id, rel)
    }

    // 双答案非空（结构已校验，这里给出更明确的提示）
    if (q.answer) {
      if (typeof q.answer.professional !== 'string' || !q.answer.professional.trim()) {
        fail(rel, `${at} answer.professional 不能为空`)
      }
      if (typeof q.answer.plain !== 'string' || !q.answer.plain.trim()) {
        fail(rel, `${at} answer.plain 不能为空`)
      }
    }

    // 选择题：correctKey 必须落在 options 内
    if (q.type === 'choice' && Array.isArray(q.options)) {
      const keys = q.options.map((o) => o?.key)
      if (!keys.includes(q.correctKey)) {
        fail(rel, `${at} correctKey ${JSON.stringify(q.correctKey)} 不在选项 key 列表 ${JSON.stringify(keys)} 内`)
      }
    }

    // 实操题：参考实现与测试齐全
    if (q.type === 'practice') {
      if (typeof q.referenceCode !== 'string' || !q.referenceCode.trim()) {
        fail(rel, `${at} referenceCode 不能为空`)
      }
      if (!Array.isArray(q.tests) || q.tests.length === 0) {
        fail(rel, `${at} tests 至少需要 1 条`)
      }
    }

    // 来源许可合法（当前仅允许项目内许可类型）
    const ALLOWED_SOURCE_TYPES = ['ai-generated', 'mit-import', 'community', 'original']
    if (q.source && !ALLOWED_SOURCE_TYPES.includes(q.source.type)) {
      fail(rel, `${at} source.type ${JSON.stringify(q.source.type)} 不在允许列表 ${JSON.stringify(ALLOWED_SOURCE_TYPES)} 内`)
    }
  })
}

if (errors.length > 0) {
  console.error(`题库校验失败：共 ${errors.length} 项错误（校验 ${files.length} 个文件 / ${total} 道题）\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`题库校验通过：${files.length} 个文件 / ${total} 道题，结构、ID 唯一、双答案、correctKey、来源许可均合规。`)
