export const dynamic = "force-dynamic";

import { getYoutubeConfig } from "@/lib/site";
import Link from "next/link";
import { fetchYoutubeVideos } from "@/lib/youtube";

async function fetchSermons(query: string, pageToken = "") {
  const cfg = await getYoutubeConfig();
  return fetchYoutubeVideos({
    apiKey: cfg.apiKey,
    channelInput: cfg.channelId,
    maxResults: 12,
    query,
    pageToken,
  });
}

export default async function SermonPage({
  searchParams,
}: {
  searchParams: { q?: string; pageToken?: string };
}) {
  const q = searchParams.q || "";
  const pageToken = searchParams.pageToken || "";
  const { items, nextPageToken } = await fetchSermons(q, pageToken);

  return (
    <div className="container-page section-space">
      {/* 히어로 배너 */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#0f1f3d] px-6 py-10 text-white sm:px-8 sm:py-12 md:mb-8 md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">SERMON</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">말씀</h1>
          <p className="mt-3 text-sm font-medium text-sky-300 md:text-base">하나님의 말씀을 통해 함께 성장하는 교회</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            매주 선포되는 말씀을 영상으로 만나보세요. 언제 어디서든 은혜의 자리로 초대합니다.
          </p>
        </div>
      </div>

      {/* 검색 폼 */}
      <form className="mb-6 flex gap-2" action="/sermon">
        <input
          name="q"
          defaultValue={q}
          className="admin-input"
          placeholder="제목 검색"
        />
        <button className="admin-btn shrink-0">검색</button>
      </form>

      {/* 영상 그리드 */}
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">
          표시할 설교 영상이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((s: any) => (
            <Link
              key={s.id}
              href={`https://www.youtube.com/watch?v=${s.id}`}
              target="_blank"
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative overflow-hidden">
                <img
                  src={s.thumbnail}
                  alt={s.title}
                  className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 재생 아이콘 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60">
                    <svg className="h-4 w-4 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-2.5 sm:p-3">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-900 sm:text-sm">
                  {s.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(s.publishedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 다음 페이지 */}
      {nextPageToken && (
        <div className="mt-8 text-center">
          <Link
            href={`/sermon?q=${encodeURIComponent(q)}&pageToken=${nextPageToken}`}
            className="admin-btn inline-flex"
          >
            더보기
          </Link>
        </div>
      )}
    </div>
  );
}
