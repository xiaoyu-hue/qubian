/**
 * 外部书籍导航条目（PRD F09 / 03-技术决策记录版权分级）。
 * 只放链接卡片，不复制正文；仅收录许可明确的免费开源书：
 * - CC BY-NC-SA / CC BY-SA 属 🟡，避免 SA 条款绑定本产品许可，故只做导航。
 * - 未标明许可者一律不收（如 qiwsir《Python 完全自学教程》：声明版权归作者，不收）。
 * 许可信息于 2026-11-27 逐条核实，来源见各条 url 仓库的 LICENSE / README。
 */
import type { ExternalBook } from '../types'

export const EXTERNAL_BOOKS: ExternalBook[] = [
  {
    id: 'hello-algo',
    title: 'Hello 算法',
    author: '靳锦浩（krahets）等',
    description: '动画图解、可一键运行的数据结构与算法入门教程，支持 Python 等多语言。',
    url: 'https://github.com/krahets/hello-algo',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://github.com/krahets/hello-algo/blob/master/LICENSE',
    tier: 'amber',
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
  },
]
