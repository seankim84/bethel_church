-- ================================================================
-- 사이공 베델교회 — Supabase Schema
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- ================================================================

-- 관리자 계정
CREATE TABLE IF NOT EXISTS admin_users (
  id           SERIAL PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 메인 배너
CREATE TABLE IF NOT EXISTS banners (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  image_url   TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  "order"     INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_pinned  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공지사항 첨부 이미지
CREATE TABLE IF NOT EXISTS notice_images (
  id        SERIAL PRIMARY KEY,
  url       TEXT NOT NULL,
  notice_id INT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  "order"   INT DEFAULT 0
);

-- 예배 일정
CREATE TABLE IF NOT EXISTS worship_schedules (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  day_and_time TEXT NOT NULL,
  location     TEXT NOT NULL,
  description  TEXT,
  "order"      INT DEFAULT 0,
  is_featured  BOOLEAN DEFAULT FALSE,
  icon_name    TEXT DEFAULT 'book-open',
  accent_color TEXT DEFAULT '#3b82f6'
);

-- 갤러리 게시물
CREATE TABLE IF NOT EXISTS gallery_posts (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT DEFAULT '기타',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 갤러리 이미지
CREATE TABLE IF NOT EXISTS gallery_post_images (
  id      SERIAL PRIMARY KEY,
  url     TEXT NOT NULL,
  post_id INT NOT NULL REFERENCES gallery_posts(id) ON DELETE CASCADE,
  "order" INT DEFAULT 0
);

-- 사이트 설정 (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  id    SERIAL PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT ''
);

-- ================================================================
-- RLS (Row Level Security) — 테이블을 공개 읽기 전용으로 설정
-- 쓰기는 service_role 키를 통해서만 가능합니다.
-- ================================================================
ALTER TABLE banners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용 (anon)
CREATE POLICY "public read banners"           ON banners           FOR SELECT USING (true);
CREATE POLICY "public read notices"           ON notices           FOR SELECT USING (true);
CREATE POLICY "public read notice_images"     ON notice_images     FOR SELECT USING (true);
CREATE POLICY "public read worship_schedules" ON worship_schedules FOR SELECT USING (true);
CREATE POLICY "public read gallery_posts"     ON gallery_posts     FOR SELECT USING (true);
CREATE POLICY "public read gallery_images"    ON gallery_post_images FOR SELECT USING (true);
CREATE POLICY "public read site_settings"     ON site_settings     FOR SELECT USING (true);
-- admin_users 는 공개 읽기 차단 (service_role 만 접근)
