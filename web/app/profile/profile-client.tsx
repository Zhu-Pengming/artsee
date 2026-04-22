'use client'

import { useRef, useState } from 'react'
import { TrackerCard } from '@/components/profile/tracker-card'
import Link from 'next/link'
import type { UserProfile, ApplicationTracker } from '@/lib/supabase/types'
import { resultLabel, resultColor, timeAgo } from '@/lib/utils'
import { signOut, createTrackerEntry, updateProfile } from '@/lib/actions'
import { DraftModal } from '@/components/profile/draft-modal'
import { createClient } from '@/lib/supabase/client'

const profileTabs = ['申请追踪', '我的案例', '我的收藏'] as const

type MyCaseRow = {
  id: string
  title: string
  target_school: string | null
  result: 'admitted' | 'waitlisted' | 'rejected'
  like_count: number
  comment_count: number
  created_at: string
  cover_gradient: string | null
}

type FavoriteRow = {
  id: number
  programs?: { id: number; program_name: string; schools?: { name_zh: string } | null } | null
  created_at: string
}

type Props = {
  profile: UserProfile | null
  trackers: ApplicationTracker[]
  myCases: MyCaseRow[]
  favorites: FavoriteRow[]
  isSelf: boolean
  userId: string
}

export function ProfileClient({ profile, trackers, myCases, favorites, isSelf, userId }: Props) {
  const [activeTab, setActiveTab] = useState<typeof profileTabs[number]>('申请追踪')
  const [showAddTracker, setShowAddTracker] = useState(false)
  const [addingTracker, setAddingTracker] = useState(false)
  const [trackerError, setTrackerError] = useState('')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editError, setEditError] = useState('')
  const [showDraft, setShowDraft] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nickname = profile?.nickname ?? '艺见用户'
  const bio = profile?.bio ?? '目标：英国艺术院校 · 努力备考中'
  const avatarUrl = profile?.avatar_url
  const avatarInitial = nickname[0]

  const handleAvatarClick = () => {
    if (!isSelf) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    setUploadingAvatar(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('未登录')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: data.url, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw new Error(error.message)
      window.location.reload()
    } catch (err: any) {
      alert(err.message || '上传失败')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="pb-6 max-w-4xl mx-auto space-y-8">
        {/* 个人信息 — 典藏版横版 */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12">
          <div className="relative flex justify-center sm:justify-start">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-[2rem] overflow-hidden bg-al-silver/50 border-4 border-al-shell shadow-2xl flex items-center justify-center text-5xl ${isSelf ? 'cursor-pointer hover:opacity-90' : 'cursor-default'} disabled:opacity-60 transition-opacity`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
              ) : (
                <span className="text-al-cobalt font-serif font-bold text-6xl">{avatarInitial}</span>
              )}
            </button>
            {isSelf && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 bg-al-cobalt text-al-shell rounded-full shadow-lg flex items-center justify-center text-lg font-bold pointer-events-none">
                +
              </div>
            )}
            {profile?.is_verified && (
              <div className="absolute -bottom-2 -right-2 sm:bottom-auto sm:top-0 sm:-right-2 bg-al-cobalt text-al-shell px-3 py-1.5 rounded-2xl shadow-xl text-xs font-bold">
                已认证
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-al-ink mb-2">{nickname}</h2>
                <p className="text-al-ink/50 font-medium text-sm sm:text-base">
                  {profile?.location ? `${profile.location} · ` : ''}{bio}
                </p>
              </div>
              {isSelf && (
                <div className="flex gap-3 justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowEditProfile(true); setEditError('') }}
                    className="bg-al-cobalt text-al-shell px-6 sm:px-8 py-2.5 rounded-full text-sm font-bold hover:opacity-90 shadow-lg shadow-al-cobalt/20"
                  >
                    编辑资料
                  </button>
                  <button
                    type="button"
                    className="bg-al-silver/60 text-al-ink/60 px-4 py-2.5 rounded-full hover:bg-al-silver transition-colors text-sm font-medium"
                    aria-label="分享"
                  >
                    分享
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('确定要退出登录吗？')) {
                        await signOut()
                        window.location.href = '/'
                      }
                    }}
                    className="bg-al-silver/60 text-al-ink/60 px-4 py-2.5 rounded-full hover:bg-al-silver transition-colors text-sm font-medium"
                    title="退出登录"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: '关注', value: profile?.following_count ?? 0 },
            { label: '粉丝', value: profile?.followers_count ?? 0 },
            { label: '案例', value: myCases.length },
            { label: '收藏', value: favorites.length },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl border border-al-silver/60 bg-al-shell py-4 text-center shadow-sm"
            >
              <span className="text-xl font-serif font-bold text-al-ink">{s.value}</span>
              <p className="text-[10px] uppercase tracking-widest text-al-ink/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 快捷工具 */}
        {isSelf && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 py-2 border-b border-al-silver/50">
            {[
              { label: '选校清单', color: 'bg-al-cobalt/8 text-al-cobalt', href: '/explore', onClick: undefined },
              { label: '我的收藏', color: 'bg-al-silver/50 text-al-cobalt-muted', href: undefined, onClick: () => setActiveTab('我的收藏') },
              { label: '文书草稿', color: 'bg-al-silver/50 text-al-ink/70', href: undefined, onClick: () => setShowDraft(true) },
              { label: '分享案例', color: 'bg-al-cobalt/10 text-al-cobalt', href: '/cases/new', onClick: undefined },
            ].map(({ label, color, href, onClick }) =>
              href ? (
                <Link key={label} href={href} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xs font-bold`}>
                    {label.slice(0, 1)}
                  </div>
                  <span className="text-[9px] text-al-ink/50 text-center leading-tight">{label}</span>
                </Link>
              ) : (
                <button key={label} onClick={onClick} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xs font-bold`}>
                    {label.slice(0, 1)}
                  </div>
                  <span className="text-[9px] text-al-ink/50 text-center leading-tight">{label}</span>
                </button>
              )
            )}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex border-b border-al-silver/50">
          {profileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-al-cobalt text-al-cobalt'
                  : 'border-transparent text-al-ink/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="pt-4">
          {activeTab === '申请追踪' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">共 {trackers.length} 所学校</p>
                {isSelf && (
                  <button onClick={() => { setShowAddTracker(true); setTrackerError('') }} className="text-xs text-al-cobalt font-medium">
                    + 添加学校
                  </button>
                )}
              </div>
              {trackers.length > 0
                ? trackers.map(t => <TrackerCard key={t.id} tracker={t} />)
                : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <span className="text-3xl mb-2">📋</span>
                    <p className="text-sm mb-3">还没有追踪的学校</p>
                    <p className="text-xs text-gray-400">前往探索页选择心仪院校</p>
                  </div>
                )}
            </>
          )}

          {activeTab === '我的案例' && (
            <>
              {myCases.length > 0 ? (
                <div className="space-y-3">
                  {myCases.map(c => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className={`rounded-xl overflow-hidden border border-gray-100 shadow-sm`}>
                        <div className={`h-16 bg-gradient-to-br ${c.cover_gradient ?? 'from-blue-500 to-purple-600'} flex items-center px-3`}>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${resultColor[c.result]}`}>
                            {resultLabel[c.result]}
                          </span>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-gray-900 line-clamp-1">{c.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-500">{c.target_school}</span>
                            <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <span className="text-3xl mb-2">📝</span>
                  <p className="text-sm mb-3">还没有分享过案例</p>
                  <Link href="/cases/new" className="bg-al-cobalt text-white text-xs px-4 py-2 rounded-full font-medium">
                    分享我的申请经历
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === '我的收藏' && (
            <>
              {favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map(f => (
                    <Link key={f.id} href={`/explore/${f.programs?.id ?? '#'}`}>
                      <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{f.programs?.program_name ?? '项目'}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{f.programs?.schools?.name_zh ?? ''}</p>
                        </div>
                        <span className="text-rose-500 text-xs">❤</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <span className="text-3xl mb-2">🔖</span>
                  <p className="text-sm mb-3">还没有收藏内容</p>
                  <Link href="/explore" className="bg-al-cobalt text-white text-xs px-4 py-2 rounded-full font-medium">
                    去探索院校
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 添加追踪 Modal */}
      {showAddTracker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">添加申请学校</h3>
              <button onClick={() => setShowAddTracker(false)} className="text-gray-400 text-sm">关闭</button>
            </div>
            <form action={async (fd: FormData) => {
              setAddingTracker(true)
              setTrackerError('')
              const res = await createTrackerEntry(fd)
              setAddingTracker(false)
              if ('error' in res) { setTrackerError(res.error ?? '操作失败'); return }
              setShowAddTracker(false)
            }}>
              <div className="space-y-3">
                <input name="school_name" required placeholder="院校名称" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt" />
                <input name="program_name" required placeholder="专业方向" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt" />
                <select name="tier" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt">
                  <option value="reach">冲刺</option>
                  <option value="match">匹配</option>
                  <option value="safety">保底</option>
                </select>
                <select name="status" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt">
                  <option value="planning">规划中</option>
                  <option value="preparing">准备材料</option>
                  <option value="submitted">已提交</option>
                </select>
                {trackerError && <p className="text-xs text-red-500">{trackerError}</p>}
                <button type="submit" disabled={addingTracker} className="w-full py-3 bg-al-cobalt text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {addingTracker ? <span className="animate-pulse">保存中…</span> : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑资料 Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">编辑资料</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-gray-400 text-sm">关闭</button>
            </div>
            <form action={async (fd: FormData) => {
              setEditingProfile(true)
              setEditError('')
              const res = await updateProfile(fd)
              setEditingProfile(false)
              if ('error' in res) { setEditError(res.error ?? '保存失败'); return }
              setShowEditProfile(false)
            }}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">昵称</label>
                  <input
                    name="nickname"
                    defaultValue={profile?.nickname ?? ''}
                    placeholder="你的昵称"
                    maxLength={20}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">简介</label>
                  <textarea
                    name="bio"
                    defaultValue={profile?.bio ?? ''}
                    placeholder="介绍一下自己..."
                    maxLength={80}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">所在地</label>
                  <input
                    name="location"
                    defaultValue={profile?.location ?? ''}
                    placeholder="城市 / 国家"
                    maxLength={30}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt"
                  />
                </div>
                {editError && <p className="text-xs text-red-500">{editError}</p>}
                <button type="submit" disabled={editingProfile} className="w-full py-3 bg-al-cobalt text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {editingProfile ? <span className="animate-pulse">保存中…</span> : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 文书草稿 Modal */}
      {showDraft && <DraftModal onClose={() => setShowDraft(false)} />}
    </>
  )
}
