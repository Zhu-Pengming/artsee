import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '../profile-client'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/profile')

  // 确保 user_profiles 行存在（首次登录或直接注册的用户可能没有记录）
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    const emailPrefix = user.email?.split('@')[0] ?? '艺见用户'
    await supabase.from('user_profiles').upsert({
      id: user.id,
      nickname: emailPrefix,
      bio: null,
      location: null,
    }, { onConflict: 'id' })
  }

  const isSelf = user.id === id

  const [
    { data: profile },
    { data: trackers },
    { data: myCases },
    { data: favorites },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', id).single(),
    isSelf
      ? supabase.from('application_tracker').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    isSelf
      ? supabase.from('cases').select('id, title, target_school, result, like_count, comment_count, created_at, cover_gradient')
          .eq('author_id', user.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    isSelf
      ? supabase.from('user_favorites')
          .select('*, programs(id, program_name, schools(name_zh))')
          .eq('user_id', user.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  return (
    <ProfileClient
      profile={profile}
      trackers={trackers ?? []}
      myCases={myCases ?? []}
      favorites={favorites ?? []}
      isSelf={isSelf}
      userId={user.id}
    />
  )
}
