/**
 * 代码编辑器（T1.8 升级）：CodeMirror 6 + Python 语法高亮 + 深浅色主题。
 * 受控组件：value 由外部持有，onChange 回传；挂载后只创建一次 EditorView，避免每次输入重建。
 * 主题切换由外部 key 触发重建（主题切换低频，代价可忽略）。
 */
import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

export interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  dark?: boolean
  ariaLabel?: string
}

export function CodeEditor({ value, onChange, readOnly = false, dark = false, ariaLabel }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!host.current) return
    const editor = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        ...(dark ? [oneDark] : []),
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current?.(update.state.doc.toString())
        }),
        EditorView.contentAttributes.of(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      ],
      parent: host.current,
    })
    view.current = editor
    return () => {
      editor.destroy()
      view.current = null
    }
    // 仅在挂载时创建；主题由外部 key 控制重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={host}
      className="overflow-hidden rounded-xl border border-line bg-accent-soft/40 text-sm"
    />
  )
}
