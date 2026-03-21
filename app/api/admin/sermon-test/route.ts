import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveChannelId } from "@/lib/youtube";

export async function GET() {
  // DB에서 직접 읽어서 실제 저장 값 확인
  const { data: rows, error: dbError } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .in("key", ["youtube_channel_id", "youtube_api_key"]);

  if (dbError) {
    return NextResponse.json({ ok: false, message: `DB 오류: ${dbError.message}` });
  }

  const map: Record<string, string> = {};
  for (const row of rows ?? []) map[row.key] = row.value;

  const channelInput = map["youtube_channel_id"] ?? "";
  const apiKey = map["youtube_api_key"] ?? "";

  if (!channelInput || !apiKey) {
    return NextResponse.json({
      ok: false,
      message: `DB에 저장된 값이 비어있습니다. 저장 버튼을 다시 눌러주세요.`,
    });
  }

  // 채널 ID 해석 (channels API, 1유닛)
  const channelId = await resolveChannelId(apiKey, channelInput).catch(() => "");
  if (!channelId) {
    return NextResponse.json({
      ok: false,
      message: `채널을 찾을 수 없습니다.\n입력값: "${channelInput}"\n\nYouTube Studio > 채널 설정 > 채널 고급 설정에서 UC로 시작하는 채널 ID를 복사해주세요.`,
    });
  }

  // playlistItems API로 영상 조회 (1유닛, search 100유닛 대신)
  const playlistId = "UU" + channelId.slice(2);
  const params = new URLSearchParams({
    key: apiKey,
    playlistId,
    part: "snippet",
    maxResults: "1",
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
    { cache: "no-store" }
  );
  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data?.error || data);
    const errCode = data?.error?.code || res.status;
    return NextResponse.json({
      ok: false,
      message: `채널 인식 성공 (${channelId})\n영상 조회 실패 [${errCode}]: ${errMsg}`,
    });
  }

  const title = data.items?.[0]?.snippet?.title;
  if (!title) {
    return NextResponse.json({
      ok: false,
      message: `채널 인식 성공 (${channelId})\n채널에 공개된 영상이 없거나 업로드 목록이 비어있습니다.`,
    });
  }

  return NextResponse.json({ ok: true, message: `✅ 연결 성공!\n최신 영상: ${title}` });
}
