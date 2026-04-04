export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { HeroSlider } from "@/components/site/hero-slider";
import { SermonGrid } from "@/components/site/sermon-grid";
import { WeeklyBulletin } from "@/components/site/weekly-bulletin";
import { getYoutubeConfig } from "@/lib/site";
import { fetchYoutubeVideos } from "@/lib/youtube";
import { ArrowRight, Pin } from "lucide-react";

async function getSermons() {
  const cfg = await getYoutubeConfig();
  try {
    const { items } = await fetchYoutubeVideos({
      apiKey: cfg.apiKey,
      channelInput: cfg.channelId,
      maxResults: 5,
    });
    return items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [
    { data: _banners },
    { data: _worship },
    { data: _notices },
    { data: _gallery },
    sermons,
    { data: _bulletin },
  ] = await Promise.all([
    supabaseAdmin.from("banners").select("*").eq("is_active", true).order("order").order("id", { ascending: false }).limit(5),
    supabaseAdmin.from("worship_schedules").select("*").order("order"),
    supabaseAdmin.from("notices").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("gallery_posts").select("*, images:gallery_post_images(*)").order("created_at", { ascending: false }).limit(6),
    getSermons(),
    supabaseAdmin.from("bulletins").select("*").eq("is_active", true).order("bulletin_date", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const banners = _banners ?? [];
  const worship = _worship ?? [];
  const notices = _notices ?? [];
  const gallery = _gallery ?? [];

  const isNew = (date: string) => Date.now() - new Date(date).getTime() < 24 * 60 * 60 * 1000;

  const extract = (value: string) => {
    const [dayPartRaw, timePartRaw] = value.split("|").map((s) => s.trim());
    const timeParts = (timePartRaw || "").split(" ").filter(Boolean);
    const meridiem = timeParts[0] || "";
    const time = timeParts[1] || timePartRaw || "";
    return { day: dayPartRaw || value, meridiem, time };
  };

  return (
    <>
      <HeroSlider banners={banners} />

      {/* Vision / Motto Section */}
      <section className="bg-white py-6 md:py-10">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-block rounded-full bg-[#1a2744] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              2026 교회 비전
            </span>
            <h2 className="text-xl font-extrabold leading-snug text-[#1a2744] sm:text-2xl md:text-4xl">
              말씀 안에서 다시 세워지고
              <br />
              <span className="relative mt-1 inline-block">
                세상을 향해 나아가는 교회
                <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#f5c842]" />
              </span>
            </h2>
            <p className="mt-4 text-xs font-medium tracking-wide text-slate-500 sm:text-sm md:mt-5 md:text-base">
              A Church Renewed by the Word, Moving Forward to the World
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Bulletin Section */}
      {_bulletin && <WeeklyBulletin bulletin={_bulletin} />}

      {/* Sermon Section */}
      <section className="py-6 md:py-10 bg-[#f8f9fb]">
        <div className="container-page">
          <div className="mb-6 flex items-end justify-between md:mb-8">
            <div>
              <p className="section-title-en">SERMON</p>
              <h2 className="section-title-ko">최신 설교</h2>
            </div>
            <Link
              href="/sermon"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2744] hover:opacity-70 transition-opacity"
            >
              더보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <SermonGrid sermons={sermons} />
        </div>
      </section>

      {/* Worship Section */}
      <section className="py-6 md:py-10 bg-white">
        <div className="container-page">
          <p className="section-title-en">WORSHIP</p>
          <h2 className="section-title-ko">예배 안내</h2>

          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-5 md:gap-4">
            {worship.map((w: any) => {
              const meta = extract(w.day_and_time);
              return (
                <article
                  key={w.id}
                  className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  {/* 상단 컬러 라인 */}
                  <div
                    className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl"
                    style={{ backgroundColor: w.accent_color }}
                  />

                  {/* 요일 레이블 */}
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {meta.day}
                  </p>

                  {/* 예배명 */}
                  <p className="mt-1.5 text-[13px] font-bold leading-snug text-[#1a2744]">
                    {w.name}
                  </p>

                  {/* 시간 */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-normal tracking-tight text-[#1a2744]">
                      {meta.time || meta.meridiem}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                      {meta.meridiem && meta.time ? meta.meridiem : ""}
                    </span>
                  </div>

                  {/* 장소 */}
                  <p className="mt-1 text-[10px] text-slate-400">{w.location}</p>

                  {/* 대표예배 배지 */}
                  {w.is_featured && (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f5c842] px-2 py-0.5 text-[8px] font-bold tracking-wider text-[#1a2744]">
                      대표
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notice & Gallery Section */}
      <section className="py-6 md:py-10 bg-[#f8f9fb]">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-2">

            {/* 공지사항 */}
            <div>
              <div className="mb-5 flex items-end justify-between md:mb-6">
                <div>
                  <p className="section-title-en">NOTICE</p>
                  <h2 className="section-title-ko">공지사항</h2>
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a2744] hover:opacity-70 transition-opacity"
                >
                  더보기 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="space-y-2">
                {notices.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/news/${n.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-3.5 shadow-sm transition-all duration-150 hover:border-slate-200 hover:shadow-md sm:px-5 sm:py-4"
                    >
                      {n.is_pinned ? (
                        <Pin className="h-3.5 w-3.5 flex-none text-[#1a2744]" />
                      ) : (
                        <span className="h-1.5 w-1.5 flex-none rounded-full bg-slate-300 transition-colors group-hover:bg-[#1a2744]" />
                      )}
                      <span className="flex-1 truncate text-sm font-medium text-slate-800 group-hover:text-[#1a2744]">
                        {n.title}
                        {isNew(n.created_at) && (
                          <span className="ml-2 inline-flex h-4 items-center rounded bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                            N
                          </span>
                        )}
                      </span>
                      <span className="flex-none text-xs text-slate-400">
                        {new Date(n.created_at).toLocaleDateString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
                {notices.length === 0 && (
                  <li className="rounded-xl bg-white px-5 py-8 text-center text-sm text-slate-400 shadow-sm">
                    등록된 공지사항이 없습니다.
                  </li>
                )}
              </ul>
            </div>

            {/* 갤러리 */}
            <div>
              <div className="mb-5 flex items-end justify-between md:mb-6">
                <div>
                  <p className="section-title-en">GALLERY</p>
                  <h2 className="section-title-ko">갤러리</h2>
                </div>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a2744] hover:opacity-70 transition-opacity"
                >
                  더보기 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {gallery.slice(0, 6).map((post) => (
                  <Link
                    key={post.id}
                    href="/gallery"
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    {post.images?.[0]?.url ? (
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200" />
                    )}
                    <div className="absolute inset-0 flex items-end bg-black/0 p-2 opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100">
                      <p className="truncate text-[11px] font-medium leading-tight text-white">
                        {post.title}
                      </p>
                    </div>
                    {isNew(post.created_at) && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-4 items-center rounded bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                        N
                      </span>
                    )}
                  </Link>
                ))}
                {gallery.length === 0 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-200" />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#1a2744] py-7 md:py-10">
        <div className="container-page text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f5c842]">사이공 베델교회</p>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl md:text-3xl">
            함께 예배드리러 오세요
          </h2>
          <p className="mt-3 text-sm text-white/60 md:text-base">
            We'd love to worship together with you
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-8">
            <Link
              href="/about"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#1a2744] transition-colors hover:bg-white/90"
            >
              교회 소개
            </Link>
            <Link
              href="/location"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              오시는 길
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
