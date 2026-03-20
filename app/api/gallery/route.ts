import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthSession } from "@/auth";
import type { GalleryPost } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gallery_posts")
    .select("*, images:gallery_post_images(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data as GalleryPost[]).map((p) => ({
    ...p,
    images: (p.images ?? []).sort((a, b) => a.order - b.order),
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const imageUrls: string[] = Array.isArray(body.images) ? body.images : [];

  const { data: post, error: postError } = await supabaseAdmin
    .from("gallery_posts")
    .insert({ title: body.title, content: body.content, category: body.category || "기타" })
    .select()
    .single<GalleryPost>();

  if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

  if (imageUrls.length > 0) {
    await supabaseAdmin.from("gallery_post_images").insert(
      imageUrls.map((url, i) => ({ url, post_id: post!.id, order: i }))
    );
  }

  const { data: full } = await supabaseAdmin
    .from("gallery_posts")
    .select("*, images:gallery_post_images(*)")
    .eq("id", post!.id)
    .single();

  return NextResponse.json(full);
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const imageUrls: string[] = Array.isArray(body.images) ? body.images : [];

  const { error: updateError } = await supabaseAdmin
    .from("gallery_posts")
    .update({ title: body.title, content: body.content, category: body.category || "기타", updated_at: new Date().toISOString() })
    .eq("id", body.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabaseAdmin.from("gallery_post_images").delete().eq("post_id", body.id);
  if (imageUrls.length > 0) {
    await supabaseAdmin.from("gallery_post_images").insert(
      imageUrls.map((url, i) => ({ url, post_id: body.id, order: i }))
    );
  }

  const { data: full } = await supabaseAdmin
    .from("gallery_posts")
    .select("*, images:gallery_post_images(*)")
    .eq("id", body.id)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  const { error } = await supabaseAdmin.from("gallery_posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
