/**
 * 成长数值配置（对应 PRD F07/F08）。
 * 等级阈值：索引即等级-1，如 thresholds[1]=100 表示升到 Lv.2 需 100 积分。
 */
export const LEVEL_THRESHOLDS: number[] = [0, 100, 300, 600, 1000, 1500]

/** 成就定义（二期完整实现，此处先给骨架清单与基础触发条件） */
export const ACHIEVEMENTS: { id: string; title: string; description: string }[] = [
  { id: 'first-answer', title: '初次上手', description: '答对第一道题' },
  { id: 'ten-correct', title: '小有积累', description: '累计答对 10 道题' },
  { id: 'daily-done', title: '今日达标', description: '完成一次每日任务' },
]
