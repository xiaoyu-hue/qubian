/**
 * 小册子目录（元数据）。正文不在此维护，而是由 index.ts 从题库按章节汇编，
 * 保证「书城内容与题库一致」（T1.15 验收口径），题库更新后小册子自动同步。
 */
import type { Booklet } from '../types'
import { BOOKLET_PRICE } from '../config/economy'

/**
 * 首批小册子：一本对应题库的一个章节。
 * 新增小册子时在此登记，并确保 chapter 指向已登记的题库章节。
 */
export const BOOKLETS: Booklet[] = [
  {
    id: 'python-basics-vol1',
    title: 'Python 基础 · 第一辑',
    subtitle: '从变量到函数，25 道双答案精讲',
    description:
      '把基础章节的题目按「专业版 / 大白话」双答案汇编成册。先看题、再看两种讲法，适合学完基础后集中复习。',
    chapter: 'basics',
    language: 'python',
    price: BOOKLET_PRICE,
    badge: '入门',
  },
]
