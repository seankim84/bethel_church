# 사이공 베델교회 웹사이트

Next.js 14 + Prisma(SQLite) + NextAuth 기반 풀스택 프로젝트입니다.

## 1) 설치

```bash
npm install
cp .env.example .env
```

`.env`에서 `NEXTAUTH_SECRET`, `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`를 설정하세요.

## 2) DB 준비 + 시드

```bash
npx prisma generate
npx prisma db push
npm run seed
```

## 3) 실행

```bash
npm run dev
```

- 공개 페이지: `/`, `/about`, `/sermon`, `/news`, `/gallery`, `/location`
- 관리자 로그인: `/admin/login`
- 초기 관리자 계정: `admin@bethel.church / bethel2026!`

## 4) 구현 요약

- 공개 사이트 6개 페이지
- 관리자 7개 메뉴 CRUD
- Hero 배너, 공지, 갤러리, 예배 안내 DB 연동
- NextAuth credentials 인증 + `/admin` 보호 미들웨어
- 로컬 업로드(`/public/uploads`) 지원
- YouTube Data API v3 연동(최신 설교/설교 페이지)
