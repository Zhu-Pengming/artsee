import React from 'react';
import { ChevronLeft, Share2, Shield, Fingerprint, Scale, Eye, ScrollText, PenTool, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CovenantDetailViewProps {
  onBack: () => void;
}

export const CovenantDetailView = ({ onBack }: CovenantDetailViewProps) => {
  const principles = [
    {
      icon: <Fingerprint size={24} />,
      title: '原创性与真实性 (Originality)',
      desc: '我们坚持艺术创作的独特性，禁止任何形式的抄袭。每一件作品都应是创作者独立思考与情感劳动的真实投射。',
    },
    {
      icon: <Scale size={24} />,
      title: '商业伦理与公平 (Fair Trading)',
      desc: '在艺术商业活动中，维持透明的定价机制与合同条款。保护每一个微小创作者的版权利益与劳动所得。',
    },
    {
      icon: <Eye size={24} />,
      title: '批判性思维 (Critical Thinking)',
      desc: '鼓励跨越表象的深度审视。艺术应具备反思社会、重构未来的力量，而非仅仅是乏味的视觉装饰。',
    },
    {
      icon: <Shield size={24} />,
      title: '社区共建责任 (Collective Responsibility)',
      desc: '每一位成员都有义务维护社区的专业氛围，对违规行为进行监督，共同构建一个良性的创意生态。',
    }
  ];

  return (
    <div className="bg-ink min-h-screen pb-32 text-white selection:bg-cobalt selection:text-white">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-cobalt/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 h-20 bg-ink/50 backdrop-blur-3xl border-b border-white/5 border-silver/5 z-50 flex items-center justify-between px-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 p-2 -ml-2 hover:bg-white/5 rounded-full transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 shadow-sm border border-white/10 group-hover:text-cobalt">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] italic">Code of Conduct</span>
        </button>

        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-48 px-8 max-w-5xl mx-auto text-center space-y-12">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center justify-center w-24 h-24 bg-cobalt rounded-[2.5rem] shadow-3xl shadow-cobalt/20 mb-8"
        >
           <Shield size={40} strokeWidth={1.5} className="text-white" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-serif font-light italic leading-none"
        >
          艺术创作者公约
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-white/40 font-serif italic max-w-3xl mx-auto leading-relaxed"
        >
          “在数字鸿沟与感官泛滥的时代，我们共同拟定这一准则，旨在守护创意的净土，重申艺术作为文明刻度的神圣性。”
        </motion.p>
      </section>

      {/* Core Principles */}
      <section className="max-w-6xl mx-auto px-8 mt-48 space-y-32">
        <div className="grid md:grid-cols-2 gap-16 md:gap-32">
          {principles.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="space-y-8 group"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all duration-500">
                {p.icon}
              </div>
              <h3 className="text-3xl font-serif font-light italic text-white group-hover:text-cobalt transition-colors">{p.title}</h3>
              <p className="text-lg text-white/30 font-light leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Manifesto */}
        <section className="bg-white/5 backdrop-blur-md rounded-[4rem] p-12 md:p-24 border border-white/10 space-y-16">
           <div className="flex flex-col md:flex-row items-center gap-8 justify-between border-b border-white/10 pb-12">
              <h2 className="text-4xl font-serif font-light italic">Manifesto Detail</h2>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-6 py-2 bg-cobalt text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                    v2.0 ACTIVE
                 </div>
              </div>
           </div>

           <div className="prose prose-invert max-w-none grid md:grid-cols-2 gap-16">
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <ScrollText className="text-cobalt shrink-0" />
                    <div>
                       <h4 className="text-xl font-serif italic text-white mb-2">准则一：版权归属 (Ownership)</h4>
                       <p className="text-white/40 font-light leading-relaxed">
                          每一处线条，每一段代码，每一个色彩的堆叠，都是灵魂的私有印记。在 artiqore，我们通过分布式账本技术，为您的每一份创意草稿提供无可置辩的时间戳证明。
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <PenTool className="text-cobalt shrink-0" />
                    <div>
                       <h4 className="text-xl font-serif italic text-white mb-2">准则二：反对劣币 (Against Infringing)</h4>
                       <p className="text-white/40 font-light leading-relaxed">
                          我们决不允许机械平庸的复刻。社区引入了 AI 溯源引擎，全天候对比全球图库，将任何试图通过低级模仿获利的投机者拒之门外。
                       </p>
                    </div>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <Eye className="text-cobalt shrink-0" />
                    <div>
                       <h4 className="text-xl font-serif italic text-white mb-2">准则三：透明激励 (Transparent Rewards)</h4>
                       <p className="text-white/40 font-light leading-relaxed">
                          商业化的过程必须阳光化。任何联名、售卖或拍卖过程，创作者均拥有最终知情权与决策权，平台佣金将被严格限制在合理水平以回馈创作。
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <CheckCircle2 className="text-cobalt shrink-0" />
                    <div>
                       <h4 className="text-xl font-serif italic text-white mb-2">准则四：生态优先 (Global Ecology)</h4>
                       <p className="text-white/40 font-light leading-relaxed">
                          艺术不应成为环境的负担。我们优先扶持使用可持续材料、低碳运算以及关注社区福祉的创意项目。
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </section>

      {/* Footer Call to Action */}
      <section className="max-w-4xl mx-auto px-8 mt-48 text-center space-y-12">
         <h2 className="text-4xl md:text-5xl font-serif font-light italic leading-tight">
           成为准则的守护者，<br />签署您的姓名
         </h2>
         <p className="text-white/30 font-light tracking-widest uppercase text-xs">JOIN 124,000+ CREATORS ALREADY SIGNED</p>
         
         <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
           <button className="w-full md:w-auto px-16 py-6 bg-cobalt text-white rounded-2xl text-xs font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-3xl shadow-cobalt/20">
             在线提交签署
           </button>
           <button className="w-full md:w-auto px-16 py-6 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
             下载完整 PDF
           </button>
         </div>
      </section>
    </div>
  );
};
