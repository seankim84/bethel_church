import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bulletins")
    .select("*")
    .eq("is_active", true)
    .order("bulletin_date", { ascending: false })
    .limit(1)
    .single();

  if (error) return NextResponse.json({ bulletin: null });
  return NextResponse.json({ bulletin: data });
}
