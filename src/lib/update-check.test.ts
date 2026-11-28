import { describe, it, expect } from 'vitest'
import { parseVersion, compareVersion } from './update-check'

describe('parseVersion', () => {
  it('解析标准三段版本号', () => {
    expect(parseVersion('1.3.0')).toEqual([1, 3, 0])
    expect(parseVersion('v1.4.0')).toEqual([1, 4, 0])
  })

  it('忽略预发布与构建后缀', () => {
    expect(parseVersion('v1.4.0-beta.1')).toEqual([1, 4, 0])
    expect(parseVersion('2.0.0+build')).toEqual([2, 0, 0])
  })

  it('非法输入返回 null', () => {
    expect(parseVersion('latest')).toBeNull()
    expect(parseVersion('1.2')).toBeNull()
    expect(parseVersion('')).toBeNull()
  })
})

describe('compareVersion', () => {
  it('正确比较大小', () => {
    expect(compareVersion('1.4.0', '1.3.0')).toBe(1)
    expect(compareVersion('1.3.0', '1.4.0')).toBe(-1)
    expect(compareVersion('1.3.0', '1.3.0')).toBe(0)
  })

  it('按数值而非字符串比较', () => {
    expect(compareVersion('1.10.0', '1.9.0')).toBe(1)
    expect(compareVersion('2.0.0', '10.0.0')).toBe(-1)
  })

  it('逐段比较', () => {
    expect(compareVersion('1.3.1', '1.3.0')).toBe(1)
    expect(compareVersion('1.4.0', '2.0.0')).toBe(-1)
  })
})
