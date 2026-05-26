// @ts-nocheck
'use client';

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

export const ClubView = ({ 
  onSalonClick, 
  onCategoryClick,
  onTravelClick 
}: { 
  onSalonClick: (event: any) => void, 
  onCategoryClick: (cat: any) => void,
  onTravelClick?: () => void
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredClubs = CLUBS.filter(club => 
    club.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const venues = [
    { name: 'W Hotel', title: 'W酒店顶级艺术沙龙计划', location: '广州·珠江新城', img: 'https://picsum.photos/seed/hotel-w/600/300', clubName: 'artiqore 精英会', price: '¥299', date: '周五 04.25 19:00' },
    { name: 'Four Seasons', title: '四季酒店：云端艺术私享会', location: '广州·IFC', img: 'https://picsum.photos/seed/hotel-4s/600/300', clubName: '四季雅集', price: '¥199', date: '周六 04.26 15:00' },
    { name: 'Rosewood', title: '瑰丽酒店：秘境艺术之夜', location: '广州·周大福中心', img: 'https://picsum.photos/seed/hotel-rw/600/300', clubName: '瑰丽沙龙', price: '¥399', date: '周日 04.27 20:00' },
    { name: 'Mandarin Oriental', title: '文华东方：东方韵律研讨', location: '广州·太古汇', img: 'https://picsum.photos/seed/hotel-mo/600/300', clubName: '文华书院', price: '¥258', date: '下周一 04.28 14:00' },
  ];

  const filteredVenues = venues.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-3 pb-20">
      {/* Search & Location */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1 text-ink shrink-0 scale-90">
          <span className="text-xs font-bold">广州</span>
          <motion.div animate={{ rotate: 180 }}>
            <MapPin size={10} className="text-cobalt" />
          </motion.div>
        </div>
        <div className="flex-1 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30">
            <Search size={12} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜精品活动..." 
            className="w-full bg-white border border-silver/40 rounded-lg h-9 pl-10 pr-3 text-xs focus:ring-1 focus:ring-cobalt/10 focus:border-cobalt/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-6 px-6">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => onCategoryClick(cat)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-silver/20 text-sm font-bold text-ink/60 whitespace-nowrap hover:border-cobalt/30 hover:text-cobalt transition-all"
          >
            <span className="scale-75">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
        <button className="flex items-center justify-center w-6 h-6 bg-white rounded-full border border-silver/20 text-ink/40 shrink-0">
          <Plus size={10} />
        </button>
      </div>

      {/* Featured Banner */}
      <div 
        onClick={onTravelClick}
        className="relative rounded-xl overflow-hidden aspect-[21/4] shadow-sm group cursor-pointer border border-white/5"
      >
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
          alt="Banner" 
          className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/30 to-transparent p-4 flex flex-col justify-center">
          <span className="text-white/40 text-[5px] font-bold tracking-[0.2em] uppercase mb-0.5">Editor's Pick</span>
          <h2 className="text-white text-sm md:text-base font-serif font-bold italic max-w-xs leading-tight">旅拍：在星级酒店开启艺术之旅</h2>
          <button className="mt-1.5 w-fit px-3 py-1 bg-white text-ink text-[7px] font-bold uppercase tracking-widest rounded-lg hover:bg-cobalt hover:text-white transition-colors">
            立即查看
          </button>
        </div>
      </div>

      {/* Club List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-serif font-bold text-ink italic">优质专场活动</h3>
          <button className="text-[12px] font-bold text-cobalt uppercase tracking-widest">查看全部</button>
        </div>

        {/* Venues Scroller - Silky Smooth */}
        {filteredVenues.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 pb-2 will-change-transform">
            {filteredVenues.map((venue, i) => (
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
                className="min-w-[200px] md:min-w-[240px] bg-white rounded-2xl border border-silver/20 overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all snap-center"
              >
                <div className="aspect-[3/1] overflow-hidden">
                  <img 
                    src={venue.img} 
                    className="w-full h-full object-cover md:group-hover:scale-105 transition-all duration-700" 
                    alt={venue.name} 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="p-4 md:h-18 flex flex-col justify-center">
                  <h5 className="text-base font-bold text-ink line-clamp-1">{venue.name}</h5>
                  <p className="text-[11px] text-ink/30 font-bold uppercase mt-1 truncate">{venue.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && (
          <div className="px-1 py-4 text-ink/30 text-xs font-bold uppercase tracking-widest italic">
            没有找到匹配的场馆...
          </div>
        )}

        {filteredClubs.length > 0 ? filteredClubs.map(item => (
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
            className="bg-white rounded-xl p-4 shadow-sm border border-silver/30 hover:shadow-md transition-all group cursor-pointer"
          >
            {/* Header: Title */}
            <h4 className="text-xl font-bold text-ink mb-3 group-hover:text-cobalt transition-colors md:h-16 overflow-hidden">{item.title}</h4>
            
            {/* Club Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={item.clubLogo} alt={item.clubName} className="w-5 h-5 rounded-full border border-silver/50 object-cover" referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-ink leading-none">{item.clubName}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px] text-cobalt font-bold leading-none">#{item.participants}人参与</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="px-1.5 py-0.5 bg-green-500/80 text-white text-[7px] font-bold rounded-sm uppercase tracking-wider">{item.status}</div>
              <div className="flex items-center gap-1 text-ink/60 text-[8px] font-black uppercase tracking-tighter">
                <Calendar size={8} className="text-cobalt" />
                {item.date}
              </div>
              <div className="flex items-center gap-1 text-ink/60 text-[8px] font-black uppercase tracking-tighter">
                <MapPin size={8} className="text-cobalt" />
                {item.location}
              </div>
            </div>

            {/* Images */}
            {item.images.length > 1 ? (
              <div className="grid grid-cols-3 gap-1 mb-3 rounded-lg overflow-hidden">
                {item.images.map((img, idx) => (
                  <div key={idx} className="aspect-square relative overflow-hidden group">
                    <img src={img} alt="Activity" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-[21/7] rounded-lg overflow-hidden mb-3 relative group">
                <img src={item.images[0]} alt="Activity" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-silver/30">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[1, 2].map(i => (
                    <img 
                      key={i} 
                      src={`https://i.pravatar.cc/100?u=user${item.id}${i}`} 
                      className="w-5 h-5 rounded-full border border-white object-cover shadow-sm" 
                      alt="Participant"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <span className="text-[8px] font-bold text-ink/30 uppercase">{item.joinedCount}人报名</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-black text-ink italic">{item.price}</span>
                <button className="px-4 py-1.5 bg-ink text-white rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-cobalt transition-all">
                  预订
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4">
            <div className="w-16 h-16 bg-porcelain rounded-full flex items-center justify-center text-ink/10">
              <Search size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-ink italic">没有找到符合条件的精品活动</h4>
              <p className="text-[10px] text-ink/20 font-bold uppercase tracking-widest leading-relaxed">尝试更换关键词或在其他类别中搜索</p>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-porcelain text-ink/40 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-silver/20 hover:text-ink transition-all"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
