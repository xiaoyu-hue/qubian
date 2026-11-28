import { useCallback, type MouseEvent } from 'react'

/**
 * 液态玻璃胶囊的鼠标跟随高光：把指针在元素内的相对位置写入
 * CSS 变量 --glow-x / --glow-y，玻璃样式据此移动反光点。
 * 返回 onMouseMove 处理器，直接挂到带 glass-pill 类的元素上即可。
 * 触摸设备不触发 mousemove，反光停在顶部默认值，无需额外分支。
 */
export function useGlow<T extends HTMLElement>() {
  return useCallback((event: MouseEvent<T>) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--glow-x', `${x}%`)
    el.style.setProperty('--glow-y', `${y}%`)
  }, [])
}
