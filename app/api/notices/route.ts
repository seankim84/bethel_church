import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthSession } from "@/auth";
import type { Notice } from "@/lib/db";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") || "20");

  const { data, error } = await supabaseAdmin
    .from("notices")
    .select("*, images:notice_images(*)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 이미지 order 정렬
  const items = (data as Notice[]).map((n) => ({
    ...n,
    images: (n.images ?? []).sort((a, b) => a.order - b.order),
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const imageUrls: string[] = Array.isArray(body.images) ? body.images : [];

  // 공지 생성
  const { data: notice, error: noticeError } = await supabaseAdmin
    .from("notices")
    .insert({ title: body.title, content: body.content, is_pinned: !!body.isPinned })
    .select()
    .single<Notice>();

  if (noticeError) return NextResponse.json({ error: noticeError.message }, { status: 500 });

  // 이미지 연결
  if (imageUrls.length > 0) {
    await supabaseAdmin.from("notice_images").insert(
      imageUrls.map((url, i) => ({ url, notice_id: notice!.id, order: i }))
    );
  }

  // 최종 조회 (이미지 포함)
  const { data: full } = await supabaseAdmin
    .from("notices")
    .select("*, images:notice_images(*)")
    .eq("id", notice!.id)
    .single();

  return NextResponse.json(full);
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const imageUrls: string[] = Array.isArray(body.images) ? body.images : [];

  // 공지 수정
  const { error: updateError } = await supabaseAdmin
    .from("notices")
    .update({ title: body.title, content: body.content, is_pinned: !!body.isPinned, updated_at: new Date().toISOString() })
    .eq("id", body.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 기존 이미지 삭제 후 재등록
  await supabaseAdmin.from("notice_images").delete().eq("notice_id", body.id);
  if (imageUrls.length > 0) {
    await supabaseAdmin.from("notice_images").insert(
      imageUrls.map((url, i) => ({ url, notice_id: body.id, order: i }))
    );
  }

  // 최종 조회
  const { data: full } = await supabaseAdmin
    .from("notices")
    .select("*, images:notice_images(*)")
    .eq("id", body.id)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  const { error } = await supabaseAdmin.from("notices").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
