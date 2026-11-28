# 参与贡献

感谢你考虑为趣编（QuBian）做贡献。本文说明开发环境、提交规范与两类内容的贡献方式。

## 开始之前

- 先读 [README.md](README.md) 了解产品定位，[01-PRD](docs/01-PRD.md) 了解功能边界，[06-实施计划](docs/06-实施计划.md) 了解当前进度。
- 不确定某件事是否在做，先看实施计划的「当前进度」与「下一启动任务」，或直接开 Issue 询问，避免重复劳动。
- 大改动请先用 Issue 说明思路与取舍，确认方向后再动手。

## 开发环境

要求 Node.js 22 LTS 与现代浏览器。

```bash
git clone https://github.com/xiaoyu-hue/qubian.git
cd qubian
npm ci
npm run dev      # 访问 http://localhost:5173/qubian/
```

## 提交前必须通过的检查

```bash
npm run test     # 单元测试
npm run build    # 类型检查 + 生产构建
npm run lint     # 分层边界 + 题库结构校验
```

三项全绿再提交。若新增了领域逻辑或 Store 行为，请同时补单元测试。

## 代码约定

- 依赖方向自上而下：`pages / features / components → stores → domain → data`。下层禁止 import 上层，`domain` 禁止读写存储。`npm run lint` 会强制检查。
- 领域逻辑写成纯函数，数值走 `src/data/config/` 配置，不在逻辑里写魔数。
- 页面层只做装配，不自定义导航；三端布局复用 `components/layout/` 外壳。
- 组件优先用自研玻璃样式；有键盘 / 读屏要求的复杂交互用 Radix 原语，不引入成套组件库。
- 单个文件若持续膨胀，按 `docs/02-架构设计.md` 的规则拆分。

## 贡献题库

题库按「语言 → 章节」两级目录存放于 `src/data/questions/`（当前为 `python/`、`javascript/`），契约见 `schema.json`（JSON Schema Draft 2020-12）与 [05-题库数据规范](docs/05-题库数据规范.md)。新增题目须满足：

- 字段齐全，`id` 全局唯一；
- `answer.professional` 与 `answer.plain` 均非空，两种深度都要写清楚；
- 标注 `source`（类型、许可、生成时间）；
- 实操题的参考实现能通过自己的 `tests`，并至少有 1 条隐藏测试；
- 通过 `npm run lint` 的结构校验。

题目须为原创或许可明确的内容；不要复制许可不明或未授权的材料。

## 提交与 Pull Request

- 一个提交只做一件事，提交信息说明「做了什么、为什么」。
- 代码与对应文档同步更新（尤其是 `docs/06-实施计划.md` 的进度）。
- 改动若对用户可感知，同步写入 [CHANGELOG.md](CHANGELOG.md) 的 `[Unreleased]` 段落，按 Added / Changed / Fixed 分类；发布时再移入对应版本并标注日期。
- PR 描述里写清改动内容、验证方式与取舍；涉及技术选型时说明理由。

## 版本编号规则

项目版本号为 `主.次.修订` 三段，遵循 [语义化版本 2.0.0](https://semver.org/spec/v2.0.0.html)。发布时由维护者递增，递增哪一段取决于改动的性质：

| 段位 | 形式 | 何时递增 | 例子 |
|---|---|---|---|
| 主版本 | `x.0.0` | 架构变更或破坏性更新：旧数据／旧用法不再兼容，需要迁移或重新适配 | 更换题库数据结构导致旧存档失效、移除核心玩法、更换持久化方案 |
| 次版本 | `1.x.0` | 功能性更新：新增用户可感知的能力，且向下兼容 | 新增一种题型、新增成就、接入第二语言 |
| 修订号 | `1.0.x` | 修复、优化、文档等：不改变功能集合，向下兼容 | 修 Bug、性能优化、补全文档、修正文案 |

判断口径：问自己"老用户升级后，原有的数据和用法会不会出问题"。会 → 主版本；不会但多了新能力 → 次版本；只是变好或修好 → 修订号。拿不准时按更保守的高段位处理。

**发布清单**（每次发布按顺序执行，缺一不可）：

1. 更新 [CHANGELOG.md](CHANGELOG.md)：把 `[Unreleased]` 的改动移入对应版本段、标注日期，并补齐该版本的 Release 链接与 `[Unreleased]` 的 compare 基准（见文末链接定义）。
2. 在 `main` 最新提交上打附注标签 `v主.次.修订`，并推送到远端。
3. 创建对应的 GitHub Release，发布说明直接取 CHANGELOG 该版本段的内容。
4. 核验：Release 列表、标签指向的提交与 CHANGELOG / README 中的版本号三者一致。

> 这四步是一个完整的「发布」动作。只改文档版本号、不打标签不建 Release，在 GitHub 上不会被视为一次发布——1.1.0 曾因此漏发，后按此清单补齐。

当前最新版本为 `v1.2.0`。

## 许可

贡献即表示同意：代码以 Apache-2.0、文档与题库以 CC BY-SA 4.0 授权，与项目整体许可一致。详见 [LICENSE](LICENSE)、[LICENSE-DOCS.txt](LICENSE-DOCS.txt) 与 [NOTICE](NOTICE)。
