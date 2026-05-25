import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, GraduationCap, ArrowRight, User, Hash, Sparkles, Filter, ChevronRight, Zap } from 'lucide-react';
import { INSTITUTIONS_DATA, Institution } from '../data/institutions';
import { MOCK_POSTS } from '../data';
import { cn } from '../lib/utils';
import { Post } from '../types';

interface SearchViewProps {
  initialQuery?: string;
  onBack: () => void;
  onInstitutionClick: (inst: Institution) => void;
  onPostClick: (id: string) => void;
  onUserClick: (id: string) => void;
}

type SearchCategory = 'all' | 'institutions' | 'posts' | 'users';

export const SearchView = ({ 
  initialQuery = '', 
  onBack, 
  onInstitutionClick, 
  onPostClick,
  onUserClick
}: SearchViewProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');

  const categories = [
    { id: 'all' as const, label: '全部' },
    { id: 'institutions' as const, label: '院校' },
    { id: 'posts' as const, label: '灵感/帖子' },
    { id: 'users' as const, label: '艺术家/用户' },
  ];

  const allInstitutions = useMemo(() => Object.values(INSTITUTIONS_DATA).flat(), []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { institutions: [], posts: [], users: [] };

    const filteredInstitutions = allInstitutions.filter(inst => 
      inst.name.toLowerCase().includes(q) || inst.originalName?.toLowerCase().includes(q) || inst.location.toLowerCase().includes(q)
    );

    const postsToSearch = Array.isArray(MOCK_POSTS) ? MOCK_POSTS : [];
    const filteredPosts = postsToSearch.filter(post => 
      post.content.toLowerCase().includes(q)
    );

    // Extract unique users from posts for simplicity in mock
    const uniqueUsersMap = new Map();
    postsToSearch.forEach(p => {
      const authorName = p.author?.name || '';
      const authorId = p.author?.id || authorName; // Fallback to name if ID is missing
      if (!uniqueUsersMap.has(authorId) && authorName.toLowerCase().includes(q)) {
        uniqueUsersMap.set(authorId, p.author);
      }
    });
    const filteredUsers = Array.from(uniqueUsersMap.values());

    return {
      institutions: filteredInstitutions,
      posts: filteredPosts,
      users: filteredUsers
    };
  }, [query, allInstitutions]);

  const isEmpty = query.trim() === '';
  const totalResults = results.institutions.length + results.posts.length + results.users.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Search Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-silver/10">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-ink/40 hover:text-ink transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-cobalt transition-colors" size={20} />
              <input 
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索院校、灵感或艺术家..."
                className="w-full h-12 md:h-14 pl-12 pr-12 bg-porcelain rounded-2xl text-base md:text-xl focus:outline-none focus:ring-2 focus:ring-cobalt/10 border-none font-bold"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/20 hover:text-ink transition-colors"
                >
                  <X size={16} fill="currentColor" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 mt-6 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0",
                  activeCategory === cat.id ? "text-cobalt" : "text-ink/20 hover:text-ink/40"
                )}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cobalt rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Scroll Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-porcelain rounded-full flex items-center justify-center mx-auto text-ink/10">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-serif italic font-bold text-ink/20">开始探索艺术宇宙</p>
                <p className="text-xs text-ink/10 font-bold uppercase tracking-widest">院校 · 灵感 · 艺术家 · 趋势</p>
              </div>
            </motion.div>
          ) : totalResults === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-6"
            >
               <div className="w-20 h-20 bg-porcelain rounded-full flex items-center justify-center mx-auto text-ink/10">
                <Filter size={32} />
              </div>
              <p className="text-xl font-serif italic font-bold text-ink/40">暂无相关搜索结果</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Institutions Section */}
              {(activeCategory === 'all' || activeCategory === 'institutions') && results.institutions.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap size={18} className="text-cobalt" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">相关院校</h3>
                    </div>
                    <span className="text-[10px] font-mono text-ink/20">{results.institutions.length} Results</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.institutions.slice(0, activeCategory === 'all' ? 4 : 20).map((inst) => (
                      <button 
                        key={inst.id}
                        onClick={() => onInstitutionClick(inst)}
                        className="flex items-center gap-4 p-4 bg-porcelain rounded-2xl hover:bg-white hover:shadow-xl hover:ring-1 hover:ring-cobalt/10 transition-all text-left group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden transition-all shrink-0">
                          <img src={inst.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-bold text-ink truncate">{inst.name}</h4>
                           <p className="text-[10px] text-ink/40 uppercase tracking-widest leading-relaxed">{inst.location}</p>
                        </div>
                        <ChevronRight size={16} className="text-ink/10 group-hover:text-cobalt group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                  {activeCategory === 'all' && results.institutions.length > 4 && (
                    <button onClick={() => setActiveCategory('institutions')} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-cobalt hover:bg-cobalt/5 rounded-xl transition-all">
                      查看全部院校
                    </button>
                  )}
                </section>
              )}

              {/* Posts Section */}
              {(activeCategory === 'all' || activeCategory === 'posts') && results.posts.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-purple-600" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">创作灵感</h3>
                    </div>
                    <span className="text-[10px] font-mono text-ink/20">{results.posts.length} Results</span>
                  </div>
                  <div className="space-y-4">
                    {results.posts.slice(0, activeCategory === 'all' ? 3 : 20).map((post) => (
                      <button 
                        key={post.id}
                        onClick={() => onPostClick(post.id)}
                        className="w-full flex items-start gap-4 p-5 bg-white border border-silver/20 rounded-[2rem] hover:shadow-xl transition-all text-left"
                      >
                        <div className="flex-1 space-y-3">
                           <h4 className="text-base font-serif font-black italic text-ink line-clamp-1">{post.title || post.content.split('。')[0]}</h4>
                           <div className="flex flex-wrap gap-2">
                             {(post as any).tags?.slice(0, 3).map((tag: string) => (
                               <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-ink/30">#{tag}</span>
                             ))}
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-porcelain overflow-hidden">
                                <img src={post.author.avatar} alt="" />
                              </div>
                              <span className="text-[10px] font-bold text-ink/40">{post.author.name}</span>
                           </div>
                        </div>
                        {post.images?.[0] && (
                          <div className="w-24 h-24 rounded-2xl overflow-hidden hover:scale-105 transition-all shrink-0">
                            <img src={post.images[0]} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                   {activeCategory === 'all' && results.posts.length > 3 && (
                    <button onClick={() => setActiveCategory('posts')} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-cobalt hover:bg-cobalt/5 rounded-xl transition-all">
                      查看更多灵感
                    </button>
                  )}
                </section>
              )}

              {/* Users Section */}
              {(activeCategory === 'all' || activeCategory === 'users') && results.users.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-ink/60" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">创作艺术家</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {results.users.slice(0, activeCategory === 'all' ? 4 : 20).map((user) => (
                      <button 
                        key={user.id}
                        onClick={() => onUserClick(user.id)}
                        className="flex flex-col items-center p-6 bg-porcelain/50 rounded-3xl hover:bg-white hover:shadow-xl transition-all group"
                      >
                        <div className="relative mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden group-hover:shadow-xl transition-all border-2 border-white shadow-lg">
                            <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cobalt rounded-lg flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                            <Zap size={10} fill="white" />
                          </div>
                        </div>
                        <h4 className="text-xs font-black italic text-ink">{user.name}</h4>
                        <p className="text-[9px] text-ink/30 font-bold uppercase tracking-widest mt-1">Artist</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
