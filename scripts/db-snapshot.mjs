/**
 * One-off: aggregate Supabase public table stats using anon key from web/.env.local
 * Run: node scripts/db-snapshot.mjs (from artsee repo root)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../web/.env.local')
const raw = readFileSync(envPath, 'utf8')
const env = {}
for (const line of raw.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error(JSON.stringify({ error: 'missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY in web/.env.local' }))
  process.exit(1)
}

const supabase = createClient(url, key)

async function countRows(table, filter = {}) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  for (const [k, v] of Object.entries(filter)) {
    q = q.eq(k, v)
  }
  const { count, error } = await q
  return { count: error ? null : count, error: error?.message ?? null }
}

async function main() {
  const out = { generatedAt: new Date().toISOString(), tables: {}, notes: [] }

  const tables = [
    'schools',
    'programs',
    'program_admissions',
    'program_fees',
    'cases',
    'posts',
    'post_replies',
    'likes',
    'user_profiles',
    'user_favorites',
    'application_tracker',
  ]

  for (const t of tables) {
    const { count, error } = await countRows(t)
    out.tables[t] = { total: count, error }
    if (error) out.notes.push(`count ${t}: ${error}`)
  }

  const activePrograms = await countRows('programs', { status: 'active' })
  out.tables.programs_active = activePrograms

  const { data: schoolsSample, error: schoolsErr } = await supabase
    .from('schools')
    .select('id, name_zh, name_en, country, city, status')
    .order('id')

  if (schoolsErr) {
    out.notes.push(`schools select: ${schoolsErr.message}`)
  } else {
    out.schoolsTotal = schoolsSample?.length ?? 0
    const byZh = {}
    for (const s of schoolsSample ?? []) {
      const k = s.name_zh ?? '(null)'
      byZh[k] = (byZh[k] || 0) + 1
    }
    out.schoolsNameZhDistribution = byZh
  }

  const { data: programsJoin, error: pjErr } = await supabase
    .from('programs')
    .select('id, school_id, status, schools(id, name_zh, name_en)')
    .eq('status', 'active')

  if (pjErr) {
    out.notes.push(`programs+schools join: ${pjErr.message}`)
  } else {
    const list = programsJoin ?? []
    out.programsActiveCount = list.length
    const bySchoolId = {}
    let placeholderPrograms = 0
    const PLACEHOLDER_ZH = '综合艺术院校'
    for (const p of list) {
      const sid = p.school_id
      bySchoolId[sid] = (bySchoolId[sid] || 0) + 1
      const sch = p.schools
      const zh = sch?.name_zh
      const en = sch?.name_en
      const enBad = !en?.trim() || /^comprehensive art schools$/i.test(en.trim())
      if (zh === PLACEHOLDER_ZH && enBad) placeholderPrograms++
    }
    out.programsLinkedToPlaceholderSchool = placeholderPrograms
    out.topSchoolIdsByProgramCount = Object.entries(bySchoolId)
      .map(([id, n]) => ({ school_id: Number(id), program_count: n }))
      .sort((a, b) => b.program_count - a.program_count)
      .slice(0, 15)
  }

  console.log(JSON.stringify(out, null, 2))
}

main().catch((e) => {
  console.error(JSON.stringify({ error: String(e) }))
  process.exit(1)
})
