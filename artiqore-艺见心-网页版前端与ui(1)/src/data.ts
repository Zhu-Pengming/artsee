import { School, Post } from './types';

export const MOCK_SCHOOLS: School[] = [
  {
    id: '1',
    name: '皇家艺术学院',
    enName: 'Royal College of Art',
    country: '英国',
    city: '伦敦',
    rankings: { qs: 1, artDesign: 1 },
    tuition: '£35,000',
    language: '雅思 7.0',
    difficulty: '冲刺',
    tags: ['纯艺', '设计', '创新'],
    image: 'https://picsum.photos/seed/rca/800/600',
    details: {
      gpa: '3.5+',
      portfolio: '高阶作品集，注重调研过程',
      employmentRate: '92%',
      avgSalary: '£45k',
    }
  },
  {
    id: '2',
    name: '罗德岛设计学院',
    enName: 'RISD',
    country: '美国',
    city: '普罗维登斯',
    rankings: { qs: 3, artDesign: 2 },
    tuition: '$58,000',
    language: '托福 93',
    difficulty: '冲刺',
    tags: ['纯艺', '产品', '平面'],
    image: 'https://picsum.photos/seed/risd/800/600',
    details: {
      gpa: '3.8+',
      portfolio: 'RISD Challenge, 创造力测试',
      employmentRate: '88%',
      avgSalary: ' $65k',
    }
  },
  {
    id: '3',
    name: '中央圣马丁学院',
    enName: 'Central Saint Martins',
    country: '英国',
    city: '伦敦',
    rankings: { qs: 2 },
    tuition: '£28,000',
    language: '雅思 6.5',
    difficulty: '匹配',
    tags: ['时装', '平面', '空间'],
    image: 'https://picsum.photos/seed/csm/800/600',
    details: {
      gpa: '3.2+',
      portfolio: '极具个性的表达，实验精神',
      employmentRate: '85%',
      avgSalary: '£38k',
    }
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { 
      id: 'z1',
      name: '张一墨', 
      avatar: 'https://i.pravatar.cc/150?u=zhang', 
      type: '艺术家',
      bio: '探索古典美学与数字算法的交叉边界。现居上海。',
      followers: 12800,
      following: 245,
      works: 42
    },
    content: '最新系列《青花流转》首发。探讨传统纹样在数字媒介中的解构与重组。#当代艺术 #青花瓷',
    images: ['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800'],
    likes: 1240,
    commentsCount: 89,
    comments: [
      { id: 'c1', author: { name: '晓月', avatar: 'https://i.pravatar.cc/150?u=xiaoyue' }, content: '非常震撼的视觉冲击力！', timestamp: '1小时前' },
      { id: 'c2', author: { name: 'ArtFan', avatar: 'https://i.pravatar.cc/150?u=fan' }, content: '传统与现代的完美结合。', timestamp: '45分钟前' },
    ],
    type: 'work',
    timestamp: '2小时前'
  },
  {
    id: '2',
    author: { 
      id: 'an1',
      name: 'ArtNews Official', 
      avatar: 'https://i.pravatar.cc/150?u=news', 
      type: '机构',
      bio: '全球前沿艺术资讯第一站。',
      followers: 85400,
      following: 12
    },
    content: '2026威尼斯双年展中国馆策展人名单公布。本次主题聚焦“万物共生”。',
    images: ['https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200'],
    likes: 3500,
    commentsCount: 210,
    comments: [
      { id: 'c3', author: { name: '策展探索', avatar: 'https://i.pravatar.cc/150?u=curator' }, content: '期待今年的表现！', timestamp: '2小时前' },
    ],
    type: 'news',
    timestamp: '5小时前'
  },
  {
    id: '3',
    author: { 
      id: 'lvmh1',
      name: 'LVMH 艺术部', 
      avatar: 'https://i.pravatar.cc/150?u=lvmh', 
      type: '品牌',
      bio: '连接艺术与奢侈品，共创非凡体验。',
      followers: 42000,
      following: 56
    },
    content: '【招募】寻找3位具有东方美学底蕴的新锐艺术家，参与2026中秋限量礼盒设计。要求：擅长工笔或传统水墨现代转化。',
    images: ['https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800'],
    likes: 560,
    commentsCount: 45,
    comments: [],
    type: 'opportunity',
    timestamp: '1天前'
  },
  {
    id: '4',
    author: { 
      id: 'cmz1',
      name: '陈默之', 
      avatar: 'https://i.pravatar.cc/150?u=chen', 
      type: '独立策展人',
      bio: '让艺术回归生活，让空间自由呼吸。',
      followers: 5600,
      following: 180,
      works: 12
    },
    content: '在上海西岸美术馆看的这个展真的很精致。光影处理让这些古老的丝绸焕发了二次生命。#西岸美术馆 #丝绸艺术',
    images: ['https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800'],
    likes: 890,
    commentsCount: 34,
    comments: [],
    type: 'exhibition',
    timestamp: '3小时前'
  },
  {
    id: '5',
    author: { id: 'v1', name: 'VOGUE Art', avatar: 'https://i.pravatar.cc/150?u=vogue', type: '机构' },
    content: '深度对谈：当数字时尚遇见古典园林，如何定义“新中式”的未来边界？',
    images: ['https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&q=80&w=800'],
    likes: 2100,
    commentsCount: 156,
    comments: [],
    type: 'news',
    timestamp: '8小时前'
  },
  {
    id: '6',
    author: { id: 's1', name: '索卡艺术', avatar: 'https://i.pravatar.cc/150?u=soka', type: '画廊' },
    content: '北京 798 空间新展预告：《虚实之间》。探讨 VR 交互如何影响我们对雕塑体量的认知。',
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'],
    likes: 420,
    commentsCount: 12,
    comments: [],
    type: 'exhibition',
    timestamp: '12小时前'
  },
  {
    id: '7',
    author: { id: 'l1', name: '林清越', avatar: 'https://i.pravatar.cc/150?u=lin', type: '新锐艺术家' },
    content: '尝试用数据可视化来重绘《千里江山图》，这是第一阶段的局部渲染效果。',
    images: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800'],
    likes: 3200,
    commentsCount: 280,
    comments: [],
    type: 'work',
    timestamp: '昨天'
  },
  {
    id: '8',
    author: { id: 'h1', name: 'Hermès Art Lab', avatar: 'https://i.pravatar.cc/150?u=hermes', type: '品牌' },
    content: '对话工匠精神：传统竹编工艺的现代家具设计尝试。 #爱马仕 #设计研究',
    images: ['https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800'],
    likes: 780,
    commentsCount: 23,
    comments: [],
    type: 'opportunity',
    timestamp: '2天前'
  },
  {
    id: '9',
    author: { id: 'u1', name: 'UCCA', avatar: 'https://i.pravatar.cc/150?u=ucca', type: '机构' },
    content: 'UCCA 商店今日上新：草间弥生波点系列限量藏品。售完即止。',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'],
    likes: 1500,
    commentsCount: 98,
    comments: [],
    type: 'news',
    timestamp: '3天前'
  },
  {
    id: '10',
    author: { id: 'm1', name: '木木美术馆', avatar: 'https://i.pravatar.cc/150?u=m_woods', type: '机构' },
    content: '坂本龙一《观·音》北京站延展通知。还没来得及看的朋友们抓紧最后两周。',
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'],
    likes: 2800,
    commentsCount: 145,
    comments: [],
    type: 'exhibition',
    timestamp: '4天前'
  },
  {
    id: '11',
    author: { 
      id: 'y1',
      name: '陆远', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', 
      type: '建筑师' 
    },
    content: '关于“负建筑”的一次新尝试。在杭州余杭做的一个夯土建筑方案，希望能探讨材料与土地的共生关系。',
    images: ['https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800'],
    likes: 920,
    commentsCount: 56,
    comments: [],
    type: 'work',
    timestamp: '5天前'
  },
  {
    id: '12',
    author: { id: 'az1', name: 'A-Z Gallery', avatar: 'https://i.pravatar.cc/150?u=az_gallery', type: '画廊' },
    content: '新锐群展：【界限之外】。展出十位 Z 世代艺术家的跨媒介实验作品。',
    images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=800'],
    likes: 310,
    commentsCount: 18,
    comments: [],
    type: 'exhibition',
    timestamp: '6天前'
  },
  {
    id: '13',
    author: { id: 'ye1', name: '叶子', avatar: 'https://i.pravatar.cc/150?u=ye', type: '自由插画师' },
    content: '最近的练习。尝试在赛博朋克风格中融入敦煌壁画的配色方案，感觉火花四溅。',
    images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'],
    likes: 4500,
    commentsCount: 320,
    comments: [],
    type: 'work',
    timestamp: '一周前'
  },
  {
    id: '14',
    author: { id: 'p1', name: 'PRADA Mode', avatar: 'https://i.pravatar.cc/150?u=prada', type: '品牌' },
    content: '回望私享俱乐部北京站：艺术与时尚如何在四合院中碰撞出新的火花？',
    images: ['https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=800'],
    likes: 1200,
    commentsCount: 67,
    comments: [],
    type: 'news',
    timestamp: '10天前'
  },
  {
    id: '15',
    author: { id: 'exp1', name: '实验艺术委员会', avatar: 'https://i.pravatar.cc/150?u=exp', type: '机构' },
    content: '全球征稿：2026 年度“科技与艺术融合”大奖。最高奖金 50 万人民币，欢迎踊跃提交方案。',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
    likes: 340,
    commentsCount: 92,
    comments: [],
    type: 'opportunity',
    timestamp: '12天前'
  }
];
