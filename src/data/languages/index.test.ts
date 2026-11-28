import { describe, expect, it } from 'vitest'
import { getLanguageById, listLanguages, listLearnableLanguages, SECTION_ORDER } from './index'
import { LANGUAGES_INTRO } from './catalog'

describe('编程语言百科数据', () => {
  it('收录 6 门主流语言且 id 唯一', () => {
    const langs = listLanguages()
    expect(langs).toHaveLength(6)
    expect(new Set(langs.map((l) => l.id)).size).toBe(6)
  })

  it('每门语言都有五个完整板块，且双版本非空', () => {
    for (const lang of LANGUAGES_INTRO) {
      expect(lang.sections.map((s) => s.key), `${lang.id} 板块`).toEqual([...SECTION_ORDER])
      for (const section of lang.sections) {
        expect(section.title.trim().length, `${lang.id}/${section.key} 标题`).toBeGreaterThan(0)
        expect(section.content.professional.trim().length, `${lang.id}/${section.key} 专业版`).toBeGreaterThan(20)
        expect(section.content.plain.trim().length, `${lang.id}/${section.key} 大白话`).toBeGreaterThan(20)
        // 两个版本必须是不同内容，而非简单复制
        expect(section.content.professional, `${lang.id}/${section.key} 双版本不应相同`).not.toBe(
          section.content.plain,
        )
      }
    }
  })

  it('元数据完整：年份合理、设计者/定位/关键词/主题色非空', () => {
    for (const lang of LANGUAGES_INTRO) {
      expect(lang.name.trim().length, `${lang.id} name`).toBeGreaterThan(0)
      expect(lang.tagline.trim().length, `${lang.id} tagline`).toBeGreaterThan(0)
      expect(lang.creator.trim().length, `${lang.id} creator`).toBeGreaterThan(0)
      expect(lang.born, `${lang.id} born`).toBeGreaterThanOrEqual(1970)
      expect(lang.born, `${lang.id} born`).toBeLessThanOrEqual(new Date().getFullYear())
      expect(lang.keywords.length, `${lang.id} keywords`).toBeGreaterThanOrEqual(3)
      expect(lang.color, `${lang.id} color`).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('按 id 查询：命中返回完整条目，未命中返回 undefined', () => {
    expect(getLanguageById('python')?.name).toBe('Python')
    expect(getLanguageById('rust')?.name).toBe('Rust')
    expect(getLanguageById('not-exist')).toBeUndefined()
  })

  it('可学习语言恰好是本站开设课程的 Python 与 JavaScript', () => {
    const learnable = listLearnableLanguages().map((l) => l.id)
    expect(learnable).toEqual(['python', 'javascript'])
  })

  it('发展史板块包含关键年份，确保事实准确', () => {
    const years: Record<string, number> = {
      python: 1991,
      javascript: 1995,
      java: 1995,
      c: 1972,
      go: 2009,
      rust: 2015,
    }
    for (const lang of LANGUAGES_INTRO) {
      const history = lang.sections.find((s) => s.key === 'history')!
      expect(history.content.professional, `${lang.id} 发展史应含 ${years[lang.id]}`).toContain(
        String(years[lang.id]),
      )
    }
  })
})
