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
  {
    id: 'python-control-flow-vol1',
    title: '控制流 · 第一辑',
    subtitle: '条件、循环与跳转，15 道双答案精讲',
    description:
      '把控制流章节的题目按「专业版 / 大白话」双答案汇编成册。从 if 判断到 for/while 循环，适合学完基础后系统攻克分支与迭代。',
    chapter: 'control-flow',
    language: 'python',
    price: BOOKLET_PRICE,
    badge: '进阶',
  },
  {
    id: 'python-data-structures-vol1',
    title: '数据结构 · 第一辑',
    subtitle: '列表、字典、元组与集合，15 道双答案精讲',
    description:
      '把数据结构章节的题目按「专业版 / 大白话」双答案汇编成册。从列表下标、切片到字典映射、集合去重，适合系统掌握 Python 常用容器。',
    chapter: 'data-structures',
    language: 'python',
    price: BOOKLET_PRICE,
    badge: '进阶',
  },
]
