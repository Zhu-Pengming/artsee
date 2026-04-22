/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Home, 
  Compass, 
  Handshake, 
  GraduationCap, 
  User, 
  Plus, 
  ArrowRight,
  MapPin,
  Verified,
  Share2,
  ChevronRight,
  MoreHorizontal,
  Heart,
  Eye,
  MessageSquare,
  ArrowUpRight,
  PlayCircle,
  FileText,
  Calendar,
  Layers,
  Globe,
  Briefcase,
  Award,
  BookOpen,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/// --- Types ---
type Tab = 'home' | 'discover' | 'collab' | 'learn' | 'profile';
type DiscoverSubTab = 'following' | 'recommended' | 'qa';
type CollabSubTab = 'plaza' | 'artists' | 'exhibitions' | 'projects';
type LearnSubTab = 'courses' | 'tools' | 'schools';

// --- Components ---

const Header = () => (
  <header className="fixed top-0 left-0 right-0 h-20 bg-porcelain/80 backdrop-blur-xl z-50 border-b border-silver/20 px-6">
    <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-cobalt rounded-xl flex items-center justify-center text-porcelain font-serif font-bold text-xl">艺</div>
        <h1 className="text-xl font-serif font-bold text-ink tracking-tighter hidden sm:block">Artiqore 艺衡</h1>
      </div>
      
      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-cobalt transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="搜索艺术家、作品、机构、课程..." 
          className="w-full bg-silver/30 border-none rounded-full py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-cobalt/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-ink/60 hover:text-cobalt cursor-pointer transition-colors">
          <MapPin size={18} />
          <span className="text-xs font-bold">上海</span>
        </div>
        <button className="relative text-ink/60 hover:text-cobalt transition-colors">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-porcelain"></span>
        </button>
      </div>
    </div>
  </header>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) => (
  <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink/90 backdrop-blur-2xl px-4 py-3 rounded-full border border-porcelain/10 shadow-2xl z-50 flex items-center gap-2">
    {[
      { id: 'home', label: '首页', icon: Home },
      { id: 'discover', label: '发现', icon: Compass },
      { id: 'collab', label: '合作', icon: Handshake },
      { id: 'learn', label: '学习', icon: GraduationCap },
      { id: 'profile', label: '我的', icon: User },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id as Tab)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-500 group ${
          activeTab === item.id 
            ? 'bg-porcelain text-ink shadow-lg' 
            : 'text-porcelain/40 hover:text-porcelain/70'
        }`}
      >
        <item.icon size={20} className={activeTab === item.id ? 'text-cobalt' : ''} />
        {activeTab === item.id && (
          <span className="text-xs font-bold tracking-wider">{item.label}</span>
        )}
      </button>
    ))}
  </nav>
);

// --- View Components ---

const HomeView = () => (
  <div className="space-y-12 pb-10">
    {/* Banner */}
    <section className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl group">
      <img 
        src="https://images.unsplash.com/photo-1561214166-07dc26903ce7?auto=format&fit=crop&q=80&w=2000" 
        alt="Banner" 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent flex flex-col justify-end p-8 md:p-12">
        <span className="text-porcelain/60 text-[10px] font-bold tracking-[0.4em] mb-3 uppercase">重磅展览</span>
        <h2 className="text-porcelain text-3xl md:text-5xl font-serif font-bold mb-6 max-w-2xl leading-tight">感官之维：当代艺术联展</h2>
        <div className="flex items-center gap-6">
          <button className="bg-porcelain text-cobalt px-8 py-3 rounded-full text-sm font-bold hover:bg-cobalt hover:text-porcelain transition-all duration-300">
            立即观展
          </button>
        </div>
      </div>
    </section>

    {/* Quick Access Grid (8 icons) */}
    <section className="grid grid-cols-4 md:grid-cols-8 gap-6">
      {[
        { name: '艺术家库', icon: Users },
        { name: '机构入驻', icon: Globe },
        { name: '展览报名', icon: Calendar },
        { name: '联名合作', icon: Handshake },
        { name: '作品集指导', icon: FileText },
        { name: '国际资讯', icon: Eye },
        { name: '艺术问答', icon: MessageSquare },
        { name: '线下活动', icon: MapPin },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-3 cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-silver/30 flex items-center justify-center text-ink/60 group-hover:bg-cobalt group-hover:text-porcelain transition-all duration-500 shadow-sm">
            <item.icon size={22} />
          </div>
          <span className="text-[11px] font-bold text-ink/80 tracking-tight text-center">{item.name}</span>
        </div>
      ))}
    </section>

    {/* Content Flow */}
    <section className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-serif font-bold text-ink">推荐内容</h3>
          <p className="text-ink/40 text-[10px] tracking-widest uppercase mt-1">Curated For You</p>
        </div>
        <button className="text-cobalt text-xs font-bold flex items-center gap-1 hover:opacity-70 transition-opacity">
          查看全部 <ArrowRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: '顶奢酒店联名招募：空间重塑计划', tag: '联名项目', img: 'https://picsum.photos/seed/art1/800/450' },
          { title: '国际艺术资讯：威尼斯双年展前瞻', tag: '国际资讯', img: 'https://picsum.photos/seed/art2/800/450' },
        ].map((item, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-silver/20 mb-4 relative">
              <img src={item.img} alt="Art" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 bg-porcelain/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-cobalt">
                {item.tag}
              </div>
            </div>
            <h4 className="text-xl font-serif font-bold text-ink group-hover:text-cobalt transition-colors">{item.title}</h4>
          </div>
        ))}
      </div>
    </section>

    {/* Platform Announcements */}
    <section className="bg-silver/10 p-8 rounded-3xl border border-silver/20">
      <div className="flex items-center gap-3 mb-6 text-ink/40">
        <Bell size={18} />
        <h4 className="text-xs font-bold uppercase tracking-widest">平台公告</h4>
      </div>
      <div className="space-y-4">
        {['艺术市场规则 (2024修订版)', '版权声明与创作者权益保护', '品牌入驻合作规范'].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm text-ink/60 hover:text-cobalt cursor-pointer transition-colors group">
            <span>{item}</span>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        ))}
      </div>
    </section>
  </div>
);

const DiscoverView = () => {
  const [subTab, setSubTab] = useState<DiscoverSubTab>('recommended');
  return (
    <div className="space-y-10 pb-10">
      <div className="flex gap-10 border-b border-silver/30 pb-4">
        {[
          { id: 'following', label: '关注' },
          { id: 'recommended', label: '推荐' },
          { id: 'qa', label: '问答' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setSubTab(tab.id as DiscoverSubTab)}
            className={`text-sm font-bold tracking-widest transition-all relative ${
              subTab === tab.id ? 'text-cobalt' : 'text-ink/40 hover:text-ink/60'
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div layoutId="discover-underline" className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-cobalt" />
            )}
          </button>
        ))}
      </div>

      {subTab === 'qa' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {[
              { q: '艺术留学怎么选校？有哪些避坑指南？', a: '128 位艺术家已参与讨论', cat: '留学申请' },
              { q: '如何跟顶奢酒店达成长期艺术合作？', a: '86 位策展人已参与讨论', cat: '市场与商业' },
              { q: '一二级市场规则是什么？艺术家如何定价？', a: '210 位专业人士已参与讨论', cat: '职业发展' },
            ].map((item, i) => (
              <div key={i} className="bg-silver/10 p-8 rounded-2xl hover:bg-silver/20 transition-all cursor-pointer group border border-transparent hover:border-cobalt/10">
                <span className="text-[10px] font-bold text-cobalt/60 bg-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">{item.cat}</span>
                <h4 className="text-xl font-serif font-bold mb-4 group-hover:text-cobalt transition-colors">{item.q}</h4>
                <p className="text-ink/40 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-ink text-porcelain p-8 rounded-3xl">
              <h5 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">问答分类</h5>
              <ul className="space-y-4 text-sm font-medium">
                {['留学申请', '专业学习', '职业发展', '市场与商业', '版权与法律'].map(c => (
                  <li key={c} className="hover:text-cobalt-muted cursor-pointer transition-colors flex justify-between items-center group">
                    <span>{c}</span>
                    <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full py-4 bg-cobalt text-porcelain rounded-full text-sm font-bold shadow-xl shadow-cobalt/20">我要提问</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-silver/20 mb-4 relative">
                <img src={`https://picsum.photos/seed/disc${i}/600/800`} alt="Art" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-porcelain/90 backdrop-blur p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-bold text-ink truncate">作品标题 #{i+1}</p>
                    <p className="text-[8px] text-ink/40 uppercase tracking-widest mt-1">艺术家名称</p>
                  </div>
                </div>
              </div>
              <h5 className="text-sm font-bold text-ink">先锋艺术探索系列</h5>
              <p className="text-[10px] text-ink/40 uppercase tracking-widest mt-1">创作过程 / 技法解析</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CollabView = () => {
  const [subTab, setSubTab] = useState<CollabSubTab>('plaza');
  return (
    <div className="space-y-10 pb-10">
      <div className="flex gap-10 border-b border-silver/30 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'plaza', label: '需求广场' },
          { id: 'artists', label: '艺术家库' },
          { id: 'exhibitions', label: '展览中心' },
          { id: 'projects', label: '联名项目' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setSubTab(tab.id as CollabSubTab)}
            className={`text-sm font-bold tracking-widest transition-all whitespace-nowrap relative ${
              subTab === tab.id ? 'text-cobalt' : 'text-ink/40 hover:text-ink/60'
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div layoutId="collab-underline" className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-cobalt" />
            )}
          </button>
        ))}
      </div>

      {subTab === 'plaza' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { brand: '安缦酒店', type: '展览场地合作', budget: '¥150k - 300k', date: '2024.11.15' },
            { brand: '宝格丽', type: '联名设计', budget: '¥200k - 500k', date: '2024.12.01' },
            { brand: 'UCCA', type: '艺术家代理', budget: '面议', date: '2024.10.30' },
            { brand: '路易威登', type: '礼盒视觉创作', budget: '¥100k - 200k', date: '2024.11.20' },
          ].map((item, i) => (
            <div key={i} className="bg-silver/10 p-8 rounded-3xl border border-silver/20 hover:border-cobalt/30 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">{item.brand}</span>
                <span className="text-[10px] font-bold text-cobalt bg-cobalt/5 px-3 py-1 rounded-full uppercase tracking-widest">{item.type}</span>
              </div>
              <h4 className="text-xl font-serif font-bold mb-10 leading-tight text-ink">高端商业空间美学重塑计划</h4>
              <div className="grid grid-cols-2 gap-6 mb-10 text-xs">
                <div>
                  <p className="text-ink/30 uppercase tracking-tighter mb-1">预算区间</p>
                  <p className="font-bold text-cobalt">{item.budget}</p>
                </div>
                <div>
                  <p className="text-ink/30 uppercase tracking-tighter mb-1">截止日期</p>
                  <p className="font-bold text-ink/80">{item.date}</p>
                </div>
              </div>
              <button className="w-full py-4 bg-ink text-porcelain rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cobalt transition-all shadow-lg">立即申请</button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'artists' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="text-center group cursor-pointer">
              <div className="aspect-square rounded-3xl overflow-hidden bg-silver/20 mb-4 relative shadow-sm">
                <img src={`https://picsum.photos/seed/art${i}/400/400`} alt="Artist" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute bottom-3 right-3 bg-porcelain p-1.5 rounded-full shadow-xl">
                  <Verified size={14} className="text-cobalt" />
                </div>
              </div>
              <h5 className="text-sm font-bold text-ink">艺术家姓名</h5>
              <p className="text-[10px] text-ink/40 uppercase tracking-widest mt-1">纯艺 / 先锋</p>
            </div>
          ))}
        </div>
      )}

      {subTab === 'exhibitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            { title: '感官之维：当代艺术联展', location: '上海 · 艺衡美术馆', date: '2024.11.15 - 2025.01.15', img: 'https://picsum.photos/seed/exh1/1200/600' },
            { title: '数字游牧：新媒体艺术季', location: '北京 · 798艺术区', date: '2024.12.01 - 2025.02.28', img: 'https://picsum.photos/seed/exh2/1200/600' },
          ].map((exh, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[2/1] rounded-3xl overflow-hidden mb-6 relative">
                <img src={exh.img} alt={exh.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-6 right-6 bg-porcelain/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-cobalt uppercase tracking-widest">
                  正在展出
                </div>
              </div>
              <h4 className="text-2xl font-serif font-bold text-ink group-hover:text-cobalt transition-colors mb-2">{exh.title}</h4>
              <div className="flex items-center gap-4 text-ink/40 text-xs">
                <div className="flex items-center gap-1.5"><MapPin size={14} /> {exh.location}</div>
                <div className="flex items-center gap-1.5"><Calendar size={14} /> {exh.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'projects' && (
        <div className="bg-ink text-porcelain p-12 rounded-[3rem] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-bold text-cobalt-muted uppercase tracking-[0.3em] mb-6 block">Co-Branding Projects</span>
            <h3 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">联名项目：<br/>探索商业与艺术的边界</h3>
            <p className="text-porcelain/60 text-lg mb-12 leading-relaxed">我们连接全球顶尖品牌与先锋艺术家，通过空间重塑、产品联名、视觉创作等多种形式，实现艺术价值的商业转化。</p>
            <button className="bg-porcelain text-ink px-10 py-4 rounded-full text-sm font-bold hover:bg-cobalt hover:text-porcelain transition-all shadow-2xl">查看往期案例</button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <img src="https://picsum.photos/seed/collab-bg/800/800" alt="BG" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
          </div>
        </div>
      )}
    </div>
  );
};

const LearnView = () => {
  const [subTab, setSubTab] = useState<LearnSubTab>('courses');
  return (
    <div className="space-y-10 pb-10">
      <div className="flex gap-10 border-b border-silver/30 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'courses', label: '课程中心' },
          { id: 'tools', label: '作品集工具' },
          { id: 'schools', label: '院校与资讯' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setSubTab(tab.id as LearnSubTab)}
            className={`text-sm font-bold tracking-widest transition-all whitespace-nowrap relative ${
              subTab === tab.id ? 'text-cobalt' : 'text-ink/40 hover:text-ink/60'
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div layoutId="learn-underline" className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-cobalt" />
            )}
          </button>
        ))}
      </div>

      {subTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: '作品集辅导：RCA/UAL 申请全攻略', cat: '留学辅导', price: 'Premium' },
            { title: '当代油画技法：从构图到色彩表达', cat: '技法课', price: '¥1,200' },
            { title: '艺术家职业商业课：定价、版权与合同', cat: '职业发展', price: '¥800' },
          ].map((item, i) => (
            <div key={i} className="bg-silver/10 rounded-3xl overflow-hidden border border-silver/20 group cursor-pointer hover:shadow-2xl hover:shadow-silver/20 transition-all">
              <div className="aspect-video bg-silver/30 overflow-hidden relative">
                <img src={`https://picsum.photos/seed/course${i}/800/450`} alt="Course" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-ink/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={48} className="text-porcelain" />
                </div>
              </div>
              <div className="p-8">
                <span className="text-[10px] font-bold text-cobalt/60 bg-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">{item.cat}</span>
                <h4 className="text-xl font-serif font-bold mb-8 leading-tight text-ink">{item.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-cobalt">{item.price}</span>
                  <ArrowRight size={18} className="text-ink/20 group-hover:text-cobalt transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'tools' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['作品上传', '智能排版', '导师点评', '院校匹配', '案例库'].map((tool) => (
            <div key={tool} className="bg-silver/10 p-8 rounded-3xl text-center hover:bg-silver/20 transition-all cursor-pointer group border border-transparent hover:border-cobalt/10">
              <div className="w-14 h-14 rounded-full bg-porcelain flex items-center justify-center mx-auto mb-4 text-ink/40 group-hover:text-cobalt transition-all group-hover:scale-110 shadow-sm">
                <Plus size={28} />
              </div>
              <span className="text-sm font-bold text-ink/80">{tool}</span>
            </div>
          ))}
        </div>
      )}

      {subTab === 'schools' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Royal College of Art', location: 'London, UK', rank: '#1 Art & Design', img: 'https://picsum.photos/seed/rca/800/400' },
              { name: 'University of the Arts London', location: 'London, UK', rank: '#2 Art & Design', img: 'https://picsum.photos/seed/ual/800/400' },
            ].map((school, i) => (
              <div key={i} className="group cursor-pointer relative overflow-hidden rounded-3xl aspect-[2/1]">
                <img src={school.img} alt={school.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-8 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-cobalt-muted uppercase tracking-widest mb-2">{school.rank}</span>
                  <h4 className="text-2xl font-serif font-bold text-porcelain mb-1">{school.name}</h4>
                  <p className="text-porcelain/60 text-xs">{school.location}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-silver/10 p-10 rounded-3xl border border-silver/20">
            <h5 className="text-sm font-bold uppercase tracking-widest mb-8 text-ink/40">全球艺术资讯</h5>
            <div className="space-y-6">
              {[
                '2025年秋季入学申请截止日期汇总',
                '作品集准备：如何展现你的批判性思维',
                '艺术生就业前景报告：数字媒体与跨学科趋势',
              ].map((news, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-silver/30 pb-6 last:border-0 last:pb-0">
                  <span className="text-lg font-serif font-bold text-ink/80 group-hover:text-cobalt transition-colors">{news}</span>
                  <ArrowUpRight size={20} className="text-ink/20 group-hover:text-cobalt transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileView = () => (
  <div className="max-w-4xl mx-auto space-y-16 pb-10">
    <div className="flex flex-col md:flex-row items-center gap-12">
      <div className="relative">
        <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden bg-silver/20 border-4 border-porcelain shadow-2xl">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" alt="Profile" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute -bottom-4 -right-4 bg-cobalt text-porcelain p-4 rounded-3xl shadow-2xl">
          <Verified size={28} />
        </div>
      </div>
      <div className="text-center md:text-left">
        <h2 className="text-5xl font-serif font-bold text-ink mb-3">陈墨翰</h2>
        <p className="text-ink/40 font-medium mb-8 text-lg">认证艺术家 · 当代数字艺术 / 策展人</p>
        <div className="flex gap-4 justify-center md:justify-start">
          <button className="bg-cobalt text-porcelain px-10 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-cobalt/20">编辑资料</button>
          <button className="bg-silver/30 text-ink/60 p-3.5 rounded-full hover:bg-silver/50 transition-all"><Share2 size={22} /></button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-ink text-porcelain p-10 rounded-[2rem] shadow-2xl">
        <h5 className="text-xs font-bold uppercase tracking-widest mb-8 opacity-60">数据看板 (Exposure)</h5>
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="text-3xl font-serif font-bold text-cobalt-muted">48.2k</p>
            <p className="text-[10px] uppercase tracking-widest mt-2 opacity-40">累计曝光</p>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-cobalt-muted">12</p>
            <p className="text-[10px] uppercase tracking-widest mt-2 opacity-40">活跃邀约</p>
          </div>
        </div>
      </div>
      <div className="bg-silver/10 p-10 rounded-[2rem] flex flex-col justify-between border border-silver/20">
        <h5 className="text-xs font-bold uppercase tracking-widest mb-8 text-ink/40">我的钱包 (Wallet)</h5>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-4xl font-serif font-bold text-ink">¥12,400</p>
            <p className="text-[10px] uppercase tracking-widest mt-2 text-ink/30">待结算收益</p>
          </div>
          <button className="text-xs font-bold text-cobalt underline underline-offset-4">提现</button>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {[
        { label: '作品管理', icon: Layers },
        { label: '合作邀约管理', icon: Briefcase },
        { label: '展览报名记录', icon: Calendar },
        { label: '版权备案', icon: Award },
        { label: '认证中心', icon: Verified },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center p-8 bg-silver/10 rounded-3xl hover:bg-silver/20 transition-all cursor-pointer group border border-transparent hover:border-cobalt/10">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-porcelain flex items-center justify-center text-ink/30 group-hover:text-cobalt transition-colors shadow-sm">
              <item.icon size={20} />
            </div>
            <span className="font-bold text-ink/80 group-hover:text-ink transition-colors">{item.label}</span>
          </div>
          <ChevronRight size={20} className="text-ink/20 group-hover:text-cobalt transition-all group-hover:translate-x-1" />
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-porcelain selection:bg-cobalt/10 selection:text-cobalt">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'discover' && <DiscoverView />}
            {activeTab === 'collab' && <CollabView />}
            {activeTab === 'learn' && <LearnView />}
            {activeTab === 'profile' && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Floating Action Button - Contextual */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-8 bottom-28 w-14 h-14 bg-cobalt text-porcelain rounded-full shadow-2xl shadow-cobalt/40 flex items-center justify-center z-40"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
}
