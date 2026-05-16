import Link from "next/link";
import { MapPin, Clock, BookOpen, ChevronRight, Star } from "lucide-react";
import { getSchoolGradient, getSchoolInitial, resolveSchoolDisplayName } from "@/lib/utils";
import type { Program } from "@/lib/supabase/types";

export function UniversityCard({ program }: { program: Program }) {
  const school = program.schools
  const admission = Array.isArray(program.program_admissions) ? program.program_admissions[0] : program.program_admissions
  const fee = Array.isArray(program.program_fees) ? program.program_fees[0] : program.program_fees

  const schoolDisplayName = resolveSchoolDisplayName(school)

  const gradient = school ? getSchoolGradient(schoolDisplayName) : 'from-gray-400 to-gray-600'
  const initial = school ? getSchoolInitial(schoolDisplayName) : '?'

  const cityDisplay = school?.city === 'Various' ? '' : (school?.city ?? '')
  const countryDisplay = school?.country === 'Various' ? '英国' : (school?.country ?? '')
  const tuition = fee?.international_tuition_fee
    ? `£${Math.round(Number(fee.international_tuition_fee) / 1000)}k/年`
    : '面议'

  const ielts = admission?.ielts_overall ? `${admission.ielts_overall}` : '---'
  const deadline = admission?.regular_deadline
    ? admission.regular_deadline.slice(5)
    : '滚动'

  return (
    <Link href={`/explore/${program.id}`}>
      {/* Pinterest: 22px radius, warm border, minimal shadow, press feedback */}
      <article className="mx-4 mb-3 bg-white rounded-[22px] border border-[#eeece8] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden active:scale-[0.985] transition-transform">
        <div className="flex items-center gap-3 p-3.5">
          {/* School avatar — generous radius */}
          <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <span className="text-white text-[10px] font-bold text-center leading-tight">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[13.5px] font-semibold text-[#1e1e1a] truncate tracking-tight">{schoolDisplayName}</h3>
              {school?.qs_art_rank && (
                <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] text-[#8c6230] bg-[#f5ead8] px-1.5 py-0.5 rounded-full font-semibold border border-[#d4a96a]/30">
                  <Star size={8} />QS #{school.qs_art_rank}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-[#6b6b63] truncate mt-0.5 font-medium">{program.program_name}</p>
            {school && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-[#9b9b93]" />
                <span className="text-[10px] text-[#9b9b93]">{[cityDisplay, countryDisplay].filter(Boolean).join('，')}</span>
              </div>
            )}
          </div>
          <ChevronRight size={15} className="text-[#c4c4bc] flex-shrink-0" />
        </div>

        {/* Stats bar — warm dividers */}
        <div className="flex items-center border-t border-[#f0ede8] divide-x divide-[#f0ede8]">
          <div className="flex-1 flex flex-col items-center py-2.5">
            <div className="flex items-center gap-1">
              <BookOpen size={11} className="text-[#8c6230]" />
              <span className="text-[10px] font-bold text-[#1e1e1a]">{ielts}</span>
            </div>
            <span className="text-[9px] text-[#9b9b93] mt-0.5 font-medium">IELTS</span>
          </div>
          <div className="flex-1 flex flex-col items-center py-2.5">
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-[#0d7c4b]" />
              <span className="text-[10px] font-bold text-[#1e1e1a] truncate max-w-[60px] text-center">{program.duration_text ?? '---'}</span>
            </div>
            <span className="text-[9px] text-[#9b9b93] mt-0.5 font-medium">学制</span>
          </div>
          <div className="flex-1 flex flex-col items-center py-2.5">
            <span className="text-[10px] font-bold text-[#1e1e1a]">{tuition}</span>
            <span className="text-[9px] text-[#9b9b93] mt-0.5 font-medium">国际学费</span>
          </div>
          <div className="flex-1 flex flex-col items-center py-2.5">
            <span className={`text-[10px] font-bold ${deadline === '滚动' ? 'text-[#4a7c59]' : 'text-[#8c6230]'}`}>
              {deadline}
            </span>
            <span className="text-[9px] text-[#9b9b93] mt-0.5 font-medium">截止日期</span>
          </div>
        </div>

        {/* Tag pills — warm style */}
        {(program.requires_interview || program.requires_portfolio || admission?.reference_count || program.degree_type) && (
          <div className="flex items-center gap-1.5 px-3.5 pb-3 pt-2 flex-wrap">
            {program.requires_interview && (
              <span className="text-[9.5px] bg-[#f5ead8] text-[#8c6230] border border-[#d4a96a]/25 px-2 py-0.5 rounded-full font-medium">需要面试</span>
            )}
            {program.requires_portfolio && (
              <span className="text-[9.5px] bg-[#eef0eb] text-[#4a5c3e] border border-[#6b7c5e]/20 px-2 py-0.5 rounded-full font-medium">需作品集</span>
            )}
            {admission?.reference_count && (
              <span className="text-[9.5px] bg-[#e8e4dc] text-[#6b6b63] border border-[#d4d0ca] px-2 py-0.5 rounded-full font-medium">
                推荐信 ×{admission.reference_count}
              </span>
            )}
            {program.degree_type && (
              <span className="text-[9.5px] bg-[#f0ece6] text-[#5c3f20] border border-[#c8a882]/30 px-2 py-0.5 rounded-full font-medium">
                {program.degree_type}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
