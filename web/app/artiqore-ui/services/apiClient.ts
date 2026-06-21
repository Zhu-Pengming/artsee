// @ts-nocheck
'use client';

/**
 * 统一 API 客户端 - 对接 /api/v1/* 后端接口
 * 功能：错误处理、token 管理、请求重试、统一响应格式
 */

type ApiResponse<T = any> = {
  success?: boolean;
  code?: number;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
};

class ApiClient {
  private baseUrl = '';
  private tokenKey = 'artiqore_access_token';

  constructor() {
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
    }
  }

  private getToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(this.tokenKey) || localStorage.getItem('access_token') || '';
  }

  private setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('access_token', token);
  }

  private clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('access_token');
  }

  private async request<T = any>(
    method: string,
    path: string,
    options: {
      body?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      withAuth?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<T> {
    const { body, params, headers = {}, withAuth = false, retry = true } = options;

    // 构建 URL
    let url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.set(key, String(value));
        }
      });
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }

    // 构建 headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (withAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // 发送请求
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 解析响应
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch {
      responseData = {};
    }

    // 处理错误
    const code = responseData.code ?? response.status;
    const message = responseData.message ?? responseData.error;

    // 401 未授权 - 清除 token
    if (code === 401) {
      this.clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // 可选：跳转到登录页
        // window.location.href = '/login';
      }
      throw new ApiError(code, message || '未授权，请重新登录', responseData.requestId);
    }

    // 其他错误
    if (!response.ok || responseData.success === false) {
      throw new ApiError(code, message || `请求失败 ${code}`, responseData.requestId);
    }

    return responseData.data as T;
  }

  async get<T = any>(path: string, params?: Record<string, any>, withAuth = false): Promise<T> {
    return this.request<T>('GET', path, { params, withAuth });
  }

  async post<T = any>(path: string, body?: any, withAuth = false): Promise<T> {
    return this.request<T>('POST', path, { body, withAuth });
  }

  async put<T = any>(path: string, body?: any, withAuth = false): Promise<T> {
    return this.request<T>('PUT', path, { body, withAuth });
  }

  async patch<T = any>(path: string, body?: any, withAuth = false): Promise<T> {
    return this.request<T>('PATCH', path, { body, withAuth });
  }

  async delete<T = any>(path: string, withAuth = true): Promise<T> {
    return this.request<T>('DELETE', path, { withAuth });
  }

  // Token 管理
  saveToken(token: string) {
    this.setToken(token);
  }

  logout() {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 单例
export const apiClient = new ApiClient();

// ============================================
// 认证相关 API
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  is_verified?: boolean;
  created_at?: string;
}

export const authApi = {
  async login(data: LoginRequest) {
    const result = await apiClient.post<{ user: UserProfile; session: any }>('/api/v1/auth/login', data);
    if (result.session?.access_token) {
      apiClient.saveToken(result.session.access_token);
    }
    return result;
  },

  async signup(data: SignupRequest) {
    const result = await apiClient.post<{ user: UserProfile; session: any }>('/api/v1/auth/signup', data);
    if (result.session?.access_token) {
      apiClient.saveToken(result.session.access_token);
    }
    return result;
  },

  async devLogin() {
    const result = await apiClient.post<{ user: UserProfile; session: any }>('/api/v1/auth/dev-login');
    if (result.session?.access_token) {
      apiClient.saveToken(result.session.access_token);
    }
    return result;
  },

  async getProfile() {
    return apiClient.get<UserProfile>('/api/v1/auth/profile', undefined, true);
  },

  async updateProfile(data: Partial<UserProfile>) {
    return apiClient.patch<UserProfile>('/api/v1/auth/profile', data, true);
  },

  async completeOnboarding(data: { userId: string; interestedCategories?: string[] }) {
    return apiClient.post('/api/v1/auth/complete-onboarding', data, true);
  },

  logout() {
    apiClient.logout();
  },
};

// ============================================
// 活动相关 API
// ============================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  city?: string;
  venue?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
  cover_image_url?: string;
  max_participants?: number;
  current_participants?: number;
  status?: string;
}

export const eventsApi = {
  async list(params?: { limit?: number; offset?: number; city?: string; type?: string }) {
    return apiClient.get<Event[]>('/api/v1/events', params);
  },

  async getDetail(id: string) {
    return apiClient.get<Event>(`/api/v1/events/${id}`);
  },

  async apply(eventId: string, formData?: any) {
    return apiClient.post(`/api/v1/events/${eventId}/apply`, formData || {}, true);
  },

  async checkin(eventId: string, ticketCode: string) {
    return apiClient.post(`/api/v1/events/${eventId}/checkin`, { ticket_code: ticketCode }, true);
  },

  async getMyApplications(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/events/applications/me', params, true);
  },
};

// ============================================
// 合作机会相关 API
// ============================================

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  type?: string;
  city?: string;
  budget?: string;
  deadline?: string;
  status?: string;
}

export const opportunitiesApi = {
  async list(params?: { limit?: number; offset?: number; type?: string; city?: string }) {
    return apiClient.get<Opportunity[]>('/api/v1/opportunities', params);
  },

  async getDetail(id: string) {
    return apiClient.get<Opportunity>(`/api/v1/opportunities/${id}`);
  },

  async apply(opportunityId: string, data: { portfolio_ids: string[]; proposal: string; quote?: string }) {
    return apiClient.post(`/api/v1/opportunities/${opportunityId}/apply`, data, true);
  },

  async getMyApplications(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/opportunity-applications/me', params, true);
  },
};

// ============================================
// 通知相关 API
// ============================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  async list(params?: { limit?: number; offset?: number }) {
    return apiClient.get<Notification[]>('/api/v1/notifications', params, true);
  },

  async markRead(id: string) {
    return apiClient.post(`/api/v1/notifications/${id}/read`, {}, true);
  },

  async markAllRead() {
    return apiClient.post('/api/v1/notifications/read-all', {}, true);
  },
};

// ============================================
// 社区相关 API
// ============================================

export interface CommunityPost {
  id: string;
  title?: string;
  body?: string;
  image_urls?: string[];
  status?: 'draft' | 'reviewing' | 'published' | 'hidden' | 'rejected';
  audit_status?: 'pending' | 'approved' | 'reviewing' | 'rejected';
  audit_reason?: string | null;
  author_id: string;
  like_count?: number;
  comment_count?: number;
  created_at?: string;
  user_profiles?: any;
}

export interface Comment {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
  user_profiles?: any;
}

export const communityApi = {
  async getPosts(params?: { limit?: number; offset?: number }) {
    return apiClient.get<CommunityPost[]>('/api/v1/community/posts', params);
  },

  async getPost(id: string) {
    return apiClient.get<CommunityPost>(`/api/v1/community/posts/${id}`);
  },

  async createPost(data: { title: string; body?: string; image_urls?: string[] }) {
    return apiClient.post<CommunityPost>('/api/v1/community/posts', data, true);
  },

  async likePost(id: string) {
    return apiClient.post(`/api/v1/community/posts/${id}/like`, {}, true);
  },

  async unlikePost(id: string) {
    return apiClient.delete(`/api/v1/community/posts/${id}/like`, true);
  },

  async getComments(postId: string, params?: { limit?: number; offset?: number }) {
    return apiClient.get<Comment[]>(`/api/v1/community/posts/${postId}/comments`, params);
  },

  async createComment(postId: string, body: string) {
    return apiClient.post(`/api/v1/community/posts/${postId}/comments`, { body }, true);
  },
};

// ============================================
// 作品相关 API
// ============================================

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_urls?: string[];
  author_id: string;
  category?: string;
  tags?: string[];
  like_count?: number;
  view_count?: number;
  created_at?: string;
}

export const artworksApi = {
  async list(params?: { limit?: number; offset?: number; category?: string }) {
    return apiClient.get<Artwork[]>('/api/v1/artworks', params);
  },

  async getDetail(id: string) {
    return apiClient.get<Artwork>(`/api/v1/artworks/${id}`);
  },

  async create(data: { title: string; description?: string; image_urls?: string[]; category?: string; tags?: string[] }) {
    return apiClient.post('/api/v1/artworks', data, true);
  },

  async update(id: string, data: Partial<Artwork>) {
    return apiClient.patch(`/api/v1/artworks/${id}`, data, true);
  },

  async delete(id: string) {
    return apiClient.delete(`/api/v1/artworks/${id}`, true);
  },

  async like(id: string) {
    return apiClient.post(`/api/v1/artworks/${id}/like`, {}, true);
  },

  async unlike(id: string) {
    return apiClient.delete(`/api/v1/artworks/${id}/like`, true);
  },

  async favorite(id: string) {
    return apiClient.post(`/api/v1/artworks/${id}/favorite`, {}, true);
  },

  async unfavorite(id: string) {
    return apiClient.delete(`/api/v1/artworks/${id}/favorite`, true);
  },

  async getMyArtworks(params?: { limit?: number; offset?: number }) {
    return apiClient.get<Artwork[]>('/api/v1/artworks/me', params, true);
  },
};

// ============================================
// 艺术家相关 API
// ============================================

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  specialty?: string[];
  works_count?: number;
}

export const artistsApi = {
  async list(params?: { limit?: number; offset?: number }) {
    return apiClient.get<Artist[]>('/api/v1/artists', params);
  },

  async getDetail(id: string) {
    return apiClient.get<Artist>(`/api/v1/artists/${id}`);
  },
};

// ============================================
// 其他 API
// ============================================

export const casesApi = {
  async list(params?: { limit?: number; offset?: number; result?: string }) {
    return apiClient.get('/api/v1/cases', params);
  },
};

export const programsApi = {
  async list(params?: { limit?: number; offset?: number; keyword?: string }) {
    return apiClient.get('/api/v1/programs', params);
  },

  async getDetail(id: string) {
    return apiClient.get(`/api/v1/programs/${id}`);
  },
};

export const schoolsApi = {
  async list(params?: { limit?: number; offset?: number; keyword?: string }) {
    return apiClient.get('/api/v1/schools', params);
  },

  async getDetail(id: string) {
    return apiClient.get(`/api/v1/schools/${id}`);
  },
};

export const ordersApi = {
  async getMyOrders(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/orders', params, true);
  },
};

export const aiApi = {
  async consult(query: string, mode = 'chat') {
    return apiClient.post('/api/v1/ai/consult', { query, mode }, true);
  },

  async analyze(institutionIds: string[]) {
    return apiClient.post('/api/v1/ai/analyze', { institutionIds }, true);
  },

  async searchSchools(query: string, limitSchools = 20) {
    return apiClient.post('/api/v1/ai/schools/search', { query, limitSchools }, true);
  },

  async record(conversationId: string, userMessage: string, assistantMessage: string) {
    return apiClient.post('/api/v1/ai/record', { conversationId, userMessage, assistantMessage }, true);
  },
};

// ============================================
// 认证审核相关 API
// ============================================

export interface Verification {
  id: string;
  type: string;
  status: string;
  materials: any;
  review_note?: string;
  created_at: string;
}

export const verificationsApi = {
  async submit(data: { type: string; materials: any }) {
    return apiClient.post('/api/v1/verifications', data, true);
  },

  async getMyVerifications(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/verifications/me', params, true);
  },

  async review(id: string, data: { status: string; review_note?: string }) {
    return apiClient.post(`/api/v1/admin/verifications/${id}/review`, data, true);
  },
};

// ============================================
// 短信验证相关 API
// ============================================

export const smsApi = {
  async sendSms(phone: string, type = 'login') {
    return apiClient.post('/api/v1/auth/send-sms', { phone, type });
  },

  async verifySms(phone: string, code: string) {
    return apiClient.post('/api/v1/auth/verify-sms', { phone, code });
  },
};

// ============================================
// 用户画像相关 API
// ============================================

export const profileApi = {
  async updateProfile(data: any) {
    return apiClient.patch('/api/v1/auth/update-profile', data, true);
  },

  async exportProfile() {
    return apiClient.get('/api/v1/auth/profile/export', undefined, true);
  },

  async getFieldHistory(field: string) {
    return apiClient.get('/api/v1/auth/profile/field-history', { field }, true);
  },
};

// ============================================
// 文件上传相关 API
// ============================================

export const uploadApi = {
  async uploadFile(file: File, folder = 'general') {
    try {
      return await uploadApi.uploadFileToCos(file, folder);
    } catch (error) {
      if (error instanceof ApiError && error.code === 503) {
        return uploadApi.uploadFileLegacy(file, folder);
      }
      throw error;
    }
  },

  async uploadFileToCos(file: File, folder = 'general') {
    const signed = await apiClient.post<any>('/api/v1/uploads/cos/sign', {
      file_name: file.name,
      content_type: file.type || 'application/octet-stream',
      size: file.size,
      scene: folder,
    }, true);

    const uploadResponse = await fetch(signed.upload_url, {
      method: signed.method || 'PUT',
      headers: signed.headers || {},
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`COS 上传失败 ${uploadResponse.status}`);
    }

    const completed = await apiClient.post<any>('/api/v1/uploads/cos/complete', {
      key: signed.key,
      url: signed.public_url,
      bucket: signed.bucket,
      file_type: file.type || null,
      scene: folder,
      size: file.size,
    }, true);

    return {
      ...signed,
      ...completed,
      url: completed?.url || signed.public_url,
      public_url: signed.public_url,
      provider: 'tencent_cos',
    };
  },

  async uploadFileLegacy(file: File, folder = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // 使用原生 fetch，因为需要 FormData。
    const token = typeof window !== 'undefined' ? localStorage.getItem('artiqore_access_token') : '';
    const response = await fetch('/api/v1/upload', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    const data = await response.json();
    return data.data || data;
  },
};

// ============================================
// 知识库搜索相关 API
// ============================================

export const knowledgeApi = {
  async search(query: string, params?: { limit?: number; threshold?: number }) {
    return apiClient.post('/api/v1/knowledge/search', { query, ...params }, true);
  },
};

// ============================================
// 首页内容相关 API
// ============================================

export const homeContentsApi = {
  async list(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/home-contents', params);
  },

  async getDetail(id: string) {
    return apiClient.get(`/api/v1/home-contents/${id}`);
  },
};

// ============================================
// 项目相关 API
// ============================================

export const projectsApi = {
  async getMyProjects(params?: { limit?: number; offset?: number }) {
    return apiClient.get('/api/v1/projects/me', params, true);
  },

  async getProjectStatus(id: string) {
    return apiClient.get(`/api/v1/projects/${id}/status`, undefined, true);
  },

  async updateProjectStatus(id: string, status: string) {
    return apiClient.put(`/api/v1/projects/${id}/status`, { status }, true);
  },
};
