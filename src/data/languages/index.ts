/**
 * 编程语言百科数据入口。
 * 上层页面只依赖本文件，不直接接触 catalog 数组，便于日后扩展数据源。
 */
import { LANGUAGES_INTRO, SECTION_ORDER } from './catalog'
import type { LanguageIntro, LanguageSectionKey } from '../types'

/** 全部语言条目（按推荐学习顺序排列） */
export function listLanguages(): LanguageIntro[] {
  return LANGUAGES_INTRO
}

/** 按 id 查询单门语言 */
export function getLanguageById(id: string): LanguageIntro | undefined {
  return LANGUAGES_INTRO.find((l) => l.id === id)
}

/** 本站可学习的语言（learnable=true） */
export function listLearnableLanguages(): LanguageIntro[] {
  return LANGUAGES_INTRO.filter((l) => l.learnable)
}

/** 板块标题映射（详情页渲染用） */
export const SECTION_TITLES: Record<LanguageSectionKey, string> = {
  what: '是什么',
  history: '发展史',
  pros: '优点',
  cons: '缺点',
  audience: '适合谁',
}

export { SECTION_ORDER }
