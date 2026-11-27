import { describe, expect, it } from 'vitest'
import { dequeueWrong, enqueueWrong } from './review'

describe('enqueueWrong', () => {
  it('答错入队', () => {
    expect(enqueueWrong([], 'q1')).toEqual(['q1'])
  })

  it('同一题重复答错不重复入队（幂等）', () => {
    expect(enqueueWrong(['q1'], 'q1')).toEqual(['q1'])
  })

  it('保持插入顺序', () => {
    expect(enqueueWrong(['q1'], 'q2')).toEqual(['q1', 'q2'])
  })

  it('不修改原数组', () => {
    const original = ['q1']
    enqueueWrong(original, 'q2')
    expect(original).toEqual(['q1'])
  })
})

describe('dequeueWrong', () => {
  it('答对移出队列', () => {
    expect(dequeueWrong(['q1', 'q2'], 'q1')).toEqual(['q2'])
  })

  it('不在队列中则原样返回（幂等）', () => {
    expect(dequeueWrong(['q2'], 'q1')).toEqual(['q2'])
  })

  it('不修改原数组', () => {
    const original = ['q1', 'q2']
    dequeueWrong(original, 'q1')
    expect(original).toEqual(['q1', 'q2'])
  })
})
