/**
 * 本地存储仓储（数据层）。
 * 统一管理序列化、命名空间、版本与容错；组件/Store 不直接操作原生 localStorage。
 * 对应 docs/02-架构设计.md 第 5.4 / 7.4 节。
 */

const NAMESPACE = 'qubian'
const SCHEMA_VERSION = 1

function makeKey(name: string): string {
  return `${NAMESPACE}:v${SCHEMA_VERSION}:${name}`
}

interface Envelope<T> {
  version: number
  data: T
}

/**
 * 读取一个持久化项。
 * - 解析失败或结构不符时返回 fallback，不抛错
 * - 旧版本数据（version 不匹配）视为失效，返回 fallback
 */
export function readStored<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(makeKey(name))
    if (raw === null) return fallback
    const parsed = JSON.parse(raw) as Envelope<T>
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.version === SCHEMA_VERSION &&
      'data' in parsed
    ) {
      return parsed.data
    }
    return fallback
  } catch {
    return fallback
  }
}

/** 写入一个持久化项（带版本封装） */
export function writeStored<T>(name: string, data: T): void {
  try {
    const envelope: Envelope<T> = { version: SCHEMA_VERSION, data }
    localStorage.setItem(makeKey(name), JSON.stringify(envelope))
  } catch {
    // 存储不可用（隐私模式/配额满）时静默失败，不影响当前会话
  }
}

/** 删除一个持久化项 */
export function removeStored(name: string): void {
  try {
    localStorage.removeItem(makeKey(name))
  } catch {
    // 同上，静默失败
  }
}

/** 清空本项目命名空间下的全部项（用于「清除数据」入口） */
export function clearAllStored(): void {
  try {
    const prefix = `${NAMESPACE}:v${SCHEMA_VERSION}:`
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  } catch {
    // 同上
  }
}
