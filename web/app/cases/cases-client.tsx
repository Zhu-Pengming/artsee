'use client'

import { useState, useMemo } from 'react'
import { WaterfallGrid } from '@/components/cases/waterfall-grid'
import Link from 'next/link'
import type { Case } from '@/lib/supabase/types'

const tabs = ['全部案例', '录取', '等候', '已拒绝'] as const
const tagFilters = ['全部', '纯艺', '建筑', '设计', '插画', '摄影', 'IDE']

export function CasesClient({ cases }: { cases: Case[] }) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('全部案例')
  const [activeTag, setActiveTag] = useState('全部')

  const filtered = useMemo(() => {
    let list = cases
    if (activeTab === '录取') list = list.filter(c => c.result === 'admitted')
    else if (activeTab === '等候') list = list.filter(c => c.result === 'waitlisted')
    else if (activeTab === '已拒绝') list = list.filter(c => c.result === 'rejected')
    if (activeTag !== '全部') list = list.filter(c => c.tags?.includes(activeTag) || c.target_program?.includes(activeTag))
    return list
  }, [cases, activeTab, activeTag])

  return (
    <div className="pb-6 bg-[#faf9f7]">
      <div className="flex gap-1.5 px-4 pt-3 pb-2.5 border-b border-[#eeece8] bg-white">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-[12px] text-[11.5px] font-semibold transition-all ${
              activeTab === tab ? 'bg-[#1A4B8C] text-white shadow-sm' : 'text-[#9b9b93] hover:bg-[#f0ede8]'
            }`}>{tab}</button>
        ))}
      </div>

      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {tagFilters.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
              activeTag === tag ? 'bg-[#1A4B8C] text-white shadow-sm' : 'bg-[#e8e8e2] text-[#6b6b63]'
            }`}>{tag}</button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 mb-3">
        <span className="text-xs text-gray-500">{filtered.length} 条案例</span>
        <Link href="/cases/new"
          className="flex items-center gap-1.5 bg-[#1A4B8C] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform">
          <span>+</span><span>分享案例</span>
        </Link>
      </div>

      {filtered.length > 0 ? (
        <WaterfallGrid items={filtered} />
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          <p className="text-2xl mb-2">📝</p>
          <p>暂无案例，成为第一个分享的人！</p>
        </div>
      )}
    </div>
  )
}
