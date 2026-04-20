'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { CaseCard } from '@/components/cases/case-card'
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
    <div className="space-y-10 pb-10 px-6 md:px-12 lg:px-24 pt-6">
      <div className="flex gap-8 sm:gap-10 border-b border-al-silver/80 pb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold tracking-widest transition-all relative shrink-0 ${
              activeTab === tab
                ? "text-al-cobalt"
                : "text-al-ink/40 hover:text-al-ink/60"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="cases-underline"
                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-al-cobalt"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {tagFilters.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`text-xs font-medium px-4 py-2 rounded-full transition-all shrink-0 ${
              activeTag === tag
                ? 'bg-al-ink text-al-shell'
                : 'bg-al-silver/40 text-al-ink/60 hover:bg-al-silver/60'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-al-ink/45">
          <p className="font-serif text-lg text-al-ink/70 mb-2">暂无案例</p>
          <p className="text-sm mb-6">成为第一个分享经验的人</p>
          <Link
            href="/cases/new"
            className="inline-flex px-6 py-3 rounded-full bg-al-cobalt text-al-shell text-sm font-bold"
          >
            分享案例
          </Link>
        </div>
      )}
    </div>
  )
}
