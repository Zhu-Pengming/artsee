// @ts-nocheck
'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HomeViewProps {
  onViewChange: (view: string) => void;
  onSearchOpen?: (query: string) => void;
  onAIGuideOpen?: (prompt: string) => void;
  onDiagnosisOpen?: () => void;
  onCalculatorOpen?: () => void;
  onWritingAssistantOpen?: () => void;
  onComparisonOpen?: () => void;
}

export const HomeView = ({
  onViewChange,
  onSearchOpen,
  onAIGuideOpen,
  onDiagnosisOpen,
  onWritingAssistantOpen,
  onComparisonOpen,
}: HomeViewProps) => {
  const [searchValue, setSearchValue] = useState('');

  const answerCount = 26;
  const knowledgeCount = 148;

  const promptRows = [
    [
      { text: 'RISD 作品集需要几页？', icon: <ImageIcon size={17} /> },
      { text: '伦艺申请时间线怎么排？', icon: <GraduationCap size={17} /> },
      { text: '插画专业怎么选校？', icon: <BookOpen size={17} /> },
    ],
    [
      { text: '文书怎么写出个人线索？', icon: <FileText size={17} /> },
      { text: '作品集诊断一下方向', icon: <Wand2 size={17} /> },
      { text: '院校和专业帮我比对', icon: <Globe size={17} /> },
    ],
  ];

  const exploreCards = [
    {
      title: '联网搜索',
      caption: '查院校、项目与最新申请信息',
      icon: <Globe size={22} />,
      action: () => onSearchOpen?.('艺术留学院校申请信息'),
      className: 'from-white to-cobalt/5',
    },
    {
      title: '知识库广场',
      caption: '按作品集、院校、文书快速探索',
      icon: <Flame size={21} />,
      action: () => onViewChange('info'),
      className: 'from-white to-rose-50',
    },
  ];

  const quickActions = [
    { label: '作品集诊断', action: () => onDiagnosisOpen?.() },
    { label: '文书助手', action: () => onWritingAssistantOpen?.() },
    { label: '院校比对', action: () => onComparisonOpen?.() },
  ];

  const runPrompt = (prompt?: string) => {
    const value = (prompt ?? searchValue).trim();
    if (value) {
      onAIGuideOpen?.(value);
      return;
    }
    onAIGuideOpen?.('我想做艺术留学规划，请先问我几个关键问题');
  };

  const handleSearch = () => {
    const value = searchValue.trim();
    if (value) {
      onSearchOpen?.(value);
    } else {
      onSearchOpen?.('艺术留学');
    }
  };

  return (
    <div className="relative h-full min-h-screen overflow-hidden bg-white text-ink select-none">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(0,51,153,0.08),transparent_58%)]" />

      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-5xl flex-col px-5 pb-36 pt-16 md:px-10 md:pb-20 md:pt-20">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-1 flex-col items-center justify-center text-center md:-translate-y-8"
        >
          <button
            onClick={() => runPrompt()}
            className="group relative mb-7 h-24 w-24 rounded-full bg-white shadow-[0_24px_70px_-28px_rgba(0,51,153,0.45)] ring-1 ring-silver/50 transition-transform duration-500 hover:scale-105"
            aria-label="打开意见 AI"
          >
            <span className="absolute inset-3 rounded-full bg-[conic-gradient(from_120deg,#003399,#8b5cf6,#fb7185,#f59e0b,#003399)] opacity-75 blur-[1px]" />
            <span className="absolute inset-6 rounded-full bg-white shadow-inner" />
            <Sparkles className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-purple-600 transition-transform duration-500 group-hover:rotate-12" size={24} />
          </button>

          <h1 className="text-[2.55rem] font-black leading-none tracking-normal text-ink md:text-6xl">
            艺见心知识问答
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-ink/42 md:text-xl">
            整合你可访问的 <button onClick={() => onViewChange('info')} className="border-b border-dashed border-ink/20 text-ink/55 transition-colors hover:text-cobalt">{knowledgeCount} 个知识点</button>，AI 搜索生成回答
          </p>
          <button
            onClick={() => onViewChange('discover')}
            className="mt-3 inline-flex items-center gap-2 text-base font-bold text-ink/38 transition-colors hover:text-purple-600"
          >
            已为你解答 <span className="text-2xl text-purple-600">{answerCount}</span> 次
            <ChevronRight size={18} />
          </button>

          <div className="mt-20 w-screen overflow-hidden md:mt-16">
            <div className="flex flex-col gap-4">
              {promptRows.map((row, rowIndex) => (
                <motion.div
                  key={rowIndex}
                  initial={{ opacity: 0, x: rowIndex === 0 ? -18 : 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + rowIndex * 0.08 }}
                  className={cn(
                    'flex min-w-max gap-4 px-4',
                    rowIndex === 0 ? 'justify-start md:justify-center' : 'justify-end md:justify-center'
                  )}
                >
                  {row.map((item) => (
                    <button
                      key={item.text}
                      onClick={() => runPrompt(item.text)}
                      className="inline-flex h-14 items-center gap-3 rounded-xl border border-silver/35 bg-white/95 px-6 text-base font-bold text-ink/62 shadow-[0_14px_34px_-28px_rgba(26,26,26,0.32)] transition-all hover:-translate-y-0.5 hover:border-cobalt/15 hover:text-ink hover:shadow-[0_18px_40px_-28px_rgba(0,51,153,0.35)]"
                    >
                      <span className="text-cobalt/70">{item.icon}</span>
                      {item.text}
                    </button>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.42, ease: 'easeOut' }}
          className="mx-auto hidden w-full max-w-3xl md:block"
        >
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-bold text-ink/38">
            <span>探索知识库，发现优质内容</span>
            <ChevronRight size={16} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            {exploreCards.map((card) => (
              <button
                key={card.title}
                onClick={card.action}
                className={cn(
                  'group flex min-h-[120px] items-center justify-between rounded-2xl border border-silver/30 bg-gradient-to-br p-6 text-left shadow-[0_22px_55px_-38px_rgba(26,26,26,0.35)] transition-all hover:-translate-y-1 hover:border-cobalt/15',
                  card.className
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-cobalt shadow-sm ring-1 ring-silver/40">
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-lg font-black text-ink">{card.title}</div>
                    <div className="mt-1 text-sm font-semibold text-ink/34">{card.caption}</div>
                  </div>
                </div>
                <ArrowRight className="text-ink/18 transition-transform group-hover:translate-x-1 group-hover:text-cobalt" size={20} />
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.42, ease: 'easeOut' }}
          className="mx-auto w-full max-w-3xl md:hidden"
        >
          <button
            onClick={() => onViewChange('discover')}
            className="mb-6 flex w-full items-center justify-center gap-2 text-base font-bold text-ink/38"
          >
            探索知识库，发现优质内容
            <ChevronRight size={18} />
          </button>
          <div className="grid grid-cols-2 gap-3">
            {exploreCards.map((card) => (
              <button
                key={card.title}
                onClick={card.action}
                className={cn('rounded-2xl border border-silver/30 bg-gradient-to-br px-4 py-5 text-left shadow-sm', card.className)}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cobalt shadow-sm ring-1 ring-silver/40">
                  {card.icon}
                </div>
                <div className="text-base font-black text-ink">{card.title}</div>
                <div className="mt-1 text-xs font-semibold leading-5 text-ink/34">{card.caption}</div>
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white via-white to-white/0 px-4 pb-5 pt-10 md:pb-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="shrink-0 rounded-full border border-silver/50 bg-white px-4 py-2 text-xs font-black text-ink/48 shadow-sm transition-colors hover:text-cobalt"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onViewChange('feed')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-silver/50 bg-white text-ink/45 shadow-sm transition-colors hover:text-cobalt"
              aria-label="更多入口"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="flex h-18 items-center gap-3 rounded-[1.65rem] border border-silver/50 bg-white px-4 shadow-[0_22px_65px_-28px_rgba(26,26,26,0.42)] md:h-20 md:px-5">
            <button
              onClick={handleSearch}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-ink transition-colors hover:bg-porcelain"
              aria-label="联网搜索"
            >
              <Plus size={30} strokeWidth={2.2} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') runPrompt();
              }}
              placeholder="按住 说话"
              className="min-w-0 flex-1 bg-transparent text-center text-xl font-black text-ink outline-none placeholder:text-ink md:text-2xl"
            />
            <button
              onClick={() => runPrompt()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-ink transition-colors hover:bg-porcelain"
              aria-label="发送给意见 AI"
            >
              {searchValue.trim() ? <ArrowRight size={26} /> : <Mic size={26} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
