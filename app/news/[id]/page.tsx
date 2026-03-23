import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Notice } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { NoticeImageGallery } from "@/components/site/notice-image-gallery";

export default async function NoticeDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const { data: notice } = await supabaseAdmin
    .from("notices")
    .select("*, images:notice_images(*)")
    .eq("id", id)
    .single<Notice>();

  if (!notice) return notFound();

  const images = (notice.images ?? []).sort((a, b) => a.order - b.order);

  return (
    <div className="container-page section-space">
      {/* 뒤로가기 */}
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </Link>

      {/* 제목 영역 */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        {notice.is_pinned && (
          <span className="mb-2 inline-block rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">
            공지
          </span>
        )}
        <h1 className="text-xl font-bold leading-snug text-navy md:text-2xl">{notice.title}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {new Date(notice.created_at).toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* 첨부 이미지 */}
      {images.length > 0 && (
        <NoticeImageGallery images={images} title={notice.title} />
      )}

      {/* 본문 */}
      <article
        className="prose prose-sm max-w-none md:prose-base"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />
    </div>
  );
}
