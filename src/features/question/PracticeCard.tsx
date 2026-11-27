/**
 * 实操题卡（T2.2 自动判题）：CodeMirror 写代码 → 浏览器内跑测试用例 → 自动判分。
 * 判分聚合委托 domain.gradeCodeFromTests（纯函数）；执行引擎在 lib/pyodide（Worker 隔离 + 超时）。
 * 答错可重试（PRD F04）；看解析只解锁、不计掌握（由上层 revealAnswer 处理）。
 */
import { lazy, Suspense, useState } from 'react'
import type { PracticeQuestion } from '../../data/types'
import { gradeCodeFromTests, type GradeResult, type TestRunResult } from '../../domain/grading'
import { runCode, LANGUAGE_LABEL, type ProgrammingLanguage, type RunPhase } from '../../lib/runtime'
import { isProgrammingLanguage } from '../../lib/runtime'
import { useTheme } from '../../app/providers'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'

/** CodeMirror 按需加载：只在实际打开实操题时才下载编辑器，不进首屏主包 */
const CodeEditor = lazy(() =>
  import('../../components/ui/code-editor').then((m) => ({ default: m.CodeEditor })),
)

export interface PracticeCardProps {
  question: PracticeQuestion
  onSubmit: (result: GradeResult) => void
  answered?: boolean
}

export function PracticeCard({ question, onSubmit, answered = false }: PracticeCardProps) {
  const { resolvedTheme } = useTheme()
  const language: ProgrammingLanguage = isProgrammingLanguage(question.language) ? question.language : 'python'
  const languageLabel = LANGUAGE_LABEL[language]
  const [code, setCode] = useState(question.starterCode ?? '')
  const [showReference, setShowReference] = useState(false)
  const [phase, setPhase] = useState<RunPhase | null>(null)
  const [results, setResults] = useState<TestRunResult[] | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(0)

  const running = phase !== null
  const locked = answered || (!!results && results.every((r) => r.passed))

  const handleRun = async () => {
    if (running || locked) return
    setResults(null)
    setEngineError(null)
    try {
      const runResults = await runCode(question.language, code, question.tests, {
        onPhase: setPhase,
      })
      setResults(runResults)
      const graded = gradeCodeFromTests(question, runResults)
      onSubmit(graded)
    } catch (err) {
      setEngineError(err instanceof Error ? err.message : '运行失败，请重试')
    } finally {
      setPhase(null)
    }
  }

  /** 答错后重试：清空结果，回到可编辑状态（PRD F04） */
  const retry = () => {
    setResults(null)
    setEngineError(null)
    // 主题若在运行期间变化，重建编辑器以套用新主题
    setEditorKey((k) => k + 1)
  }

  const visibleResults = results?.filter((r) => !r.hidden) ?? []
  const hiddenCount = results?.filter((r) => r.hidden).length ?? 0
  const hiddenPassed = results?.filter((r) => r.hidden).every((r) => r.passed) ?? false
  const allPassed = !!results && results.length > 0 && results.every((r) => r.passed)

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">实操题</span>
        <span className="text-[11px] text-muted">{question.difficulty === 'beginner' ? '入门' : '进阶'}</span>
      </div>
      <h2 className="mb-4 text-lg font-semibold leading-snug text-ink">{question.stem}</h2>

      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">在这里写代码</span>
        <span className="text-[11px] text-muted">{languageLabel} · 自动判题</span>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl border border-line bg-accent-soft/40" aria-label="编辑器加载中" />}>
        <CodeEditor
          key={`${editorKey}-${resolvedTheme}-${language}`}
          value={code}
          onChange={setCode}
          readOnly={locked}
          dark={resolvedTheme === 'dark'}
          language={language}
          ariaLabel={`${languageLabel} 代码编辑器`}
        />
      </Suspense>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowReference((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={showReference}
        >
          <Icon name="chevron" size={14} className={showReference ? 'rotate-90' : ''} />
          {showReference ? '收起参考实现' : '查看参考实现'}
        </button>
        {showReference && (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-accent-soft/60 p-4 text-xs leading-relaxed text-ink">
            {question.referenceCode}
          </pre>
        )}
      </div>

      {/* 执行反馈区 */}
      {phase && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted" role="status">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {phase === 'loading'
            ? language === 'python'
              ? '正在加载 Python 运行环境（首次约需十几秒）…'
              : '正在启动 JavaScript 运行环境…'
            : '正在运行测试用例…'}
        </p>
      )}

      {engineError && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3" role="alert">
          <p className="flex items-center gap-2 text-sm text-danger">
            <Icon name="info" size={16} />
            {engineError}
          </p>
          <Button className="mt-2" size="sm" variant="secondary" onClick={handleRun}>重试</Button>
        </div>
      )}

      {results && (
        <div className="mt-4 space-y-2" role="status">
          {visibleResults.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Icon
                name={r.passed ? 'check' : 'info'}
                size={16}
                className={r.passed ? 'mt-0.5 shrink-0 text-success' : 'mt-0.5 shrink-0 text-danger'}
              />
              <span className="text-muted">
                <code className="rounded bg-accent-soft px-1.5 py-0.5 text-xs text-ink">{r.input}</code>
                <span className="mx-1.5">→</span>
                {r.passed ? (
                  <span className="text-success">通过</span>
                ) : (
                  <span className="text-danger">
                    得到 {r.error ? '运行出错' : `「${r.actualOutput}」`}，期望「{r.expectedOutput}」
                  </span>
                )}
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="text-xs text-muted">
              另有 {hiddenCount} 个隐藏测试：{hiddenPassed ? '全部通过' : '未全部通过'}
            </p>
          )}
        </div>
      )}

      {/* 操作区 */}
      {!running && !locked && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={handleRun} variant="primary" disabled={running}>
            运行代码
          </Button>
          <span className="text-xs text-muted">提交后将自动运行测试用例判分</span>
        </div>
      )}
      {results && !allPassed && !running && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={retry} variant="secondary">再试一次</Button>
          <span className="text-xs text-muted">可修改代码后重新运行；看看解析也许有思路</span>
        </div>
      )}
      {locked && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-success" role="status">
          <Icon name="check" size={16} />
          全部测试通过，已掌握（金币与积分已发放）
        </p>
      )}
    </GlassCard>
  )
}
