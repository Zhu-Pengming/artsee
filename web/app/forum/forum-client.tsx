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
    <div className="pb-6 space-y-3">
      {/* Tab + 发布按钮 */}
      <div className="flex items-center gap-2 pt-1 pb-2 border-b border-al-silver/50">
        <div className="flex flex-1 bg-al-silver/50 rounded-xl p-0.5 border border-al-silver/40">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab ? 'bg-al-shell text-al-ink shadow-sm' : 'text-al-ink/45'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Link href="/forum/new" className="w-9 h-9 bg-al-cobalt rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-al-cobalt/20">
          <PenSquare size={15} className="text-al-shell" />
        </Link>
      </div>

      {/* 热门 tags */}
      <div className="flex gap-2 py-1 overflow-x-auto scrollbar-hide">
        {hotTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
              activeTag === tag ? 'bg-al-cobalt text-al-shell' : 'bg-al-silver/50 text-al-ink/60'
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
        <div className="flex flex-col items-center justify-center py-16 text-al-ink/40">
          <span className="text-3xl mb-2">💬</span>
          <p className="text-sm">还没有内容，来发第一帖！</p>
        </div>
      )}
    </div>
  )
}
