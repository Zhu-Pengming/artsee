import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { School } from "@/lib/supabase/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 导入数据里常用占位：中文统一写「综合艺术院校」，英文对应 Comprehensive Art Schools */
const PLACEHOLDER_SCHOOL_ZH = "综合艺术院校"

function isPlaceholderSchoolEn(name: string | null | undefined): boolean {
  if (!name?.trim()) return true
  return /^comprehensive art schools$/i.test(name.trim())
}

/** 解析列表/详情里展示的院校名：避免占位中英名来回套娃 */
export function resolveSchoolDisplayName(school: School | null | undefined): string {
  if (!school) return "未知院校"
  const zh = school.name_zh?.trim()
  const en = school.name_en?.trim()
  if (zh && zh !== PLACEHOLDER_SCHOOL_ZH) return zh
  if (en && !isPlaceholderSchoolEn(en)) return en
  return "院校信息待完善"
}

// 颜色映射：院校关键词 → 渐变色（暖色系哑光调）
export const schoolGradients: Record<string, string> = {
  '牛津':      'from-[#5c4033] to-[#3e2723]',   // 深棕 — 牛津感
  '剑桥':      'from-[#2e5e4e] to-[#1b3a30]',   // 深鼠尾草绿
  '帝国理工':  'from-[#3d3d3d] to-[#1a1a1a]',   // 炭灰
  'UCL':       'from-[#4a3728] to-[#2c1f15]',   // 深赭石
  '伦敦大学学院': 'from-[#4a3728] to-[#2c1f15]',
  '爱丁堡':    'from-[#5c3d2e] to-[#3b2318]',   // 焦赭
  '中央圣马丁': 'from-[#2d3b2d] to-[#1a231a]',  // 深橄榄
  '坎伯韦尔':  'from-[#4d3b2e] to-[#2f2218]',   // 烟棕
  '皇家艺术':  'from-[#5c2d2d] to-[#3b1a1a]',   // 暗砖红
  '综合艺术院校': 'from-[#4a4035] to-[#2c251c]', // 暖深沙
  '格拉斯哥':  'from-[#2e3b35] to-[#1a2420]',   // 深苔藓
  '鲁斯金':    'from-[#4a3320] to-[#2e1f10]',   // 深琥珀棕
  '切尔西':    'from-[#3b3d3a] to-[#222320]',   // 暖炭
  '伦敦时装':  'from-[#4a2d3a] to-[#2c1a22]',   // 深梅
  '伦敦传播':  'from-[#3a3328] to-[#221e15]',   // 暖深棕
  '伦敦艺术大学': 'from-[#3d3528] to-[#241f16]',
  '柏林':      'from-[#2d2d2d] to-[#111111]',   // 近黑
  '佛罗伦萨':  'from-[#5c4020] to-[#3a2510]',   // 金棕
  '巴黎':      'from-[#3a2d40] to-[#221a28]',   // 深丁香
}

export function getSchoolGradient(name: string): string {
  const key = Object.keys(schoolGradients).find(k => name.includes(k))
  return key ? schoolGradients[key] : 'from-[#3d3528] to-[#221f16]'
}

export function getSchoolInitial(name: string): string {
  const map: Record<string, string> = {
    '牛津': 'Ox', '剑桥': 'Cam', '帝国理工': 'IC',
    'UCL': 'UCL', '爱丁堡': 'Edin', '中央圣马丁': 'CSM',
    '坎伯韦尔': 'CAM', '皇家艺术': 'RCA', '综合艺术院校': 'Art',
    '格拉斯哥': 'GSA', '鲁斯金': 'Rus', '切尔西': 'CCA',
    '伦敦时装': 'LCF', '伦敦传播': 'LCC', '伦敦艺术大学': 'UAL',
    '柏林': 'UdK', '佛罗伦萨': 'AFAM', '巴黎': 'ENSBA',
  }
  const key = Object.keys(map).find(k => name.includes(k))
  return key ? map[key] : name.slice(0, 2)
}

export const resultLabel = {
  admitted: '🎉 录取',
  waitlisted: '⏳ 等候',
  rejected: '❌ 拒绝',
} as const

export const resultColor = {
  admitted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  waitlisted: 'bg-yellow-100 text-yellow-700 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
} as const

export const statusLabel = {
  planning: '规划中', preparing: '准备材料', submitted: '已提交',
  interview: '面试中', admitted: '已录取', rejected: '已拒绝', waitlisted: '等候名单',
} as const

export const statusColor = {
  planning: 'bg-surface-container-high text-on-surface-variant dark:bg-surface-container-high dark:text-on-surface-variant',
  preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  submitted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  interview: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  admitted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  waitlisted: 'bg-yellow-100 text-yellow-700 dark:bg-amber-900/30 dark:text-amber-400',
} as const

export const tierLabel = { reach: '冲刺', match: '匹配', safety: '保底' } as const
export const tierColor = { reach: 'text-red-500 dark:text-red-400', match: 'text-blue-500 dark:text-blue-400', safety: 'text-green-500 dark:text-green-400' } as const

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}天前`
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
