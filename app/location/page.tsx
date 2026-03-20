export const dynamic = "force-dynamic";

import { getSettingsMap } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";
import type { WorshipSchedule } from "@/lib/db";

export default async function LocationPage() {
  const [s, { data: _worship }] = await Promise.all([
    getSettingsMap(),
    supabaseAdmin.from("worship_schedules").select("*").order("order"),
  ]);
  const worship = _worship ?? [];

  return (
    <div className="container-page section-space">
      {/* 히어로 배너 */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#0f1f3d] px-6 py-10 text-white sm:px-8 sm:py-12 md:mb-8 md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">LOCATION</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">오시는 길</h1>
          <p className="mt-3 text-sm font-medium text-sky-300 md:text-base">언제든지 오세요, 문은 언제나 열려 있습니다</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            사이공 베델교회의 위치와 예배 시간을 안내드립니다. 편하게 방문해 주세요.
          </p>
        </div>
      </div>

      {/* 지도 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <iframe
          src={s.maps_embed_url}
          className="h-[280px] w-full sm:h-[360px] md:h-[420px]"
          loading="lazy"
          title="교회 위치"
        />
      </div>

      {/* 주소 / 연락처 */}
      <div className="mt-6 space-y-1.5 text-sm text-slate-700">
        <p className="text-base font-bold text-navy">사이공 베델교회</p>
        <p className="flex items-start gap-2">
          <span className="mt-0.5 flex-none text-slate-400">📍</span>
          <span>{s.address}</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="flex-none text-slate-400">📞</span>
          <a href={`tel:${s.phone}`} className="hover:text-navy hover:underline">{s.phone}</a>
        </p>
      </div>

      {/* 예배 안내 */}
      <div className="mt-10">
        <p className="section-title-en">WORSHIP</p>
        <h2 className="section-title-ko mb-5">예배 시간</h2>

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
      </div>
    </div>
  );
}
