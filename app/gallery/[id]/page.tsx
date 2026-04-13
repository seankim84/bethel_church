import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { GalleryPost } from "@/lib/db";
import { PostDetailView } from "@/components/site/post-detail-view";

export default async function GalleryDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return notFound();

  const { data: post } = await supabaseAdmin
    .from("gallery_posts")
    .select("*, images:gallery_post_images(*)")
    .eq("id", id)
    .single<GalleryPost>();

  if (!post) return notFound();

  const images = (post.images ?? []).sort((a, b) => a.order - b.order);

  return (
    <PostDetailView
      backHref="/gallery"
      backLabel="갤러리 목록으로"
      sectionLabel="GALLERY"
      category={post.category}
      title={post.title}
      createdAt={post.created_at}
      contentHtml={post.content}
      images={images}
    />
  );
}
