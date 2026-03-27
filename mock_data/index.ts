/**
 * 艺见心 APP - 统一 Mock 数据管理中心
 * Unified Mock Data Management Center
 * 
 * 用途：为 APP 和 Web 端提供统一的模拟数据
 * 功能模块：院校/案例/申请/市场/个人中心
 */

// ==================== 类型定义 ====================

// 用户类型
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role: 'student' | 'artist' | 'mentor';
  country: string;
  targetSchools: string[];
  portfolioCount: number;
  followers: number;
  following: number;
}

// 院校类型
export interface School {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  city: string;
  logo: string;
  coverImage: string;
  qsRank: number;
  artRank: number;
  description: string;
  website: string;
  tuitionRange: { min: number; max: number; currency: string };
  programs: Program[];
  facilities: string[];
  alumni: Alumni[];
  images: string[];
}

// 专业类型
export interface Program {
  id: string;
  schoolId: string;
  name: string;
  nameEn: string;
  degree: '本科' | '硕士' | '博士';
  duration: string;
  language: string;
  tuition: number;
  description: string;
  requirements: string[];
  portfolioRequirements: string[];
  careerProspects: string[];
  courses: string[];
}

// 校友类型
export interface Alumni {
  id: string;
  name: string;
  avatar: string;
  graduationYear: number;
  program: string;
  achievement: string;
}

// 案例/帖子类型
export interface Post {
  id: string;
  type: 'offer' | 'portfolio' | 'article' | 'question';
  author: User;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  collections: number;
  createdAt: string;
  isLiked: boolean;
  isCollected: boolean;
}

// 作品集类型
export interface Portfolio {
  id: string;
  author: User;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  category: string;
  style: string;
  software: string[];
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

// 导师类型
export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  school: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  price: number;
  availability: string[];
  bio: string;
}

// 申请任务类型
export interface ApplicationTask {
  id: string;
  title: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  category: string;
}

// 申请进度类型
export interface ApplicationProgress {
  id: string;
  schoolName: string;
  programName: string;
  status: 'preparing' | 'submitted' | 'interview' | 'offer' | 'rejected';
  progress: number;
  tasks: ApplicationTask[];
  updatedAt: string;
}

// 艺术资源/文旅类型
export interface ArtResource {
  id: string;
  type: 'tour' | 'camp' | 'course' | 'exhibition';
  title: string;
  coverImage: string;
  location: string;
  duration: string;
  price: number;
  description: string;
  highlights: string[];
  instructor?: string;
  maxParticipants: number;
  currentParticipants: number;
}

// 艺术品交易类型
export interface Artwork {
  id: string;
  title: string;
  artist: User;
  images: string[];
  category: string;
  style: string;
  dimensions: string;
  material: string;
  price: number;
  description: string;
  year: number;
  isAuction: boolean;
  auctionEndTime?: string;
  currentBid?: number;
  likes: number;
  views: number;
}

// 问答类型
export interface QAList {
  id: string;
  question: string;
  answer: string;
  author: User;
  answers: QAAnswer[];
  tags: string[];
  views: number;
  createdAt: string;
}

export interface QAAnswer {
  id: string;
  author: User;
  content: string;
  likes: number;
  isAccepted: boolean;
  createdAt: string;
}

// 资讯类型
export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  views: number;
  publishedAt: string;
}

// ==================== Mock 数据 ====================

// 当前用户
export const currentUser: User = {
  id: 'user_001',
  nickname: '艺术追梦人',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artseeker',
  role: 'student',
  country: '中国',
  targetSchools: ['皇家艺术学院', '罗德岛设计学院'],
  portfolioCount: 12,
  followers: 256,
  following: 89,
};

// 院校数据
export const schools: School[] = [
  {
    id: 'school_001',
    name: '皇家艺术学院',
    nameEn: 'Royal College of Art',
    country: '英国',
    city: '伦敦',
    logo: 'https://via.placeholder.com/100x100/4074b1/FFFFFF?text=RCA',
    coverImage: 'https://via.placeholder.com/800x400/183b90/FFFFFF?text=RCA+Campus',
    qsRank: 1,
    artRank: 1,
    description: '全球顶尖艺术与设计学院，提供硕士和博士课程，以研究型教学闻名。',
    website: 'https://www.rca.ac.uk',
    tuitionRange: { min: 28000, max: 45000, currency: 'GBP' },
    programs: [
      {
        id: 'prog_001',
        schoolId: 'school_001',
        name: '视觉传达设计',
        nameEn: 'Visual Communication',
        degree: '硕士',
        duration: '2年',
        language: '英语',
        tuition: 32000,
        description: '探索视觉传达的边界，培养创新思维和跨学科能力。',
        requirements: ['本科学位', '作品集', '雅思6.5'],
        portfolioRequirements: ['展示创意思维', '包含实验性作品', '体现技术能力'],
        careerProspects: ['品牌设计师', '艺术总监', '独立艺术家'],
        courses: ['批判性思维', '视觉叙事', '数字媒体'],
      },
      {
        id: 'prog_002',
        schoolId: 'school_001',
        name: '室内设计',
        nameEn: 'Interior Design',
        degree: '硕士',
        duration: '2年',
        language: '英语',
        tuition: 35000,
        description: '培养具有批判性思维和创新能力的室内设计师。',
        requirements: ['本科学位', '作品集', '雅思6.5'],
        portfolioRequirements: ['空间设计作品', '材料研究', '概念发展'],
        careerProspects: ['室内设计师', '展览设计师', '空间策划'],
        courses: ['空间理论', '材料创新', '可持续设计'],
      },
    ],
    facilities: ['专业工作室', '3D打印实验室', '材料图书馆', '展览空间'],
    alumni: [
      { id: 'alumni_001', name: '詹姆斯·戴森', avatar: '', graduationYear: 1970, program: '家具设计', achievement: '戴森公司创始人' },
      { id: 'alumni_002', name: '大卫·霍克尼', avatar: '', graduationYear: 1962, program: '绘画', achievement: '著名波普艺术家' },
    ],
    images: [
      'https://via.placeholder.com/400x300/4074b1/FFFFFF?text=Studio',
      'https://via.placeholder.com/400x300/425691/FFFFFF?text=Gallery',
    ],
  },
  {
    id: 'school_002',
    name: '罗德岛设计学院',
    nameEn: 'Rhode Island School of Design',
    country: '美国',
    city: '普罗维登斯',
    logo: 'https://via.placeholder.com/100x100/425691/FFFFFF?text=RISD',
    coverImage: 'https://via.placeholder.com/800x400/4074b1/FFFFFF?text=RISD+Campus',
    qsRank: 3,
    artRank: 2,
    description: '美国最古老的艺术设计学院之一，以严谨的学术和创造性教育著称。',
    website: 'https://www.risd.edu',
    tuitionRange: { min: 55000, max: 60000, currency: 'USD' },
    programs: [
      {
        id: 'prog_003',
        schoolId: 'school_002',
        name: '插画',
        nameEn: 'Illustration',
        degree: '本科',
        duration: '4年',
        language: '英语',
        tuition: 58000,
        description: '培养具有独特视觉语言的插画师。',
        requirements: ['高中成绩', '作品集', '托福93'],
        portfolioRequirements: ['观察绘画', '创意作品', '素描基础'],
        careerProspects: ['插画师', '概念艺术家', '出版设计'],
        courses: ['绘画基础', '数字插画', '叙事插画'],
      },
    ],
    facilities: ['木工坊', '纺织工作室', '玻璃工坊', '金属工作室'],
    alumni: [
      { id: 'alumni_003', name: '妮可拉·本纳基', avatar: '', graduationYear: 2012, program: '插画', achievement: '纽约时报畅销插画家' },
    ],
    images: [
      'https://via.placeholder.com/400x300/183b90/FFFFFF?text=Campus',
      'https://via.placeholder.com/400x300/4074b1/FFFFFF?text=Workshop',
    ],
  },
  {
    id: 'school_003',
    name: '中央圣马丁',
    nameEn: 'Central Saint Martins',
    country: '英国',
    city: '伦敦',
    logo: 'https://via.placeholder.com/100x100/5A8FC9/FFFFFF?text=CSM',
    coverImage: 'https://via.placeholder.com/800x400/425691/FFFFFF?text=CSM+Campus',
    qsRank: 2,
    artRank: 3,
    description: '伦敦艺术大学下属学院，以时装设计和纯艺术闻名。',
    website: 'https://www.arts.ac.uk',
    tuitionRange: { min: 22000, max: 35000, currency: 'GBP' },
    programs: [],
    facilities: [],
    alumni: [],
    images: [],
  },
  {
    id: 'school_004',
    name: '帕森斯设计学院',
    nameEn: 'Parsons School of Design',
    country: '美国',
    city: '纽约',
    logo: 'https://via.placeholder.com/100x100/A8C4E0/FFFFFF?text=Parsons',
    coverImage: 'https://via.placeholder.com/800x400/5A8FC9/FFFFFF?text=Parsons+Campus',
    qsRank: 4,
    artRank: 4,
    description: '纽约著名设计学院，时装设计专业全球领先。',
    website: 'https://www.newschool.edu/parsons',
    tuitionRange: { min: 50000, max: 55000, currency: 'USD' },
    programs: [],
    facilities: [],
    alumni: [],
    images: [],
  },
];

// 帖子/案例数据
export const posts: Post[] = [
  {
    id: 'post_001',
    type: 'offer',
    author: {
      id: 'user_002',
      nickname: '设计新星',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer',
      role: 'student',
      country: '中国',
      targetSchools: ['RCA'],
      portfolioCount: 8,
      followers: 1200,
      following: 45,
    },
    title: 'RCA视觉传达Offer到手！分享我的申请经验',
    content: '经过一年的准备，终于拿到了梦校的offer！分享一些作品集准备和面试的经验...',
    images: [
      'https://via.placeholder.com/400x300/4074b1/FFFFFF?text=Offer+Letter',
      'https://via.placeholder.com/400x300/425691/FFFFFF?text=Portfolio',
    ],
    tags: ['RCA', '视觉传达', '申请经验', 'Offer'],
    likes: 256,
    comments: 48,
    collections: 132,
    createdAt: '2024-03-20T10:00:00Z',
    isLiked: false,
    isCollected: true,
  },
  {
    id: 'post_002',
    type: 'portfolio',
    author: {
      id: 'user_003',
      nickname: '插画师小林',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=illustrator',
      role: 'artist',
      country: '中国',
      targetSchools: ['RISD'],
      portfolioCount: 15,
      followers: 3400,
      following: 120,
    },
    title: '我的RISD插画作品集分享',
    content: '整理了申请RISD时的作品集，包含观察绘画和创意项目...',
    images: [
      'https://via.placeholder.com/400x500/183b90/FFFFFF?text=Illustration1',
      'https://via.placeholder.com/400x500/4074b1/FFFFFF?text=Illustration2',
      'https://via.placeholder.com/400x500/425691/FFFFFF?text=Illustration3',
    ],
    tags: ['RISD', '插画', '作品集', '观察绘画'],
    likes: 892,
    comments: 156,
    collections: 567,
    createdAt: '2024-03-18T14:30:00Z',
    isLiked: true,
    isCollected: true,
  },
  {
    id: 'post_003',
    type: 'question',
    author: {
      id: 'user_004',
      nickname: '留学小白',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie',
      role: 'student',
      country: '中国',
      targetSchools: [],
      portfolioCount: 0,
      followers: 5,
      following: 23,
    },
    title: '申请RCA的作品集需要准备多久？',
    content: '我现在大二，想申请RCA的硕士，请问大家作品集都准备了多长时间？',
    images: [],
    tags: ['RCA', '作品集', '申请规划'],
    likes: 12,
    comments: 28,
    collections: 3,
    createdAt: '2024-03-22T09:15:00Z',
    isLiked: false,
    isCollected: false,
  },
  {
    id: 'post_004',
    type: 'article',
    author: {
      id: 'user_005',
      nickname: '留学导师Amy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor',
      role: 'mentor',
      country: '英国',
      targetSchools: [],
      portfolioCount: 0,
      followers: 5600,
      following: 89,
    },
    title: '2024年艺术留学趋势分析报告',
    content: '根据最新数据，今年艺术留学呈现以下趋势：跨学科项目增加、可持续设计受关注...',
    images: ['https://via.placeholder.com/800x400/4074b1/FFFFFF?text=Trends'],
    tags: ['留学趋势', '行业分析', '2024'],
    likes: 445,
    comments: 67,
    collections: 890,
    createdAt: '2024-03-15T16:00:00Z',
    isLiked: true,
    isCollected: true,
  },
];

// 作品集数据
export const portfolios: Portfolio[] = [
  {
    id: 'portfolio_001',
    author: {
      id: 'user_003',
      nickname: '插画师小林',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=illustrator',
      role: 'artist',
      country: '中国',
      targetSchools: ['RISD'],
      portfolioCount: 15,
      followers: 3400,
      following: 120,
    },
    title: '城市记忆',
    description: '通过插画记录城市的变迁与记忆，探索人与空间的关系。',
    coverImage: 'https://via.placeholder.com/600x400/183b90/FFFFFF?text=City+Memory',
    images: [
      'https://via.placeholder.com/800x600/183b90/FFFFFF?text=Work1',
      'https://via.placeholder.com/800x600/4074b1/FFFFFF?text=Work2',
      'https://via.placeholder.com/800x600/425691/FFFFFF?text=Work3',
    ],
    category: '插画',
    style: '叙事性插画',
    software: ['Photoshop', 'Procreate'],
    views: 3456,
    likes: 892,
    comments: 156,
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'portfolio_002',
    author: {
      id: 'user_006',
      nickname: '建筑设计师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=architect',
      role: 'artist',
      country: '中国',
      targetSchools: ['AA'],
      portfolioCount: 6,
      followers: 1200,
      following: 45,
    },
    title: '垂直森林',
    description: '探索城市高密度住宅与自然生态的融合方案。',
    coverImage: 'https://via.placeholder.com/600x400/425691/FFFFFF?text=Vertical+Forest',
    images: [
      'https://via.placeholder.com/800x600/425691/FFFFFF?text=Render1',
      'https://via.placeholder.com/800x600/183b90/FFFFFF?text=Render2',
    ],
    category: '建筑设计',
    style: '参数化设计',
    software: ['Rhino', 'Grasshopper', 'V-Ray'],
    views: 2100,
    likes: 567,
    comments: 89,
    createdAt: '2024-03-12T14:00:00Z',
  },
];

// 导师数据
export const mentors: Mentor[] = [
  {
    id: 'mentor_001',
    name: '张教授',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professor',
    title: 'RCA视觉传达导师',
    school: '皇家艺术学院',
    specialties: ['视觉传达', '品牌设计', '数字媒体'],
    experience: '10年教学经验，曾任教于多所国际知名院校',
    rating: 4.9,
    reviewCount: 128,
    price: 800,
    availability: ['周一', '周三', '周五'],
    bio: '专注于视觉传达设计与品牌策略研究，帮助数百名学生进入梦校。',
  },
  {
    id: 'mentor_002',
    name: '李老师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    title: 'RISD插画导师',
    school: '罗德岛设计学院',
    specialties: ['插画', '绘本', '概念艺术'],
    experience: '8年教学经验，出版多部绘本作品',
    rating: 4.8,
    reviewCount: 96,
    price: 600,
    availability: ['周二', '周四', '周六'],
    bio: '资深插画家，作品曾入选博洛尼亚童书展，擅长指导学生发展个人风格。',
  },
  {
    id: 'mentor_003',
    name: '王建筑师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    title: 'AA建筑联盟导师',
    school: 'AA建筑联盟',
    specialties: ['建筑设计', '参数化设计', '城市设计'],
    experience: '12年教学经验，知名事务所合伙人',
    rating: 4.9,
    reviewCount: 156,
    price: 1000,
    availability: ['周一', '周二', '周四'],
    bio: '专注于参数化设计与可持续建筑，帮助学生建立独特的设计思维。',
  },
];

// 申请进度数据
export const applicationProgress: ApplicationProgress[] = [
  {
    id: 'app_001',
    schoolName: '皇家艺术学院',
    programName: '视觉传达设计',
    status: 'submitted',
    progress: 40,
    tasks: [
      { id: 'task_001', title: '准备作品集', deadline: '2024-01-15', status: 'completed', priority: 'high', category: '材料准备' },
      { id: 'task_002', title: '撰写个人陈述', deadline: '2024-01-20', status: 'completed', priority: 'high', category: '文书' },
      { id: 'task_003', title: '提交申请', deadline: '2024-02-01', status: 'completed', priority: 'high', category: '申请' },
      { id: 'task_004', title: '准备面试', deadline: '2024-03-15', status: 'in_progress', priority: 'high', category: '面试' },
    ],
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'app_002',
    schoolName: '罗德岛设计学院',
    programName: '插画',
    status: 'offer',
    progress: 100,
    tasks: [
      { id: 'task_005', title: '准备作品集', deadline: '2024-01-10', status: 'completed', priority: 'high', category: '材料准备' },
      { id: 'task_006', title: '提交申请', deadline: '2024-01-15', status: 'completed', priority: 'high', category: '申请' },
      { id: 'task_007', title: '面试', deadline: '2024-02-20', status: 'completed', priority: 'high', category: '面试' },
      { id: 'task_008', title: '收到Offer', deadline: '2024-03-01', status: 'completed', priority: 'high', category: '结果' },
    ],
    updatedAt: '2024-03-01T09:00:00Z',
  },
];

// 艺术文旅资源
export const artResources: ArtResource[] = [
  {
    id: 'resource_001',
    type: 'tour',
    title: '伦敦艺术深度游',
    coverImage: 'https://via.placeholder.com/600x400/183b90/FFFFFF?text=London+Tour',
    location: '英国伦敦',
    duration: '7天6晚',
    price: 25800,
    description: '深度探访伦敦顶级博物馆、画廊，参访RCA、CSM等名校。',
    highlights: ['大英博物馆导览', '泰特现代美术馆', 'RCA校园参访', '艺术家工作室探访'],
    maxParticipants: 15,
    currentParticipants: 8,
  },
  {
    id: 'resource_002',
    type: 'camp',
    title: '托斯卡纳写生营',
    coverImage: 'https://via.placeholder.com/600x400/425691/FFFFFF?text=Tuscany+Camp',
    location: '意大利托斯卡纳',
    duration: '10天9晚',
    price: 19800,
    description: '在意大利文艺复兴发源地，跟随名师进行写生创作。',
    highlights: ['风景写生', '油画创作', '艺术史讲座', '酒庄品鉴'],
    instructor: '意大利美术学院教授',
    maxParticipants: 12,
    currentParticipants: 5,
  },
  {
    id: 'resource_003',
    type: 'course',
    title: '帕森斯暑期课程',
    coverImage: 'https://via.placeholder.com/600x400/4074b1/FFFFFF?text=Parsons+Summer',
    location: '美国纽约',
    duration: '4周',
    price: 45000,
    description: '体验帕森斯设计学院夏校，获得官方学分和证书。',
    highlights: ['时装设计', '平面设计', '纽约艺术探索', '作品集指导'],
    maxParticipants: 20,
    currentParticipants: 12,
  },
];

// 艺术品数据
export const artworks: Artwork[] = [
  {
    id: 'artwork_001',
    title: '城市印象 No.1',
    artist: {
      id: 'user_007',
      nickname: '青年艺术家A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist1',
      role: 'artist',
      country: '中国',
      targetSchools: [],
      portfolioCount: 8,
      followers: 456,
      following: 34,
    },
    images: ['https://via.placeholder.com/600x800/183b90/FFFFFF?text=Artwork1'],
    category: '油画',
    style: '抽象表现',
    dimensions: '80x100cm',
    material: '布面油画',
    price: 12000,
    description: '探索城市变迁中的情感记忆，用色彩表达都市生活的节奏。',
    year: 2024,
    isAuction: false,
    likes: 234,
    views: 1234,
  },
  {
    id: 'artwork_002',
    title: '自然韵律',
    artist: {
      id: 'user_008',
      nickname: '青年艺术家B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist2',
      role: 'artist',
      country: '中国',
      targetSchools: [],
      portfolioCount: 12,
      followers: 678,
      following: 56,
    },
    images: ['https://via.placeholder.com/600x800/4074b1/FFFFFF?text=Artwork2'],
    category: '水彩',
    style: '写实',
    dimensions: '40x60cm',
    material: '纸面水彩',
    price: 5800,
    description: '捕捉自然界的微妙变化，展现生命的律动。',
    year: 2024,
    isAuction: true,
    auctionEndTime: '2024-04-01T20:00:00Z',
    currentBid: 6200,
    likes: 189,
    views: 876,
  },
];

// 问答数据
export const qaList: QAList[] = [
  {
    id: 'qa_001',
    question: 'RCA和RISD的插画专业哪个更适合我？',
    answer: '',
    author: {
      id: 'user_009',
      nickname: '纠结的申请者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=confused',
      role: 'student',
      country: '中国',
      targetSchools: ['RCA', 'RISD'],
      portfolioCount: 3,
      followers: 12,
      following: 45,
    },
    answers: [
      {
        id: 'answer_001',
        author: {
          id: 'user_005',
          nickname: '留学导师Amy',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor',
          role: 'mentor',
          country: '英国',
          targetSchools: [],
          portfolioCount: 0,
          followers: 5600,
          following: 89,
        },
        content: 'RCA更侧重概念性和批判性思维，RISD更注重技法和叙事能力。建议根据你的创作风格选择。',
        likes: 45,
        isAccepted: true,
        createdAt: '2024-03-20T10:00:00Z',
      },
    ],
    tags: ['RCA', 'RISD', '插画', '选校'],
    views: 1234,
    createdAt: '2024-03-19T14:00:00Z',
  },
];

// 资讯数据
export const newsList: News[] = [
  {
    id: 'news_001',
    title: 'RCA 2024申请截止日期延期通知',
    summary: '由于申请人数过多，RCA决定延长部分专业的申请截止日期。',
    content: '完整内容...',
    coverImage: 'https://via.placeholder.com/800x400/4074b1/FFFFFF?text=RCA+News',
    category: '院校动态',
    tags: ['RCA', '申请', '截止日期'],
    views: 5678,
    publishedAt: '2024-03-22T10:00:00Z',
  },
  {
    id: 'news_002',
    title: '2024年全球艺术院校排名发布',
    summary: 'QS最新发布2024年艺术与设计院校排名，RCA连续第10年蝉联榜首。',
    content: '完整内容...',
    coverImage: 'https://via.placeholder.com/800x400/425691/FFFFFF?text=Ranking',
    category: '行业资讯',
    tags: ['排名', 'QS', '艺术院校'],
    views: 8901,
    publishedAt: '2024-03-20T16:00:00Z',
  },
];

// ==================== 数据获取函数 ====================

// 获取院校列表
export const getSchools = (filters?: { country?: string; program?: string }) => {
  if (!filters) return schools;
  return schools.filter(school => {
    if (filters.country && school.country !== filters.country) return false;
    if (filters.program && !school.programs.some(p => p.name.includes(filters.program!))) return false;
    return true;
  });
};

// 获取院校详情
export const getSchoolById = (id: string) => schools.find(s => s.id === id);

// 获取帖子列表
export const getPosts = (type?: Post['type']) => {
  if (!type) return posts;
  return posts.filter(p => p.type === type);
};

// 获取作品集列表
export const getPortfolios = (category?: string) => {
  if (!category) return portfolios;
  return portfolios.filter(p => p.category === category);
};

// 获取导师列表
export const getMentors = (specialty?: string) => {
  if (!specialty) return mentors;
  return mentors.filter(m => m.specialties.includes(specialty));
};

// 获取申请进度
export const getApplicationProgress = () => applicationProgress;

// 获取艺术资源
export const getArtResources = (type?: ArtResource['type']) => {
  if (!type) return artResources;
  return artResources.filter(r => r.type === type);
};

// 获取艺术品列表
export const getArtworks = (category?: string) => {
  if (!category) return artworks;
  return artworks.filter(a => a.category === category);
};

// 获取问答列表
export const getQAList = () => qaList;

// 获取资讯列表
export const getNews = (category?: string) => {
  if (!category) return newsList;
  return newsList.filter(n => n.category === category);
};

// 获取当前用户
export const getCurrentUser = () => currentUser;

// ==================== 导出所有数据 ====================
export default {
  currentUser,
  schools,
  posts,
  portfolios,
  mentors,
  applicationProgress,
  artResources,
  artworks,
  qaList,
  newsList,
  getSchools,
  getSchoolById,
  getPosts,
  getPortfolios,
  getMentors,
  getApplicationProgress,
  getArtResources,
  getArtworks,
  getQAList,
  getNews,
  getCurrentUser,
};
