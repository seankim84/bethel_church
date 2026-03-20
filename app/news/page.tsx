"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NoticeImage = { id: number; url: string; order: number };
type Notice = { id: number; title: string; created_at: string; is_pinned: boolean; images: NoticeImage[] };

export default function NewsPage() {
  const [tab, setTab] = useState<"notice" | "offering">("notice");
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetch("/api/notices?limit=100")
      .then((r) => r.json())
      .then((d) => setNotices(d.items || []));
  }, []);

  return (
    <div className="container-page section-space">
      {/* 히어로 배너 */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#0f1f3d] px-6 py-10 text-white sm:px-8 sm:py-12 md:mb-8 md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">NEWS</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">소식</h1>
          <p className="mt-3 text-sm font-medium text-sky-300 md:text-base">교회의 다양한 소식을 전해드립니다</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            공지사항과 헌금 안내 등 사이공 베델교회의 새로운 소식을 확인하세요.
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        <button
          className={`px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${
            tab === "notice"
              ? "border-b-2 border-navy text-navy"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setTab("notice")}
        >
          공지사항
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${
            tab === "offering"
              ? "border-b-2 border-navy text-navy"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setTab("offering")}
        >
          헌금 안내
        </button>
      </div>

      {tab === "notice" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {/* 헤더 — 데스크톱에서만 표시 */}
          <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 sm:grid sm:grid-cols-[72px_1fr_100px]">
            <span className="text-center">번호</span>
            <span className="pl-3">제목</span>
            <span className="text-center">등록일</span>
          </div>

          {/* 목록 */}
          {notices.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">등록된 공지사항이 없습니다.</p>
          ) : (
            notices.map((n, idx) => (
              <Link
                key={n.id}
                href={`/news/${n.id}`}
                className={`block border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 ${
                  n.is_pinned ? "bg-sky-50/40" : ""
                }`}
              >
                {/* 모바일 레이아웃 */}
                <div className="flex items-center gap-3 px-4 py-4 sm:hidden">
                  <span className="flex-none">
                    {n.is_pinned ? (
                      <span className="rounded bg-navy px-2 py-0.5 text-[11px] font-bold text-white">공지</span>
                    ) : (
                      <span className="h-1.5 w-1.5 inline-block rounded-full bg-slate-300" />
                    )}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                    {n.title}
                  </span>
                  <span className="flex-none text-xs text-slate-400 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>

                {/* 데스크톱 레이아웃 */}
                <div className="hidden items-center px-4 py-4 text-sm sm:grid sm:grid-cols-[72px_1fr_100px]">
                  <span className="flex justify-center">
                    {n.is_pinned ? (
                      <span className="rounded bg-navy px-2 py-0.5 text-[11px] font-bold text-white">공지</span>
                    ) : (
                      <span className="text-slate-400">{notices.length - idx}</span>
                    )}
                  </span>
                  <span className="pl-3 font-medium text-slate-800">{n.title}</span>
                  <span className="text-center text-xs text-slate-400">
                    {new Date(n.created_at).toLocaleDateString("ko-KR", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <article className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 md:p-6">
          <p className="font-bold text-navy">SHINHAN BANK 700-037-388-595 HAN SANG WOO</p>
          <p className="mt-4">
            십일조, 주일헌금, 감사헌금, 선교/구제헌금 등은 송금 시 이름과 헌금 항목을 함께 적어주세요.
          </p>
        </article>
      )}
    </div>
  );
}
