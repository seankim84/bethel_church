import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Notice } from "@/lib/db";
import { PostDetailView } from "@/components/site/post-detail-view";

export default async function NoticeDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return notFound();

  const { data: notice } = await supabaseAdmin
    .from("notices")
    .select("*, images:notice_images(*)")
    .eq("id", id)
    .single<Notice>();

  if (!notice) return notFound();

  const images = (notice.images ?? []).sort((a, b) => a.order - b.order);

  return (
    <PostDetailView
      backHref="/news"
      backLabel="공지 목록으로"
      sectionLabel="NOTICE"
      title={notice.title}
      createdAt={notice.created_at}
      contentHtml={notice.content}
      images={images}
      isPinned={notice.is_pinned}
    />
  );
}
