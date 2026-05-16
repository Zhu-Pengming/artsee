import { createClient } from '@/lib/supabase/server'
import { getSchoolGradient, getSchoolInitial } from '@/lib/utils'
import Link from 'next/link'

export async function StoryBar() {
  const supabase = await createClient()
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name_zh, name_en')
    .eq('status', 'active')
    .order('id')
    .limit(10)

  const items = schools ?? []

  return (
    <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
      {items.map((s) => (
        <Link
          key={s.id}
          href={`/explore?school=${encodeURIComponent(s.name_zh)}`}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
        >
          {/* Pinterest: generous ring with warm offset background */}
          <div
            className={`w-[52px] h-[52px] rounded-full bg-gradient-to-br ${getSchoolGradient(s.name_zh)} flex items-center justify-center ring-2 ring-[#c8a882]/40 ring-offset-2 ring-offset-[#faf9f7] shadow-sm`}
          >
            <span className="text-white text-[11px] font-bold tracking-tight">
              {getSchoolInitial(s.name_zh)}
            </span>
          </div>
          <span className="text-[9.5px] text-[#6b6b63] font-medium max-w-[52px] text-center leading-tight">
            {s.name_zh}
          </span>
        </Link>
      ))}
    </div>
  )
}
