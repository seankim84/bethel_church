"use client";

import { useEffect, useState } from "react";

type GalleryImage = { id: number; url: string; order: number };
type GalleryPost = { id: number; title: string; content: string; category: string; images: GalleryImage[]; created_at: string };
const categories = ["전체", "예배", "행사", "기타"] as const;
const PAGE_SIZE = 9;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export default function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [cat, setCat] = useState<(typeof categories)[number]>("전체");
  const [page, setPage] = useState(1);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setPosts(d.items || []));
  }, []);

  useEffect(() => { setPage(1); }, [cat]);

  const filtered = cat === "전체" ? posts : posts.filter((p) => p.category === cat);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryColor: Record<string, string> = {
    예배: "text-sky-600",
    행사: "text-emerald-600",
    기타: "text-violet-500",
  };

  return (
    <div className="container-page section-space">
      {/* 히어로 배너 */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#0f1f3d] px-8 py-14 text-white md:px-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">GALLERY</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">갤러리</h1>
          <p className="mt-3 text-base font-medium text-sky-300">함께한 순간들을 기록합니다</p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400">예배, 행사, 모임의 소중한 사진들을 모았습니다. 주님 안에서 함께한 아름다운 기억들을 나눕니다.</p>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              cat === c ? "bg-[#0f1f3d] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 카드 목록 */}
      <div className="divide-y divide-slate-100">
        {paged.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-400">게시물이 없습니다.</p>
        )}
        {paged.map((post) => {
          const excerpt = stripHtml(post.content).slice(0, 100);
          const thumb = post.images?.[0]?.url ?? null;
          return (
            <article
              key={post.id}
              className="flex items-start gap-5 py-7 cursor-pointer group"
              onClick={() => thumb && setActiveUrl(thumb)}
            >
              {/* 텍스트 영역 */}
              <div className="flex-1 min-w-0">
                <p className={`mb-2 text-xs font-semibold ${categoryColor[post.category] ?? "text-slate-500"}`}>
                  {post.category}
                </p>
                <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-[#0f1f3d] transition line-clamp-2">
                  {post.title}
                </h2>
                {excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">
                    {excerpt}
                    {stripHtml(post.content).length > 100 ? "…" : ""}
                  </p>
                )}
                <p className="mt-4 text-xs text-slate-400">
                  {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* 썸네일 */}
              {thumb && (
                <div className="flex-none w-28 h-20 overflow-hidden rounded-lg md:w-40 md:h-28">
                  <img
                    src={thumb}
                    alt={post.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                n === page ? "bg-[#0f1f3d] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}

      {/* 이미지 확대 모달 */}
      {activeUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveUrl(null)}
        >
          <img src={activeUrl} alt="확대" className="max-h-[90vh] max-w-full rounded-md" />
        </div>
      ) : null}
    </div>
  );
}
