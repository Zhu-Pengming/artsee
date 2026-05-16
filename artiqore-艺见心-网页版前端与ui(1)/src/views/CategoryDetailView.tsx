import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Users, Star, Trophy, Target, Tent, Music, Camera, ChevronRight, Share2, Heart } from 'lucide-react';

interface CategoryDetailViewProps {
  category: {
    id: string;
    label: string;
    icon: React.ReactNode;
    image: string;
  };
  onBack: () => void;
  onSalonClick: (event: any) => void;
}

export const CategoryDetailView = ({ category, onBack, onSalonClick }: CategoryDetailViewProps) => {
  const mockActivities = [
    {
      id: 101,
      title: `${category.label}特辑：寻找城市中的美学边界`,
      clubName: 'artiqore 实验室',
      location: '广州·太古汇',
      date: '下周六 05.10 14:00',
      price: '¥199',
      participants: 450,
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      tags: ['#主题活动', '#城市联名']
    },
    {
      id: 102,
      title: `${category.label}·大师班：从理论到实践的艺术进阶`,
      clubName: '大师工坊',
      location: '广州·东山口',
      date: '下周日 05.11 10:00',
      price: '¥599',
      participants: 120,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
      tags: ['#深度研修', '#大师对话']
    }
  ];

  return (
    <div className="bg-porcelain min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          src={category.image} 
          className="w-full h-full object-cover grayscale-[0.2]"
          alt={category.label}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-12 left-8 right-8 flex justify-between items-center z-20">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-16 left-8 right-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 text-white/60 mb-4"
          >
            <div className="w-8 h-8 bg-cobalt rounded-lg flex items-center justify-center text-white shadow-lg shadow-cobalt/20">
              {category.icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.4em]">Official Category</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl font-serif font-bold text-white italic leading-none"
          >
            {category.label}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 mt-6 max-w-lg text-lg font-light leading-relaxed"
          >
            探索{category.label}领域的极致美学，汇集城市中最具创意的灵魂，在沉浸式的场域中开启新的叙事。
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -translate-y-8 relative z-20">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-silver/20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-serif font-bold text-ink italic">为您推荐的{category.label}活动</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-ink/30 uppercase tracking-widest">
              <span>Sort by:</span>
              <button className="text-cobalt">Latest</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {mockActivities.map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSalonClick({
                  ...activity,
                  images: [activity.image]
                })}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl shadow-ink/5">
                  <img src={activity.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={activity.title} referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    {activity.tags.map(tag => (
                      <span key={tag} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold text-ink uppercase tracking-tighter">{tag}</span>
                    ))}
                  </div>
                  <button className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-ink/20 hover:text-red-500 hover:shadow-lg transition-all border border-silver/20">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cobalt uppercase tracking-[0.2em]">{activity.clubName}</span>
                    <span className="text-[10px] font-bold text-ink/20 uppercase">Featured</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink group-hover:text-cobalt transition-colors leading-tight">{activity.title}</h3>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-ink/40 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-cobalt" /> {activity.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-cobalt" /> {activity.date}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-silver/30">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => (
                          <img key={j} src={`https://i.pravatar.cc/100?u=user${activity.id}${j}`} className="w-7 h-7 rounded-full border-2 border-white object-cover" alt="" referrerPolicy="no-referrer" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-ink/20">{activity.participants}人计划参加</span>
                    </div>
                    <span className="text-xl font-serif font-black text-ink italic">{activity.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
