/**
 * 外部书籍导航条目（PRD F09 / 03-技术决策记录版权分级）。
 * 只放链接卡片，不复制正文；仅收录许可明确的免费开源书：
 * - CC BY-NC-SA / CC BY-SA 属 amber，避免 SA 条款绑定本产品许可，故只做导航。
 * - MIT / Apache-2.0 等宽松许可属 green。
 * - 未标明许可者一律不收（如 rust-lang/book、You-Dont-Know-JS、Eloquent JavaScript
 *   在 GitHub 仓库中无明确 LICENSE 声明，虽是好书仍不收录）。
 * 许可信息于 2026-11-27 逐条核实，来源见各条 licenseUrl 指向的 LICENSE / README。
 */
import type { ExternalBook, ExternalBookCategory } from '../types'

/** 学习方向分类标签（书城筛选条与卡片展示共用） */
export const EXTERNAL_BOOK_CATEGORY_LABEL: Record<ExternalBookCategory, string> = {
  language: '编程语言',
  algorithm: '算法数学',
  ai: 'AI 机器学习',
  resource: '资源索引',
}

export const EXTERNAL_BOOKS: ExternalBook[] = [
  /* ---------- 中文 ---------- */
  {
    id: 'hello-algo',
    title: 'Hello 算法',
    author: '靳锦浩（krahets）等',
    description: '动画图解、可一键运行的数据结构与算法入门教程，支持 Python 等多语言。',
    url: 'https://github.com/krahets/hello-algo',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://github.com/krahets/hello-algo/blob/master/LICENSE',
    tier: 'amber',
    category: 'algorithm',
  },
  {
    id: 'byte-of-python',
    title: '简明 Python 教程（A Byte of Python）',
    author: 'Swaroop C H',
    description: '经典 Python 入门书，中文社区翻译版，适合零基础读者系统通读。',
    url: 'https://github.com/swaroopch/byte-of-python',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://github.com/swaroopch/byte-of-python',
    tier: 'amber',
    category: 'language',
  },
  {
    id: 'typescript-book-zh',
    title: 'TypeScript 中文手册',
    author: '三毛（jkchao）等',
    description: 'TypeScript 官方文档中文翻译，从类型系统到工程实践，适合进阶前端阅读。',
    url: 'https://github.com/jkchao/typescript-book-chinese',
    license: 'MIT',
    licenseUrl: 'https://github.com/jkchao/typescript-book-chinese/blob/master/LICENSE',
    tier: 'green',
    category: 'language',
  },
  {
    id: 'dive-into-deep-learning-zh',
    title: '动手学深度学习（中文版）',
    author: '李沐 等',
    description: '理论结合代码的深度学习教材，中文版含大量可运行示例，适合系统入门。',
    url: 'https://github.com/d2l-ai/d2l-zh',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/d2l-ai/d2l-zh/blob/master/LICENSE',
    tier: 'green',
    category: 'ai',
  },
  {
    id: 'pumpkin-book',
    title: '南瓜书 PumpkinBook',
    author: 'Datawhale',
    description: '《机器学习》（西瓜书）公式推导的通俗详解，帮助零基础读者啃下数学门槛。',
    url: 'https://github.com/datawhalechina/pumpkin-book',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://github.com/datawhalechina/pumpkin-book/blob/master/LICENSE',
    tier: 'amber',
    category: 'ai',
  },
  {
    id: 'happy-llm',
    title: 'Happy-LLM：从零开始的大模型原理与实践教程',
    author: 'Datawhale',
    description: '面向零基础的大语言模型入门教程，覆盖 Transformer、预训练与微调全流程。',
    url: 'https://github.com/datawhalechina/happy-llm',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://github.com/datawhalechina/happy-llm/blob/main/README.md',
    tier: 'amber',
    category: 'ai',
  },
  /* ---------- 英文 / 索引 ---------- */
  {
    id: 'free-programming-books',
    title: 'Free Programming Books',
    author: 'Ebook Foundation',
    description: '全球免费编程书籍索引库，40 万星，按语言与主题分类，含中文分册，适合按图索骥。',
    url: 'https://github.com/EbookFoundation/free-programming-books',
    license: 'CC BY 4.0',
    licenseUrl: 'https://github.com/EbookFoundation/free-programming-books/blob/main/LICENSE',
    tier: 'amber',
    category: 'resource',
  },
  {
    id: 'advanced-go-programming-book',
    title: 'Advanced Go Programming Book',
    author: 'Chai2010 等',
    description: 'Go 语言进阶开源书，涵盖语法、并发与工程实践，适合有一定基础后阅读。',
    url: 'https://github.com/chai2010/advanced-go-programming-book',
    license: 'BSD-2-Clause',
    licenseUrl: 'https://github.com/chai2010/advanced-go-programming-book/blob/master/LICENSE',
    tier: 'green',
    category: 'language',
  },
]
