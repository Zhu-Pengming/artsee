import React from 'react';
import { ChevronLeft, Grid, Layout, Heart, MessageCircle, MoreHorizontal, Settings, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Post } from '../types';
import { cn } from '../lib/utils';

interface UserProfileViewProps {
  userId: string;
  posts: Post[];
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export const UserProfileView = ({ userId, posts, onBack, onPostClick }: UserProfileViewProps) => {
  // Find the user data from the first post where they are the author
  const user = posts.find(p => p.author.name === userId || (userId === 'me' && p.author.name === '陆川霖 Lin'))?.author || {
    name: userId === 'me' ? '陆川霖 Lin' : userId,
    avatar: userId === 'me' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' : 'https://i.pravatar.cc/150',
    type: '认证艺术家',
    bio: userId === 'me' ? '当代雕塑家 / 装置艺术探索者。致力于在物理空间中构建情绪的共振场。' : '这位神秘的朋友还没有留下简介...',
    followers: userId === 'me' ? 8500 : 2400,
    following: userId === 'me' ? 156 : 156,
    works: userId === 'me' ? 1200 : 42
  };

  const userPosts = posts.filter(p => p.author.name === userId || (userId === 'me' && p.author.name === '陆川霖 Lin'));

  return (
    <div className="bg-porcelain min-h-screen selection:bg-cobalt selection:text-white">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-white blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/50 backdrop-blur-2xl border-b border-silver/30 px-8 py-6 flex items-center justify-between">
        <button onClick={onBack} className="p-3 -ml-3 hover:bg-black/5 rounded-full transition-all group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-[10px] font-bold text-ink uppercase tracking-[0.4em] italic">{user.name} / Profile</h2>
        <button className="p-3 -mr-3 hover:bg-black/5 rounded-full transition-all">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-20 relative">
        {/* Profile Card */}
        <section className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden border border-white mb-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-16 relative z-10">
            <div className="relative shrink-0 group">
               <div className="absolute -inset-6 bg-cobalt/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <img src={user.avatar} alt="" className="w-56 h-56 rounded-[3.5rem] object-cover ring-1 ring-silver/20 shadow-2xl relative z-10 grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-10">
               <div className="flex flex-col md:flex-row md:items-end gap-6 justify-center md:justify-start">
                  <h1 className="text-5xl md:text-7xl font-serif font-light text-ink leading-none tracking-tight italic">{user.name}</h1>
                  <span className="self-center md:self-auto bg-cobalt text-white text-[9px] font-bold px-6 py-2 rounded-full uppercase tracking-[0.3em] shadow-xl shadow-cobalt/20">
                    {user.type}
                  </span>
               </div>
               
               <p className="text-lg md:text-xl text-ink/40 leading-relaxed max-w-xl font-light">
                 {user.bio}
               </p>

               <div className="flex items-center justify-center md:justify-start gap-16 py-10 border-y border-silver/30">
                  <div className="text-center md:text-left group cursor-default">
                    <p className="text-3xl font-serif font-light text-ink group-hover:text-cobalt transition-colors italic">{user.followers?.toLocaleString()}</p>
                    <p className="text-[9px] text-ink/30 font-bold uppercase tracking-[0.3em] mt-2">Follower</p>
                  </div>
                  <div className="text-center md:text-left group cursor-default">
                    <p className="text-3xl font-serif font-light text-ink group-hover:text-cobalt transition-colors italic">{user.following?.toLocaleString()}</p>
                    <p className="text-[9px] text-ink/30 font-bold uppercase tracking-[0.3em] mt-2">Following</p>
                  </div>
                  <div className="text-center md:text-left group cursor-default">
                    <p className="text-3xl font-serif font-light text-ink group-hover:text-cobalt transition-colors italic">{userPosts.length}</p>
                    <p className="text-[9px] text-ink/30 font-bold uppercase tracking-[0.3em] mt-2">Manifesto</p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-6">
                 <button className="h-20 px-16 bg-cobalt text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-ink transition-all shadow-2xl shadow-cobalt/20 active:scale-95">
                    关注对方
                 </button>
                 <button className="h-20 px-16 bg-[#FAF9F6] text-ink border border-silver/50 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-silver/20 transition-all active:scale-95">
                    发送私信
                 </button>
               </div>
            </div>
          </div>
        </section>

        {/* User Content Tabs */}
        <section className="space-y-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-silver/50 pb-8 gap-8">
              <div className="flex gap-12">
                 {['作品展示', '灵感收藏', '共鸣见证'].map((tab, i) => (
                   <button key={tab} className={cn(
                     "text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative pb-8 whitespace-nowrap",
                     i === 0 ? "text-cobalt" : "text-ink/20 hover:text-ink/60"
                   )}>
                     {tab}
                     {i === 0 && <motion.div layoutId="profile-tab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-cobalt" />}
                   </button>
                 ))}
              </div>
              <div className="text-[9px] font-bold text-ink/20 uppercase tracking-[0.5em] italic">artiqore Artist Archive #2026</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {userPosts.map((post) => (
                <motion.div 
                  whileHover={{ y: -16 }}
                  transition={{ type: 'spring', damping: 20 }}
                  key={post.id} 
                  onClick={() => onPostClick(post.id)}
                  className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl hover:shadow-cobalt/10 transition-all"
                >
                  <img src={post.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex flex-col justify-end">
                     <div className="flex items-center gap-6 text-white">
                        <div className="flex items-center gap-3">
                           <Heart size={20} fill="currentColor" strokeWidth={0} />
                           <span className="text-xs font-bold font-serif italic tracking-tighter">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
                           <span className="text-xs font-bold font-serif italic tracking-tighter">{post.commentsCount}</span>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};
