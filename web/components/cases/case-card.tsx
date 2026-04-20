import Link from "next/link";
import { getSchoolInitial, resultLabel } from "@/lib/utils";
import type { Case } from "@/lib/supabase/types";

export function CaseCard({ c }: { c: Case }) {
  const hasImage = !!c.cover_image_url;
  const gradient = c.cover_gradient ?? 'from-blue-500 to-indigo-600';
  const schoolInitial = getSchoolInitial(c.target_school || '综合');
  const displayName = c.is_anonymous ? '匿名' : (c.user_profiles?.nickname ?? '用户');

  return (
    <Link href={`/cases/${c.id}`} className="group cursor-pointer block">
      <article className="bg-al-silver/40 rounded-2xl overflow-hidden hover:bg-al-silver/60 transition-all border border-transparent hover:border-al-cobalt/15">
        {/* Visual area - 4:3 for better proportions with text below */}
        <div className="aspect-[4/3] relative overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.cover_image_url!}
              alt={c.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} aria-hidden />
          )}
          
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />

          {/* Result badge - top left, no emoji */}
          <div className="absolute top-4 left-4">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
              c.result === 'admitted' ? 'bg-green-100 text-green-700' :
              c.result === 'waitlisted' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-600'
            }`}>
              {c.result === 'admitted' ? '录取' : c.result === 'waitlisted' ? '等候' : '已拒绝'}
            </span>
          </div>

          {/* Large centered school initial */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-white/90 drop-shadow-lg tracking-tight">
              {schoolInitial}
            </span>
          </div>

          {/* School name - bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full truncate block text-center">
              {c.target_school || '综合院校'}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="p-5">
          <h3 className="text-base sm:text-lg font-bold text-al-ink leading-snug line-clamp-2 mb-3 group-hover:text-al-cobalt transition-colors">
            {c.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-al-ink/55">
              {displayName}
            </span>
            <span className="text-al-ink/35 text-xs bg-al-silver/50 px-2 py-0.5 rounded">
              {c.gpa || 'GPA 未公开'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
