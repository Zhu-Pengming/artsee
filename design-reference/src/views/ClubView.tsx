import React from 'react';
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, Star, Trophy, Target, Tent, Music, Camera, Heart, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'hot', label: '热门', icon: <Star size={14} />, image: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&q=80&w=1200' },
  { id: 'competition', label: '比赛', icon: <Trophy size={14} />, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200' },
  { id: 'outdoor', label: '户外', icon: <Tent size={14} />, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200' },
  { id: 'archery', label: '攻防箭', icon: <Target size={14} />, image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=1200' },
  { id: 'music', label: 'Live现场', icon: <Music size={14} />, image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200' },
  { id: 'photo', label: '旅拍', icon: <Camera size={14} />, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200' },
];

const CLUBS = [
  {
    id: 1,
    title: '4.25 | W酒店顶级艺术沙龙计划',
    clubName: 'artiqore 精英会',
    clubLogo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
    participants: 1242,
    status: '报名中',
    date: '周五 04.25 19:00',
    distance: '1.2km',
    location: 'W酒店 · 顶层酒廊',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800',
    ],
    joinedCount: 31,
    tags: ['#高层社交', '#艺术鉴赏'],
    price: '¥299'
  },
  {
    id: 2,
    title: '私藏庄园：在成都龙泉邀10位陌生人来我家吃融合',
    clubName: '显化盲盒家宴',
    clubLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
    participants: 90,
    status: '火热开启',
    date: '周六 04.26 18:30',
    distance: '8.5km',
    location: '锦绣云境 · 秘境庄园',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
    ],
    joinedCount: 10,
    maxJoined: 10,
    tags: ['#私域社交', '#定制晚宴'],
    price: '¥128'
  },
  {
    id: 3,
    title: '【攻防箭】春日午后！打着艺术名号的运动社交',
    clubName: '趁热打铁 · 潮流社群',
    clubLogo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    participants: 3445,
    status: '立即预约',
    date: '周日 04.27 15:00',
    distance: '4.2km',
    location: '星光艺术公园',
    images: [
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
    ],
    joinedCount: 25,
    tags: ['#户外派对', '#运动美学'],
    price: '¥98'
  },
  {
    id: 4,
    title: '剧院魅影：深夜美术馆沉浸式戏剧之夜',
    clubName: '不眠之眼 · 戏剧社',
    clubLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    participants: 560,
    status: '仅剩2席',
    date: '下周五 05.02 21:00',
    distance: '2.8km',
    location: '麓湖·艺展中心',
    images: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800',
    ],
    joinedCount: 48,
    tags: ['#沉浸式', '#深夜艺术'],
    price: '¥488'
  },
  {
    id: 5,
    title: '海边落日：大湾区绝美旅拍企划',
    clubName: '摄影家协会',
    clubLogo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    participants: 890,
    status: '火热组队',
    date: '周六 05.03 16:00',
    distance: '12.5km',
    location: '深圳 · 官湖村',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    ],
    joinedCount: 12,
    tags: ['#旅拍', '#日落浪漫'],
    price: '¥599'
  }
];

export const ClubView = ({ onSalonClick, onCategoryClick }: { onSalonClick: (event: any) => void, onCategoryClick: (cat: any) => void }) => {
  return (
    <div className="flex flex-col space-y-6 pb-24">
      {/* Search & Location */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-ink shrink-0">
          <span className="text-sm font-bold">广州</span>
          <motion.div animate={{ rotate: 180 }}>
            <MapPin size={14} className="text-cobalt" />
          </motion.div>
        </div>
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-cobalt transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="搜索俱乐部、活动..." 
            className="w-full bg-white border border-silver/50 rounded-2xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cobalt/20 focus:border-cobalt/30 transition-all outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => onCategoryClick(cat)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-silver/30 text-xs font-bold text-ink/60 whitespace-nowrap hover:border-cobalt/30 hover:text-cobalt hover:shadow-lg transition-all"
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
        <button className="flex items-center justify-center w-8 h-8 bg-white rounded-full border border-silver/30 text-ink/40">
          <Plus size={14} />
        </button>
      </div>

      {/* Featured Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/6] shadow-xl group cursor-pointer">
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
          alt="Banner" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent p-8 flex flex-col justify-center">
          <span className="text-white/60 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">Editor's Pick</span>
          <h2 className="text-white text-2xl font-serif font-bold italic max-w-xs leading-tight">旅拍伙伴计划：<br/>在星级酒店开启艺术之旅</h2>
          <button className="mt-4 w-fit px-6 py-2 bg-white text-ink text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-cobalt hover:text-white transition-colors">
            立即查看
          </button>
        </div>
      </div>

      {/* Club List */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-ink italic">优质专场活动</h3>
          <button className="text-[10px] font-bold text-cobalt uppercase tracking-widest">查看全部</button>
        </div>

        {/* Venues Scroller */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
          {[
            { name: 'W Hotel', title: 'W酒店顶级艺术沙龙计划', location: '广州·珠江新城', img: 'https://picsum.photos/seed/hotel-w/600/300', clubName: 'artiqore 精英会', price: '¥299', date: '周五 04.25 19:00' },
            { name: 'Four Seasons', title: '四季酒店：云端艺术私享会', location: '广州·IFC', img: 'https://picsum.photos/seed/hotel-4s/600/300', clubName: '四季雅集', price: '¥199', date: '周六 04.26 15:00' },
            { name: 'Rosewood', title: '瑰丽酒店：秘境艺术之夜', location: '广州·周大福中心', img: 'https://picsum.photos/seed/hotel-rw/600/300', clubName: '瑰丽沙龙', price: '¥399', date: '周日 04.27 20:00' },
            { name: 'Mandarin Oriental', title: '文华东方：东方韵律研讨', location: '广州·太古汇', img: 'https://picsum.photos/seed/hotel-mo/600/300', clubName: '文华书院', price: '¥258', date: '下周一 04.28 14:00' },
          ].map((venue, i) => (
            <div 
              key={i} 
              onClick={() => onSalonClick({ 
                title: venue.title, 
                location: venue.location, 
                date: venue.date, 
                price: venue.price, 
                clubName: venue.clubName,
                images: [venue.img] 
              })}
              className="min-w-[200px] bg-white rounded-3xl border border-silver/20 overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img src={venue.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={venue.name} referrerPolicy="no-referrer" />
              </div>
              <div className="p-4">
                <h5 className="text-xs font-bold text-ink">{venue.name}</h5>
                <p className="text-[9px] text-ink/30 font-bold uppercase mt-1">{venue.location}</p>
              </div>
            </div>
          ))}
        </div>

        {CLUBS.map(item => (
          <div 
            key={item.id} 
            onClick={() => onSalonClick({
              title: item.title,
              location: item.location,
              date: item.date,
              price: item.price,
              clubName: item.clubName,
              images: item.images
            })}
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-silver/30 hover:shadow-xl transition-all group cursor-pointer"
          >
            {/* Header: Title */}
            <h4 className="text-xl font-bold text-ink mb-4 group-hover:text-cobalt transition-colors">{item.title}</h4>
            
            {/* Club Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={item.clubLogo} alt={item.clubName} className="w-8 h-8 rounded-full border border-silver/50 object-cover" referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-ink">{item.clubName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-cobalt font-bold">#{item.participants}人玩过</span>
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] text-ink/30 font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">{item.status}</div>
              <div className="flex items-center gap-2 text-ink/60 text-[10px] font-black uppercase tracking-tighter">
                <Calendar size={12} className="text-cobalt" />
                {item.date}
              </div>
              <div className="flex items-center gap-2 text-ink/60 text-[10px] font-black uppercase tracking-tighter">
                <MapPin size={12} className="text-cobalt" />
                {item.distance} {item.location}
              </div>
            </div>

            {/* Images */}
            {item.images.length > 1 ? (
              <div className="grid grid-cols-3 gap-2 mb-6 rounded-2xl overflow-hidden">
                {item.images.map((img, idx) => (
                  <div key={idx} className="aspect-square relative overflow-hidden group">
                    <img src={img} alt="Activity" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-6 relative group">
                <img src={item.images[0]} alt="Activity" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 bg-ink/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  VIP 独享
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-silver/30">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img 
                      key={i} 
                      src={`https://i.pravatar.cc/100?u=user${item.id}${i}`} 
                      className="w-8 h-8 rounded-full border-2 border-white object-cover" 
                      alt="Participant"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-ink/40">{item.joinedCount}人已上车</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-lg font-serif font-black text-ink italic">{item.price}</span>
                <button className="px-8 py-3 bg-ink text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-cobalt hover:shadow-lg shadow-ink/20 transition-all active:scale-95">
                  立即上车
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
