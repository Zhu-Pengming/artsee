'use client'

import { useState, useMemo } from 'react'
import { PostCard } from '@/components/forum/post-card'
import Link from 'next/link'
import type { Post } from '@/lib/supabase/types'
import { PenSquare } from 'lucide-react'

const tabs = ['问答', '讨论', '资讯'] as const
const hotTags = ['🔥 热门', '牛津', 'CSM', '作品集', '雅思备考', '面试经验']

const typeMap: Record<typeof tabs[number], Post['type']> = {
  '问答': 'question',
  '讨论': 'discussion',
  '资讯': 'news',
}

export function ForumClient({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('问答')
  const [activeTag, setActiveTag] = useState('🔥 热门')

  const filtered = useMemo(() => {
    let list = posts.filter(p => p.type === typeMap[activeTab])
    if (activeTag !== '🔥 热门') {
      list = list.filter(p =>
        p.tags?.some(t => t.includes(activeTag)) ||
        p.title?.includes(activeTag) ||
        p.content?.includes(activeTag)
      )
    }
    return list
  }, [posts, activeTab, activeTag])

  return (
    <div className="pb-6 bg-[#faf9f7]">
      {/* Tab + 发布按钮 */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-[#eeece8] bg-white">
        <div className="flex flex-1 bg-[#f0ede8] rounded-[14px] p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-[12px] text-[11.5px] font-semibold transition-colors ${
                activeTab === tab ? 'bg-white text-[#1e1e1a] shadow-sm' : 'text-[#9b9b93]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Link href="/forum/new" className="w-9 h-9 bg-[#1A4B8C] rounded-[12px] shadow-sm active:scale-95 transition-transform flex items-center justify-center flex-shrink-0">
          <PenSquare size={15} className="text-white" />
        </Link>
      </div>

      {/* 热门 tags */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {hotTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeTag === tag ? 'bg-[#1A4B8C] text-white shadow-sm' : 'bg-[#e8e8e2] text-[#6b6b63]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 帖子列表 */}
      {filtered.length > 0 ? (
        filtered.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-[#9b9b93]">
          <span className="text-3xl mb-2">💬</span>
          <p className="text-sm font-medium">还没有内容，来发第一帖！</p>
        </div>
      )}
    </div>
  )
}
