/**
 * Supabase DB 타입 정의
 * 테이블명은 snake_case (supabase/schema.sql 과 동일)
 */

export type AdminUser = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
};

export type NoticeImage = {
  id: number;
  url: string;
  notice_id: number;
  order: number;
};

export type Notice = {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  images?: NoticeImage[];
};

export type WorshipSchedule = {
  id: number;
  name: string;
  day_and_time: string;
  location: string;
  description: string | null;
  order: number;
  is_featured: boolean;
  icon_name: string;
  accent_color: string;
};

export type GalleryPostImage = {
  id: number;
  url: string;
  post_id: number;
  order: number;
};

export type GalleryPost = {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  images?: GalleryPostImage[];
};

export type SiteSetting = {
  id: number;
  key: string;
  value: string;
};
