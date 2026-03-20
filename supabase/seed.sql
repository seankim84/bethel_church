-- ================================================================
-- 사이공 베델교회 — 초기 데이터 (Seed)
-- Supabase 대시보드 > SQL Editor 에서 schema.sql 실행 후 이 파일을 실행하세요.
-- ================================================================

-- 예배 일정
INSERT INTO worship_schedules (name, day_and_time, location, "order", is_featured, icon_name, accent_color) VALUES
  ('주일 예배',           '매주 주일 | 오전 11:00', '예배당',  1, TRUE,  'sun',       '#f5c842'),
  ('수요 예배 및 중보기도', '매주 수요일 | 오전 10:00','예배당',  2, FALSE, 'book-open', '#3b82f6'),
  ('구역 예배',           '매주 수요일 | 오전 11:00', '각 구역', 3, FALSE, 'home',      '#10b981'),
  ('초·중·고등부 예배',    '매주 주일 | 오전 9:00',   '교육실',  4, FALSE, 'users',     '#ec4899'),
  ('유치부 / 유년부 예배', '매주 주일 | 오전 11:00',  '교육실',  5, FALSE, 'heart',     '#f97316')
ON CONFLICT DO NOTHING;

-- 메인 배너
INSERT INTO banners (title, subtitle, image_url, "order", is_active) VALUES
  ('말씀으로 회복되는 교회', '2026 사이공 베델교회', '/images/default-banner.jpg', 1, TRUE)
ON CONFLICT DO NOTHING;

-- 사이트 설정
INSERT INTO site_settings (key, value) VALUES
  ('church_name',           '사이공 베델교회'),
  ('church_subtitle',       '호치민–하노이–미얀마–아프리카까지!'),
  ('pastor_name',           '장상진 목사'),
  ('senior_pastor',         '폴 한 (원로목사)'),
  ('motto_2026',            '말씀으로 회복되는 교회 (시편 119:105)'),
  ('address',               '46 Đường số 15, An Phú, Thủ Đức, TP. HCM'),
  ('address_weekly',        '46 Đường số 15, Phường Bình Trưng, Quận 2, TP. HCM'),
  ('phone',                 '093-778-2042'),
  ('maps_lat',              '10.798791'),
  ('maps_lng',              '106.7431602'),
  ('maps_embed_url',        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3918.609565!2d106.7431602!3d10.798791!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527004591d1b9%3A0x81789108de152ac8!2z7IKw7J6R6rWs64u56rWt7ZWY!5e0!3m2!1sko!2s!4v1709800000000!5m2!1sko!2s'),
  ('maps_short_url',        'https://maps.app.goo.gl/asvUGG681viCYYsw9'),
  ('offering_account',      'SHINHAN BANK 700-037-388-595 HAN SANG WOO'),
  ('about_text',            '세계 선교와 베트남 복음 전도를 위해 설립되었습니다.'),
  ('pastor_image_url',      '/images/pastor1.png'),
  ('senior_pastor_image_url','/images/pastor2.png'),
  ('youtube_channel_id',    ''),
  ('youtube_api_key',       '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ================================================================
-- 관리자 계정 — 비밀번호: bethel2026! (bcrypt rounds=12)
-- 배포 후 반드시 관리자 페이지에서 비밀번호를 변경하세요.
-- ================================================================
INSERT INTO admin_users (email, password_hash, name) VALUES
  ('admin@bethel.church', '$2a$12$v7L8PZwbsQHs3DDDycTyr.1WdZ91IgboDaoq1nAOp7dtDfdMDiq.i', '관리자')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
