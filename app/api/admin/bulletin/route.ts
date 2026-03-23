import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthSession } from "@/auth";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bulletins")
    .select("*")
    .order("bulletin_date", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { data: bulletin, error } = await supabaseAdmin
    .from("bulletins")
    .insert({
      title: body.title,
      bulletin_date: body.bulletin_date,
      image_url_1: body.image_url_1 || null,
      image_url_2: body.image_url_2 || null,
      worship_service: body.worship_service || "",
      church_news: body.church_news || "",
      prayer_requests: body.prayer_requests || "",
      sermon_notes: body.sermon_notes || "",
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 공지사항 자동 등록
  const imageUrls: string[] = [];
  if (body.image_url_1) imageUrls.push(body.image_url_1);
  if (body.image_url_2) imageUrls.push(body.image_url_2);

  const { data: notice } = await supabaseAdmin
    .from("notices")
    .insert({ title: body.title, content: "", is_pinned: false })
    .select()
    .single();

  if (notice && imageUrls.length > 0) {
    await supabaseAdmin.from("notice_images").insert(
      imageUrls.map((url, i) => ({ url, notice_id: notice.id, order: i }))
    );
  }

  return NextResponse.json(bulletin);
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { error } = await supabaseAdmin
    .from("bulletins")
    .update({
      title: body.title,
      bulletin_date: body.bulletin_date,
      image_url_1: body.image_url_1 || null,
      image_url_2: body.image_url_2 || null,
      worship_service: body.worship_service || "",
      church_news: body.church_news || "",
      prayer_requests: body.prayer_requests || "",
      sermon_notes: body.sermon_notes || "",
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  const { error } = await supabaseAdmin.from("bulletins").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
