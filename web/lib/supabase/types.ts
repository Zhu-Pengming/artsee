// Supabase 数据库类型定义

export type Database = {
  public: {
    Tables: {
      schools: {
        Row: School
        Insert: {
          slug: string
          name_zh: string
          name_en?: string | null
          country?: string | null
          city?: string | null
          school_type?: string | null
          qs_art_rank?: number | null
          qs_art_design_rank?: number | null
          official_website?: string | null
          website?: string | null
          logo_url?: string | null
          status?: string | null
        }
        Update: Partial<Omit<School, 'id'>>
      }
      programs: {
        Row: Program
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>
      }
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
  }
}

export type School = {
  id: number
  slug: string
  name_zh: string
  name_en: string | null
  country: string | null
  city: string | null
  school_type: string | null
  qs_art_rank: number | null
  qs_art_design_rank: number | null
  official_website: string | null
  website: string | null
  logo_url: string | null
  status: string | null
}

export type Program = {
  id: number
  school_id: number
  program_name: string
  degree_type: string | null
  degree_full_name: string | null
  program_category: string | null
  duration_text: string | null
  duration_months: number | null
  study_mode: Record<string, unknown> | null
  intake_months: Record<string, unknown> | null
  requires_portfolio: boolean
  requires_interview: boolean
  requires_personal_statement: boolean
  minimum_education: Record<string, unknown> | null
  program_overview: string | null
  program_highlights: string | null
  core_courses: string | null
  career_paths: string | null
  admission_summary: Record<string, unknown> | null
  cover_image_url: string | null
  status: string | null
  is_recommended: boolean
  created_at: string
  updated_at: string
  // joined
  schools?: School
  program_admissions?: ProgramAdmission[]
  program_fees?: ProgramFee[]
}

export type ProgramAdmission = {
  id: number
  program_id: number
  portfolio_requirements: string | null
  portfolio_format: Record<string, unknown> | null
  ielts_overall: number | null
  ielts_subscores: Record<string, unknown> | null
  toefl_ibt: number | null
  other_language_tests: string | null
  interview_format: Record<string, unknown> | null
  reference_count: number | null
  academic_requirements: string | null
  regular_deadline: string | null
  priority_deadline: string | null
  deadline_notes: string | null
}

export type ProgramFee = {
  id: number
  program_id: number
  international_tuition_fee: number | null
  domestic_tuition_fee: number | null
  currency_code: string | null
  additional_fees_note: string | null
}

export type Case = {
  id: string
  author_id: string
  title: string
  undergrad: string | null
  gpa: string | null
  target_school: string | null
  target_program: string | null
  result: 'admitted' | 'waitlisted' | 'rejected'
  content: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_gradient: string | null
  is_anonymous: boolean
  tags: string[]
  year: string | null
  like_count: number
  comment_count: number
  save_count: number
  view_count: number
  status: string
  created_at: string
  // joined
  user_profiles?: UserProfile
}

export type Post = {
  id: string
  author_id: string
  type: 'question' | 'discussion' | 'news'
  title: string
  content: string | null
  tags: string[]
  like_count: number
  answer_count: number
  view_count: number
  is_mentor_post: boolean
  status: string
  created_at: string
  // joined
  user_profiles?: UserProfile
}

export type PostReply = {
  id: string
  post_id: string
  author_id: string
  content: string
  like_count: number
  created_at: string
  user_profiles?: UserProfile
}

export type ApplicationTracker = {
  id: string
  user_id: string
  school_name: string
  program_name: string
  program_id: number | null
  tier: 'reach' | 'match' | 'safety'
  status: 'planning' | 'preparing' | 'submitted' | 'interview' | 'admitted' | 'rejected' | 'waitlisted'
  deadline: string | null
  notes: string | null
  created_at: string
}

export type UserProfile = {
  id: string
  nickname: string | null
  avatar_url: string | null
  phone: string | null
  user_type: string | null
  bio: string | null
  location: string | null
  following_count: number
  followers_count: number
  artworks_count: number
  favorites_count: number
  is_verified: boolean
  is_premium: boolean
  role: string | null
  created_at: string
  
  // 用户画像字段 (20+ fields)
  user_role: string | null
  target_degree: string | null
  current_education_stage: string | null
  interested_categories: string[] | null
  target_directions: string[] | null
  target_majors: string[] | null
  target_countries: string[] | null
  school_type_preference: string[] | null
  ranking_sensitivity: string | null
  city_preference: string | null
  portfolio_status: string | null
  portfolio_style_tendency: string[] | null
  english_test_type: string | null
  english_test_score: string | null
  other_languages: Record<string, unknown> | null
  total_budget_range: string | null
  scholarship_need: string | null
  family_support_level: string | null
  target_intake: string | null
  current_school: string | null
  current_major: string | null
  gpa_or_grade: string | null
  favorite_artists_or_styles: string | null
  priority_factors: string[] | null
  profile_completion_score: number | null
  onboarding_completed_at: string | null
  updated_at: string | null
}

export type UserFavorite = {
  id: number
  user_id: string
  program_id: number
  note: string | null
  created_at: string
}
