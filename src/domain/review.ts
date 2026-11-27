/**
 * 错题复习队列领域层（纯函数，T2.8）。
 * 规则：答错入队、答对移出；队列只存题目 id，去重且保持插入顺序。
 */

/** 答错入队：已存在则不重复添加（幂等） */
export function enqueueWrong(ids: string[], questionId: string): string[] {
  return ids.includes(questionId) ? ids : [...ids, questionId]
}

/** 答对移出：不存在则原样返回（幂等） */
export function dequeueWrong(ids: string[], questionId: string): string[] {
  return ids.includes(questionId) ? ids.filter((id) => id !== questionId) : ids
}
