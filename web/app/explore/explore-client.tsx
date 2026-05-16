'use client'

import { useState, useMemo, useEffect } from 'react'
import { FilterChips } from '@/components/explore/filter-chips'
import { UniversityCard } from '@/components/explore/university-card'
import { Search } from 'lucide-react'
import type { Program } from '@/lib/supabase/types'

function matchesDegree(programDegree: string | null | undefined, selected: string) {
  if (selected === '全部') return true
  const degree = programDegree?.toLowerCase() ?? ''
  if (/^phd$/i.test(selected)) return degree.startsWith('d') || degree.includes('phd')
  return degree.startsWith(selected[0].toLowerCase())
}

export function ExploreClient({ programs, initialSchool }: { programs: Program[], initialSchool?: string }) {
  const [search, setSearch] = useState(initialSchool ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(initialSchool ?? '')
  const [degree, setDegree] = useState('全部')
  const [major, setMajor] = useState('全部')
  const [ielts, setIelts] = useState('全部')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filtered = useMemo(() => {
    return programs.filter(p => {
      if (!matchesDegree(p.degree_type, degree)) return false
      if (major !== '全部' && !p.program_name.toLowerCase().includes(major.toLowerCase())) return false
      if (ielts !== '全部') {
        const min = parseFloat(ielts)
        const req = p.program_admissions?.[0]?.ielts_overall
        if (!req || req < min) return false
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const matchSchool = p.schools?.name_zh?.toLowerCase().includes(q) || p.schools?.name_en?.toLowerCase().includes(q)
        const matchProgram = p.program_name.toLowerCase().includes(q)
        if (!matchSchool && !matchProgram) return false
      }
      return true
    })
  }, [programs, degree, major, ielts, debouncedSearch])

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 bg-[#f0ede8] rounded-[16px] px-3.5 py-2.5 border border-[#e4e0da]">
          <Search size={15} className="text-[#9b9b93] flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索院校、专业..."
            className="flex-1 bg-transparent text-[13px] text-[#1e1e1a] placeholder-[#9b9b93] font-medium outline-none"
          />
        </div>
      </div>

      <FilterChips onFilter={(d, m, i) => { setDegree(d); setMajor(m); setIelts(i) }} />

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-gray-500">共 {filtered.length} 个项目</span>
      </div>

      {filtered.map(p => <UniversityCard key={p.id} program={p} />)}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          <p className="text-2xl mb-2">🔍</p>
          <p>没有找到匹配的专业</p>
          <p className="text-xs mt-1">试试清除筛选条件</p>
        </div>
      )}
    </div>
  )
}
