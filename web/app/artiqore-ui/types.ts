// @ts-nocheck
'use client';

export type UserRole = 'consumer' | 'business';
export type UserType = 'student' | 'artist' | 'lover' | 'hotel' | 'luxury' | 'gallery';

export interface BusinessStats {
  projectsCount: number;
  ongoingProjects: number;
  completedProjects: number;
  totalSpent: string;
  artistMatches: number;
  responseRate: string;
}

export interface BusinessProject {
  id: string;
  name: string;
  type: 'exhibition' | 'co-brand' | 'commission' | 'event' | 'residency';
  status: 'recruiting' | 'negotiating' | 'executing' | 'completed' | 'cancelled';
  budget: string;
  applicants: number;
  deadline: string;
  progress: number;
}

export interface School {
  id: string;
  name: string;
  enName: string;
  country: string;
  city: string;
  rankings: {
    qs?: number;
    usNews?: number;
    artDesign?: number;
  };
  tuition: string;
  language: string;
  difficulty: '保底' | '匹配' | '冲刺';
  tags: string[];
  image: string;
  details: {
    gpa: string;
    portfolio: string;
    employmentRate: string;
    avgSalary: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  type: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    type: string;
    bio?: string;
    followers?: number;
    following?: number;
    works?: number;
  };
  content: string;
  images: string[];
  likes: number;
  commentsCount: number;
  comments: Comment[];
  type: 'work' | 'news' | 'exhibition' | 'opportunity';
  timestamp: string;
}
