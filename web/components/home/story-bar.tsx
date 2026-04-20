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
    <div className="flex gap-3 sm:gap-4 py-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {items.map((s) => (
        <Link
          key={s.id}
          href={`/explore?school=${encodeURIComponent(s.name_zh)}`}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
        >
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${getSchoolGradient(s.name_zh)} flex items-center justify-center ring-2 ring-al-cobalt/35 ring-offset-2 ring-offset-al-shell group-hover:ring-al-cobalt/55 transition-all`}
          >
            <span className="text-al-shell text-xs font-bold">{getSchoolInitial(s.name_zh)}</span>
          </div>
          <span className="text-[10px] text-al-ink/60 max-w-[56px] sm:max-w-[64px] text-center leading-tight group-hover:text-al-cobalt transition-colors">
            {s.name_zh}
          </span>
        </Link>
      ))}
    </div>
  )
}
