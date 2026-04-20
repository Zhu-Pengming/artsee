'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, FileText, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTranslations } from '@/components/i18n-provider';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('nav');
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ posts: any[]; cases: any[] }>({ posts: [], cases: [] });

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ posts: [], cases: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const likePattern = `%${q.trim()}%`;
    const [postsRes, casesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, type, created_at')
        .ilike('title', likePattern)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('cases')
        .select('id, title, result, created_at')
        .ilike('title', likePattern)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    setResults({
      posts: postsRes.data ?? [],
      cases: casesRes.data ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  const hasResults = results.posts.length > 0 || results.cases.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-32 sm:pt-40 px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-surface-container-low rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header / Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
              <Search className="w-5 h-5 text-on-surface-variant" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/50"
              />
              {loading && <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />}
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-primary/10 text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() && (
                <div className="px-5 py-8 text-sm text-on-surface-variant text-center">
                  输入关键词搜索发现内容与案例
                </div>
              )}

              {query.trim() && !loading && !hasResults && (
                <div className="px-5 py-8 text-sm text-on-surface-variant text-center">
                  未找到与 “{query}” 相关的内容
                </div>
              )}

              {hasResults && (
                <div className="py-2">
                  {results.posts.length > 0 && (
                    <div className="px-5 py-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        <FileText className="w-3.5 h-3.5" />
                        发现
                      </div>
                      <div className="space-y-1">
                        {results.posts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/forum/${post.id}`}
                            onClick={onClose}
                            className="block px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <div className="text-sm font-medium text-on-surface truncate">
                              {post.title}
                            </div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {post.type === 'question' ? '问答' : post.type === 'news' ? '资讯' : '讨论'}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.cases.length > 0 && (
                    <div className="px-5 py-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        案例
                      </div>
                      <div className="space-y-1">
                        {results.cases.map((c) => (
                          <Link
                            key={c.id}
                            href={`/cases/${c.id}`}
                            onClick={onClose}
                            className="block px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <div className="text-sm font-medium text-on-surface truncate">
                              {c.title}
                            </div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {c.result === 'admitted' ? '录取' : c.result === 'waitlisted' ? '等候' : '已拒绝'}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
