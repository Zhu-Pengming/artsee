'use client'

import { useRef, useState } from 'react'
import { TrackerCard } from '@/components/profile/tracker-card'
import Link from 'next/link'
import type { UserProfile, ApplicationTracker } from '@/lib/supabase/types'
import { resultLabel, resultColor, timeAgo } from '@/lib/utils'
import { signOut, createTrackerEntry, updateProfile } from '@/lib/actions'
import { DraftModal } from '@/components/profile/draft-modal'
import { createClient } from '@/lib/supabase/client'

const profileTabs: { key: string; label: string; href?: string }[] = [
  { key: '申请追踪', label: '申请追踪' },
  { key: '我的案例', label: '我的案例' },
  { key: '收藏', label: '收藏' },
  { key: '订单', label: '订单', href: '/orders' },
  { key: '选校', label: '选校', href: '/explore' },
]

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
  const [activeTab, setActiveTab] = useState<string>('申请追踪')
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

  const totalLikes = myCases.reduce((sum, c) => sum + (c.like_count ?? 0), 0)

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

      <div className="pb-6 max-w-4xl mx-auto">
        {/* 个人信息 — 小红书风格 */}
        <div className="flex items-start gap-5 sm:gap-6 px-4 sm:px-6 pt-6">
          {/* 左侧头像 */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-surface-container border-2 border-outline-variant/30 shadow-lg flex items-center justify-center ${isSelf ? 'cursor-pointer hover:opacity-90' : 'cursor-default'} disabled:opacity-60 transition-opacity`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
              ) : (
                <span className="text-al-cobalt font-serif font-bold text-3xl sm:text-4xl">{avatarInitial}</span>
              )}
            </button>
            {isSelf && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-al-cobalt text-al-shell rounded-full shadow-md flex items-center justify-center text-sm font-bold pointer-events-none">
                +
              </div>
            )}
          </div>

          {/* 右侧信息 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-al-ink mb-1">{nickname}</h1>
            <p className="text-xs text-on-surface-variant/80 mb-2 truncate">
              ID: {userId.slice(0, 12)}… {profile?.location ? `· ${profile.location}` : ''}
            </p>
            <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">{bio}</p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.role && (
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                  {profile.role === 'admin' ? '管理员' : profile.role}
                </span>
              )}
              {profile?.user_type && (
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                  {profile.user_type === 'student' ? '学生' : profile.user_type}
                </span>
              )}
              {profile?.is_verified && (
                <span className="px-3 py-1 rounded-full bg-al-cobalt/20 text-al-cobalt text-xs font-medium">
                  已认证
                </span>
              )}
            </div>

            {/* 统计数字 — 小红书风格 */}
            <div className="flex items-center gap-5 mb-4">
              <div className="text-center">
                <span className="text-base font-bold text-al-ink">{profile?.following_count ?? 0}</span>
                <span className="text-xs text-on-surface-variant/80 ml-1">关注</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-al-ink">{profile?.followers_count ?? 0}</span>
                <span className="text-xs text-on-surface-variant/80 ml-1">粉丝</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-al-ink">{totalLikes + (profile?.favorites_count ?? 0)}</span>
                <span className="text-xs text-on-surface-variant/80 ml-1">获赞与收藏</span>
              </div>
            </div>

            {/* 操作按钮 */}
            {isSelf && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditProfile(true); setEditError('') }}
                  className="flex-1 max-w-[140px] py-2 rounded-full bg-al-cobalt text-al-shell text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-al-cobalt/15"
                >
                  编辑资料
                </button>
                <button
                  type="button"
                  className="flex-1 max-w-[140px] py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors"
                >
                  分享
                </button>
                <button
                  type="button"
                  onClick={() => setShowDraft(true)}
                  className="flex-1 max-w-[140px] py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors"
                >
                  草稿
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 切换 — 居中，小红书风格 */}
        <div className="flex justify-center border-b border-outline-variant/20 mt-6 mx-4 sm:mx-6">
          {profileTabs.map((tab) => {
            const isActive = activeTab === tab.key
            const isLink = !!tab.href
            return isLink ? (
              <Link
                key={tab.key}
                href={tab.href!}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-on-surface-variant/80 hover:text-on-surface transition-colors"
              >
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-al-ink font-bold'
                    : 'text-on-surface-variant/80 hover:text-on-surface'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-al-cobalt rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* 内容区 */}
        <div className="pt-5 px-4 sm:px-6">
          {activeTab === '申请追踪' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-on-surface-variant/80">共 {trackers.length} 所学校</p>
                {isSelf && (
                  <button onClick={() => { setShowAddTracker(true); setTrackerError('') }} className="text-xs text-al-cobalt font-medium">
                    + 添加学校
                  </button>
                )}
              </div>
              {trackers.length > 0
                ? trackers.map(t => <TrackerCard key={t.id} tracker={t} />)
                : (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/70">
                    <span className="text-4xl mb-3">📋</span>
                    <p className="text-sm mb-2">还没有追踪的学校</p>
                    <p className="text-xs text-on-surface-variant/70">前往探索页选择心仪院校</p>
                  </div>
                )}
            </>
          )}

          {activeTab === '我的案例' && (
            <>
              {myCases.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myCases.map(c => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className="rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`h-24 bg-gradient-to-br ${c.cover_gradient ?? 'from-blue-500 to-purple-600'} flex items-end p-3`}>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${resultColor[c.result]}`}>
                            {resultLabel[c.result]}
                          </span>
                        </div>
                        <div className="p-3 bg-card">
                          <p className="text-xs font-semibold text-on-surface line-clamp-1">{c.title}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-on-surface-variant/80">{c.target_school}</span>
                            <span className="text-[10px] text-on-surface-variant/70">{timeAgo(c.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/70">
                  <span className="text-4xl mb-3">📝</span>
                  <p className="text-sm mb-2">还没有分享过案例</p>
                  <Link href="/cases/new" className="bg-al-cobalt text-al-shell text-xs px-5 py-2.5 rounded-full font-medium mt-2">
                    分享我的申请经历
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === '收藏' && (
            <>
              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map(f => (
                    <Link key={f.id} href={`/explore/${f.programs?.id ?? '#'}`}>
                      <div className="bg-card rounded-xl border border-outline-variant/10 p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{f.programs?.program_name ?? '项目'}</p>
                          <p className="text-xs text-on-surface-variant/80 mt-1">{f.programs?.schools?.name_zh ?? ''}</p>
                        </div>
                        <span className="text-rose-500">❤</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/70">
                  <span className="text-4xl mb-3">🔖</span>
                  <p className="text-sm mb-2">还没有收藏内容</p>
                  <Link href="/explore" className="bg-al-cobalt text-al-shell text-xs px-5 py-2.5 rounded-full font-medium mt-2">
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
          <div className="bg-surface-container-lowest rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">添加申请学校</h3>
              <button onClick={() => setShowAddTracker(false)} className="text-on-surface-variant/70 text-sm">关闭</button>
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
                <input name="school_name" required placeholder="院校名称" className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt" />
                <input name="program_name" required placeholder="专业方向" className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt" />
                <select name="tier" className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt">
                  <option value="reach">冲刺</option>
                  <option value="match">匹配</option>
                  <option value="safety">保底</option>
                </select>
                <select name="status" className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt">
                  <option value="planning">规划中</option>
                  <option value="preparing">准备材料</option>
                  <option value="submitted">已提交</option>
                </select>
                {trackerError && <p className="text-xs text-red-500">{trackerError}</p>}
                <button type="submit" disabled={addingTracker} className="w-full py-3 bg-al-cobalt text-al-shell rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
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
          <div className="bg-surface-container-lowest rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">编辑资料</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-on-surface-variant/70 text-sm">关闭</button>
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
                  <label className="text-xs text-on-surface-variant/80 mb-1 block">昵称</label>
                  <input
                    name="nickname"
                    defaultValue={profile?.nickname ?? ''}
                    placeholder="你的昵称"
                    maxLength={20}
                    className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant/80 mb-1 block">简介</label>
                  <textarea
                    name="bio"
                    defaultValue={profile?.bio ?? ''}
                    placeholder="介绍一下自己..."
                    maxLength={80}
                    rows={2}
                    className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant/80 mb-1 block">所在地</label>
                  <input
                    name="location"
                    defaultValue={profile?.location ?? ''}
                    placeholder="城市 / 国家"
                    maxLength={30}
                    className="w-full border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-al-cobalt"
                  />
                </div>
                {editError && <p className="text-xs text-red-500">{editError}</p>}
                <button type="submit" disabled={editingProfile} className="w-full py-3 bg-al-cobalt text-al-shell rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
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
