import Link from "next/link";
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2 } from "lucide-react";

const exhibitions = [
  { title: "解构青花：数字维度的传统重塑", img: "https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=800" },
  { title: "媒介考古：模拟时代的感官记忆", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800" },
  { title: "光影变迁：叙事性空间的数字边界", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800" },
  { title: "赛博禅意：机械冥想与算法秩序", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" },
  { title: "无尽之维：数学拓扑的视觉实验", img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800" },
];

const posts = [
  {
    id: "p1",
    author: "Celina",
    type: "RCA Service Design",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=900",
    content: "把陶瓷裂纹转换成空间动线后，作品集叙事突然有了更清晰的时间结构。",
    likes: 248,
    comments: 36,
    time: "2 hours ago",
  },
  {
    id: "p2",
    author: "Ming",
    type: "UAL CSM",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=900",
    content: "今天重排了 personal statement，核心不是堆经历，而是把方法论说成自己的语言。",
    likes: 192,
    comments: 18,
    time: "5 hours ago",
  },
  {
    id: "p3",
    author: "Yue",
    type: "Goldsmiths Fine Art",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&q=80&w=900",
    content: "导师说 portfolio 需要留白，我终于明白留白不是少做，而是让观看者进入。",
    likes: 310,
    comments: 42,
    time: "1 day ago",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-28 lg:pb-12 space-y-12 text-[#171717]">
      <section className="relative aspect-[21/9] md:aspect-[25/9] min-h-[360px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000"
          alt="青花陶瓷艺术展"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 group-hover:brightness-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/90 via-[#171717]/20 to-transparent flex flex-col justify-end p-8 md:p-20 font-serif">
          <span className="text-[#1A4B8C] bg-white/85 w-fit px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.35em] mb-5 uppercase">
            Special / 陶瓷重构专场
          </span>
          <h2 className="text-white text-5xl md:text-[7rem] font-light leading-[0.86] tracking-tight mb-10 max-w-4xl italic">
            灵感碎片的万合：<br />
            <span className="text-white/45">青花新境</span>
          </h2>
          <Link
            href="/discover"
            className="bg-white text-[#171717] w-fit px-10 md:px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#1A4B8C] hover:text-white transition-all duration-500 shadow-2xl"
          >
            立即观展 (Virtual Access)
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#171717] italic">热门展厅 (Discovery)</h3>
            <p className="text-[#171717]/40 text-[10px] tracking-[0.34em] uppercase mt-1">
              Virtual Exhibition Halls / Exploring Multi-dimensions
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button className="p-2 rounded-full border border-[#d8d3ca] text-[#171717]/40 hover:bg-[#171717] hover:text-white transition-all shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 rounded-full border border-[#d8d3ca] text-[#171717]/40 hover:bg-[#171717] hover:text-white transition-all shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
          {exhibitions.map((item) => (
            <Link
              href="/discover"
              key={item.title}
              className="min-w-[300px] aspect-[16/10] bg-white rounded-[2rem] overflow-hidden shadow-md cursor-pointer relative group shrink-0"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-transparent to-transparent flex flex-col justify-end p-6 font-serif">
                <h4 className="text-white font-bold text-lg italic whitespace-nowrap overflow-hidden text-ellipsis border-b border-white/20 pb-2 inline-block w-fit max-w-full">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A4B8C]" />
                  <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Live Now</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24 px-8 md:px-20 bg-white rounded-[4rem] border border-[#d8d3ca]/50 shadow-2xl shadow-[#d8d3ca]/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#1A4B8C]/5 blur-[120px] -mr-32" />
        <div className="relative flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <div className="flex-1 space-y-9">
            <div className="flex items-center gap-4 text-[#1A4B8C]">
              <div className="w-12 h-px bg-[#1A4B8C]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] italic">artiqore Academy Directory</span>
            </div>
            <h3 className="text-5xl md:text-7xl font-serif font-light text-[#171717] italic leading-[1.1] tracking-tight">
              全球顶级<br />艺术院校指南
            </h3>
            <p className="text-lg md:text-xl text-[#171717]/45 font-light leading-relaxed max-w-xl">
              汇集全球核心艺术产区，精选影响世界的创意摇篮。从申请门槛到未来趋势，开启您的全球艺术学府探索之旅。
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link
                href="/explore"
                className="h-16 md:h-20 px-10 md:px-16 bg-[#1A4B8C] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.35em] hover:bg-[#171717] transition-all shadow-2xl shadow-[#1A4B8C]/20 active:scale-95 flex items-center justify-center"
              >
                立即探索 (Explore)
              </Link>
              <div className="flex items-center gap-4 text-[#171717]/25 font-serif italic text-sm py-4">
                <span>#QS_Top_Ranking</span>
                <span>/</span>
                <span>#Design_Excellence</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl relative">
            <div className="grid grid-cols-2 gap-6 rotate-[-2deg] group-hover:rotate-0 transition-all duration-1000">
              {["college1", "college2", "college3", "college4"].map((seed, index) => (
                <div
                  key={seed}
                  className={`${index === 0 ? "pt-12" : ""} ${index === 2 ? "-translate-x-8" : ""}`}
                >
                  <div className={`${index % 2 === 0 ? "aspect-[3/4]" : "aspect-square"} rounded-3xl overflow-hidden shadow-2xl border-4 border-white grayscale group-hover:grayscale-0 transition-all`}>
                    <img
                      src={`https://picsum.photos/seed/${seed}/700/900`}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 md:w-44 h-40 md:h-44 bg-white rounded-full flex flex-col items-center justify-center p-6 text-center shadow-2xl border border-[#d8d3ca]/50">
              <span className="text-[9px] font-bold text-[#1A4B8C] uppercase tracking-[0.3em]">Directory</span>
              <span className="text-4xl font-serif italic text-[#171717]">70+</span>
              <span className="text-[9px] font-bold text-[#171717]/25 uppercase tracking-[0.2em] mt-1">Institutions</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex justify-between items-end border-b border-[#d8d3ca] pb-8">
          <div>
            <h3 className="text-4xl font-serif font-light italic">推荐灵感</h3>
            <p className="text-[#171717]/30 text-[10px] tracking-[0.34em] uppercase mt-2">
              Personalized Design Perspectives
            </p>
          </div>
          <Link href="/forum" className="text-[#1A4B8C] text-[10px] font-bold flex items-center gap-2 hover:opacity-70 transition-all uppercase tracking-widest group">
            查看更多 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={post.avatar}
                    className="w-12 h-12 rounded-2xl object-cover border border-white shadow-sm"
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] tracking-tight">{post.author}</h3>
                    <p className="text-[9px] text-[#171717]/40 font-bold uppercase tracking-widest mt-0.5">{post.type}</p>
                  </div>
                </div>
                <button className="text-[#d8d3ca] hover:text-[#1A4B8C] transition-colors p-2 hover:bg-[#d8d3ca]/20 rounded-xl">
                  <Bookmark size={18} />
                </button>
              </div>
              <Link href="/forum" className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 relative cursor-pointer shadow-sm group-hover:shadow-2xl transition-all duration-700 block">
                <img
                  src={post.image}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  alt=""
                />
                <div className="absolute inset-0 bg-[#171717]/10 group-hover:bg-transparent transition-colors" />
              </Link>
              <div className="space-y-4">
                <p className="text-[15px] text-[#171717]/80 leading-relaxed font-light line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#d8d3ca]/60">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-[#171717]/40">
                      <Heart size={16} />
                      <span className="text-[10px] font-bold">{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#171717]/40">
                      <MessageCircle size={16} />
                      <span className="text-[10px] font-bold">{post.comments}</span>
                    </span>
                    <Share2 size={16} className="text-[#171717]/40" />
                  </div>
                  <span className="text-[10px] text-[#171717]/25 font-medium uppercase tracking-widest">{post.time}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
