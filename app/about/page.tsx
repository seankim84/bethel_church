export const dynamic = "force-dynamic";

import { getSettingsMap } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";
import { SectionTitle } from "@/components/site/section-title";
import type { WorshipSchedule } from "@/lib/db";

export default async function AboutPage() {
  const [settings, { data: _worship }] = await Promise.all([
    getSettingsMap(),
    supabaseAdmin.from("worship_schedules").select("*").order("order"),
  ]);
  const worship = _worship ?? [];

  return (
    <div className="container-page section-space space-y-10 md:space-y-16">
      {/* ── 교회 소개 히어로 ── */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-[#0f1f3d] px-6 py-10 text-white sm:px-8 sm:py-12 md:px-14 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-white/[0.03]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">ABOUT</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{settings.church_name}</h1>
            <p className="mt-3 text-sm font-medium text-sky-300 md:text-base">{settings.church_subtitle}</p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">{settings.about_text}</p>
          </div>
        </div>

        {/* 3대 핵심 가치 */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">📖</div>
            <h3 className="mt-4 font-bold text-navy">말씀 중심</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">하나님의 말씀 위에 세워지는 예배와 삶의 공동체</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-xl">🙏</div>
            <h3 className="mt-4 font-bold text-navy">기도의 교회</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">중보기도로 하나 되고 성령의 역사를 경험하는 교회</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-xl">🌍</div>
            <h3 className="mt-4 font-bold text-navy">선교의 교회</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">호치민에서 아프리카까지, 복음을 전하는 선교 공동체</p>
          </div>
        </div>
      </section>

      {/* 담임목사 */}
      <section>
        {/* 모바일: 이미지 상단, 텍스트 하단 / 데스크톱: 텍스트 좌측, 이미지 우측 */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
          <div className="w-full flex-shrink-0 md:order-last md:w-64 lg:w-72">
            <img
              src={settings.pastor_image_url || "/images/pastor-placeholder.jpg"}
              alt="담임목사"
              className="h-64 w-full rounded-2xl object-cover object-top sm:h-80 md:h-96"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">담임목사</p>
            <h2 className="mt-2 text-2xl font-bold leading-snug text-navy md:text-3xl">{settings.pastor_name}</h2>
            {settings.pastor_greeting && (
              <p className="mt-5 whitespace-pre-wrap text-sm leading-[1.9] text-slate-600 md:text-[15px]">
                {settings.pastor_greeting}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 원로목사 */}
      {(settings.senior_pastor || settings.senior_pastor_image_url) && (
        <>
          <hr className="border-slate-200" />
          <section>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
              {settings.senior_pastor_image_url && (
                <div className="w-full flex-shrink-0 md:order-last md:w-64 lg:w-72">
                  <img
                    src={settings.senior_pastor_image_url}
                    alt="원로목사"
                    className="h-64 w-full rounded-2xl object-cover object-top sm:h-80 md:h-96"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">원로목사</p>
                <h2 className="mt-2 text-2xl font-bold leading-snug text-navy md:text-3xl">{settings.senior_pastor}</h2>
                {settings.senior_pastor_greeting && (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-[1.9] text-slate-600 md:text-[15px]">
                    {settings.senior_pastor_greeting}
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* 표어 */}
      <section className="rounded-xl bg-navy px-5 py-8 text-center text-white md:px-6 md:py-10">
        <p className="text-xs tracking-[0.2em]">MOTTO 2026</p>
        <p className="mt-3 text-lg font-bold leading-snug md:text-2xl">{settings.motto_2026}</p>
      </section>

      {/* 예배 안내 */}
      <section>
        <SectionTitle en="WORSHIP" ko="예배 안내" />

        {/* 모바일: 카드형 */}
        <div className="space-y-3 sm:hidden">
          {(worship as WorshipSchedule[]).map((w) => (
            <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-bold text-navy">{w.name}</p>
              <p className="mt-1.5 text-sm text-slate-600">{w.day_and_time}</p>
              <p className="mt-0.5 text-sm text-slate-400">{w.location}</p>
            </div>
          ))}
        </div>

        {/* 데스크톱: 테이블형 */}
        <table className="hidden w-full border-collapse text-sm sm:table">
          <tbody>
            {(worship as WorshipSchedule[]).map((w) => (
              <tr key={w.id} className="border-b border-slate-200">
                <td className="py-3 pr-6 font-semibold text-navy">{w.name}</td>
                <td className="py-3 pr-6 text-slate-700">{w.day_and_time}</td>
                <td className="py-3 text-slate-500">{w.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
