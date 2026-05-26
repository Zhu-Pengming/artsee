// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ChevronLeft, Share2, MoreHorizontal, Settings, Heart, MessageCircle, Star, Users, Shield, Mail, Bell, Zap, SlidersHorizontal, UserPlus, Check, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { cn } from '../lib/utils';
import { 
  UserProfileSectionDetail, 
  VideoDetail, 
  SuperTopicDetail, 
  AlbumDetail, 
  FeedDetail 
} from '../components/UserProfileSectionDetails';

interface UserProfileViewProps {
  userId: string;
  posts: Post[];
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onNotificationClick?: () => void;
  onPaymentRequest?: (info: { amount: string, title: string, itemTitle: string }) => void;
}

export const UserProfileView = ({ userId, posts, onBack, onPostClick, onNotificationClick, onPaymentRequest }: UserProfileViewProps) => {
  const [activeTab, setActiveTab] = useState('weibo');
  const [filter, setFilter] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeDetailSection, setActiveDetailSection] = useState<'fans' | 'selection' | 'paid' | 'followers' | 'following' | 'vindex' | 'stats' | null>(null);

  // Find the user data
  const user = posts.find(p => p.author.id === userId || (userId === 'me' && p.author.name === '陆川霖 Lin'))?.author || {
    id: userId,
    name: userId.includes('advisor') ? (userId === 'advisor-1' ? '王教授 (Faculty of Arts)' : '李老师 (Creative Tech)') : (userId === 'me' ? '陆川霖 Lin' : userId),
    avatar: userId.includes('advisor') ? (userId === 'advisor-1' ? 'https://i.pravatar.cc/100?u=ans1' : 'https://i.pravatar.cc/100?u=ans2') : (userId === 'me' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' : 'https://i.pravatar.cc/400'),
    type: userId.includes('advisor') ? '认证学术顾问' : '认证艺术家',
    bio: userId.includes('advisor') ? '致力于艺术教育与跨学科研究，具有多年海外名校评审经验。' : (userId === 'me' ? '当代雕塑家 / 装置艺术探索者。致力于在物理空间中构建情绪的共振场。' : '微博原创视频博主'),
    followers: userId.includes('advisor') ? 34200 : (userId === 'me' ? 8500 : 164000),
    following: userId.includes('advisor') ? 120 : (userId === 'me' ? 156 : 187),
    works: userId.includes('advisor') ? '4.2k' : (userId === 'me' ? '1.2万' : '19.4万')
  };

  // Improved filtering and mock data for empty profiles
  const realUserPosts = posts.filter(p => p.author.id === userId || (userId === 'me' && p.author.name === '陆川霖 Lin'));
  
  const userPosts = realUserPosts.length > 0 ? realUserPosts : [
    {
      id: `fallback-${userId}-1`,
      author: user,
      content: '分享一个关于艺术留学的核心观点：作品集的核心不在于技术的堆叠，而在于你如何通过视觉语言讲述一个完整且具有深度的调研故事。#艺术留学 #作品集建议',
      images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'],
      likes: 120,
      commentsCount: 45,
      type: 'work',
      timestamp: '2小时前'
    },
    {
      id: `fallback-${userId}-2`,
      author: user,
      content: '今日在工作室的思考：当物理空间被数字技术不断侵蚀，我们的感官本能该如何寻找新的锚点？',
      images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&q=80&w=800'],
      likes: 89,
      commentsCount: 12,
      type: 'work',
      timestamp: '昨天'
    }
  ] as Post[];

  const coverImage = "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200";

  const userPostsToDisplay = userPosts.filter(post => {
    if (filter === 'original') return post.images.length > 0; // Just as a mock filter
    if (filter === 'hot') return post.likes > 1000;
    return true;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return <FeedDetail title="动态" isInline={true} />;
      case 'video':
        return <VideoDetail isInline={true} />;
      case 'talk':
        return <SuperTopicDetail isInline={true} />;
      case 'album':
        return <AlbumDetail isInline={true} />;
      case 'weibo':
      default:
        return (
          <div className="space-y-4">
            {/* Interaction Section */}
            <div className="bg-white mx-3 p-4 rounded-xl space-y-4 shadow-sm">
               <div className="flex justify-between items-center px-4">
                  <div className="text-center">
                     <p className="text-[11px] text-[#939393] mb-1">关注天数</p>
                     <p className="text-[15px] font-bold text-[#333] underline decoration-[#fa7d3c] decoration-2 underline-offset-4">893天</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[11px] text-[#939393] mb-1">本月互动</p>
                     <p className="text-[15px] font-bold text-gray-200">--</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[11px] text-[#939393] mb-1">本月累计访问</p>
                     <p className="text-[15px] font-bold text-[#333]">1天</p>
                  </div>
               </div>
            </div>

            {userPostsToDisplay.map((post) => (
              <motion.div 
                key={post.id} 
                className="bg-white p-4 border-b border-[#f2f2f2] group hover:bg-gray-50 transition-all"
              >
                <div 
                  className="flex gap-3 mb-3 cursor-pointer"
                  onClick={() => onPostClick(post.id)}
                >
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold text-[#333]">{user.name}</span>
                      <div className="w-3.5 h-3.5 bg-orange-400 rounded-full flex items-center justify-center text-[7px] text-white italic font-black">V</div>
                    </div>
                    <div className="text-[11px] text-[#939393] mt-0.5">
                      10小时前 来自 艺术实验室的 某Phone
                    </div>
                  </div>
                </div>
                
                <p 
                  className="text-[15px] text-[#333] line-clamp-4 mb-3 leading-relaxed cursor-pointer"
                  onClick={() => onPostClick(post.id)}
                >
                  {post.content}
                </p>

                {post.images.length > 0 && (
                   <div 
                     className={cn(
                      "grid gap-1.5 mb-4 cursor-pointer",
                      post.images.length === 1 ? "grid-cols-1" : 
                      post.images.length === 2 ? "grid-cols-2" : 
                      "grid-cols-3"
                    )}
                    onClick={() => onPostClick(post.id)}
                   >
                    {post.images.map((img, i) => (
                      <div key={i} className={cn("overflow-hidden bg-[#f0f0f0]", post.images.length === 1 ? "rounded-lg max-h-[400px]" : "aspect-square rounded-sm")}>
                        <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#f2f2f2] text-[#939393]">
                   <button className="flex-1 flex items-center justify-center gap-2 hover:text-[#fa7d3c] transition-colors"><Share2 size={16} /> <span className="text-[12px]">转发</span></button>
                   <button className="flex-1 flex items-center justify-center gap-2 hover:text-[#fa7d3c] transition-colors"><MessageCircle size={16} /> <span className="text-[12px]">{post.commentsCount}</span></button>
                   <button className="flex-1 flex items-center justify-center gap-2 hover:text-red-500 transition-colors"><Heart size={16} /> <span className="text-[12px]">{post.likes}</span></button>
                </div>
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-[#f2f2f2] min-h-screen selection:bg-cobalt selection:text-white">
      {/* Header Overlay */}
      <header className="fixed top-0 inset-x-0 h-10 md:h-12 bg-transparent z-[60] flex items-center justify-between px-4 transition-all">
        <button onClick={onBack} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all">
            <Settings size={20} />
          </button>
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
        {/* User Sidebar for Desktop */}
        <aside className="hidden md:block w-80 shrink-0 sticky top-4 h-fit space-y-4 pt-12">
           <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                 <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-silver/10 object-cover" alt="" />
                 <div>
                    <h2 className="text-xl font-bold text-[#333] flex items-center justify-center gap-2">
                       {user.name}
                       <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-white italic font-black">V</div>
                    </h2>
                    <p className="text-[12px] text-[#939393] mt-1">{user.type}</p>
                 </div>
                 <div className="w-full h-[1px] bg-silver/10" />
                 
                 <div className="w-full">
                    <button 
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={cn(
                        "w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
                        isFollowing 
                          ? "bg-gray-100 text-[#939393] border border-silver/20" 
                          : "bg-cobalt text-white shadow-lg shadow-cobalt/20 hover:bg-blue-700"
                      )}
                    >
                      {isFollowing ? <><Check size={16} /> 已关注</> : <><Plus size={16} /> 关注</>}
                    </button>
                 </div>

                 <div className="grid grid-cols-3 w-full">
                    <div className="text-center">
                       <p className="text-sm font-bold">{user.followers?.toLocaleString()}</p>
                       <p className="text-[10px] text-[#939393]">粉丝</p>
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-bold">{user.following?.toLocaleString()}</p>
                       <p className="text-[10px] text-[#939393]">关注</p>
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-bold">{user.works}</p>
                       <p className="text-[10px] text-[#939393]">转评赞</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-[#333] uppercase tracking-widest border-l-2 border-cobalt pl-3">个人信息</h3>
                 <p className="text-sm text-[#666] leading-relaxed">{user.bio}</p>
              </div>
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-[#333] uppercase tracking-widest border-l-2 border-cobalt pl-3">认证及奖励</h3>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500"><Shield size={16} /></div>
                    <span className="text-xs font-bold text-[#333]">认证艺术家</span>
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Cover Image Section (Mobile Header) */}
          <div className="relative h-64 md:h-80 overflow-hidden md:rounded-b-[2.5rem] z-10">
            <img src={coverImage} className="w-full h-full object-cover brightness-75" alt="Cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f2f2f2] via-transparent to-transparent" />
          </div>

          <div className="px-0 md:px-0 -mt-16 relative z-20">
            <div className="bg-white md:rounded-[2.5rem] shadow-sm min-h-screen overflow-hidden">
              {/* Mobile Profile Header Info */}
              <div className="md:hidden p-6 pt-0">
                <div className="flex justify-between items-end -mt-10 mb-6">
                  <div className="relative z-30">
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" alt="" />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold italic">V</div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={cn(
                        "px-6 h-10 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95",
                        isFollowing 
                          ? "bg-gray-100 text-[#939393] border border-silver/20" 
                          : "bg-cobalt text-white shadow-lg shadow-cobalt/20"
                      )}
                    >
                      {isFollowing ? <><Check size={14} /> 已关注</> : <><Plus size={14} /> 关注</>}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-[#333]">{user.name}</h1>
                  <div className="flex gap-6">
                    <div className="flex gap-1 items-baseline"><span className="text-lg font-bold">{user.followers?.toLocaleString()}</span><span className="text-xs text-[#939393]">粉丝</span></div>
                    <div className="flex gap-1 items-baseline"><span className="text-lg font-bold">{user.following?.toLocaleString()}</span><span className="text-xs text-[#939393]">关注</span></div>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">{user.bio}</p>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="sticky top-0 bg-white z-20 border-b border-[#f2f2f2]">
                <div className="flex px-2">
                  {[
                    { id: 'timeline', label: '动态' },
                    { id: 'weibo', label: '微博', icon: 'https://img.icons8.com/color/48/000000/sina-weibo.png' },
                    { id: 'video', label: '视频', icon: 'https://img.icons8.com/color/48/000000/video-playlist.png' },
                    { id: 'talk', label: '超话', icon: 'https://img.icons8.com/color/48/000000/hashtag.png' },
                    { id: 'album', label: '相册', icon: 'https://img.icons8.com/color/48/000000/gallery.png' },
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 py-4 text-sm font-bold text-center transition-all relative flex items-center justify-center gap-1.5",
                        activeTab === tab.id ? "text-[#333]" : "text-[#939393]"
                      )}
                    >
                      {tab.icon && <img src={tab.icon} className="w-3.5 h-3.5" alt="" referrerPolicy="no-referrer" />}
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#fa7d3c]" />}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'weibo' && (
                    <motion.div 
                      key="filter-bar"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 flex items-center justify-between border-t border-silver/5"
                    >
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'all', label: `全部微博` },
                          { id: 'original', label: '原创' },
                          { id: 'liked', label: '凸 赞' },
                          { id: 'hot', label: '近期热门' },
                        ].map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => setFilter(c.id)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-colors",
                              filter === c.id ? "bg-[#f2f2f2] text-[#333] font-bold" : "text-[#666]"
                            )}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <button className="p-2 text-[#939393] hover:text-ink transition-colors"><SlidersHorizontal size={16} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content rendering instead of modal for main tabs */}
              <div className="min-h-screen bg-[#f2f2f2]">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#f2f2f2] flex items-center h-16 z-[60] px-4 shadow-lg pb-safe">
        <button className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#666]"><MessageCircle size={18} /><span className="text-[10px]">客服</span></button>
        <button 
          onClick={onNotificationClick}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#666]"
        >
          <Bell size={18} />
          <span className="text-[10px]">通知</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#666]"><Zap size={18} /><span className="text-[10px]">推荐</span></button>
        <button className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#666]"><User size={18} /><span className="text-[10px]">已关注</span></button>
      </div>

      {/* Sub-modals for secondary lists like stats, followers, etc. */}
      <AnimatePresence>
        {activeDetailSection && (
          <UserProfileSectionDetail 
            type={activeDetailSection} 
            onClose={() => setActiveDetailSection(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
