import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchYoutubeVideos, resolveChannelId } from "@/lib/youtube";

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

  const channelId = map["youtube_channel_id"] ?? "(없음)";
  const apiKey = map["youtube_api_key"] ?? "(없음)";
  const hasChannel = !!map["youtube_channel_id"];
  const hasKey = !!map["youtube_api_key"];

  if (!hasChannel || !hasKey) {
    return NextResponse.json({
      ok: false,
      message: `DB에 저장된 값 확인:\n채널 ID: "${channelId}"\nAPI Key: "${apiKey.slice(0, 10)}..."\n\n값이 비어있습니다. 저장 버튼을 다시 눌러주세요.`
    });
  }

  // 채널 ID 해석
  const resolvedChannelId = await resolveChannelId(apiKey, channelId).catch(() => "");
  if (!resolvedChannelId) {
    return NextResponse.json({
      ok: false,
      message: `채널을 찾을 수 없습니다.\n입력값: "${channelId}"\n\nYouTube Studio > 채널 설정 > 채널 고급 설정에서 UC로 시작하는 채널 ID를 복사해주세요.`
    });
  }

  // 영상 조회
  const { items } = await fetchYoutubeVideos({ apiKey, channelInput: resolvedChannelId, maxResults: 1 });
  const title = items[0]?.title;

  if (!title) {
    return NextResponse.json({
      ok: false,
      message: `채널 인식 성공 (${resolvedChannelId})\n하지만 영상을 불러오지 못했습니다.\n\nGoogle Cloud Console에서 YouTube Data API v3가 활성화되어 있는지 확인하세요.`
    });
  }

  return NextResponse.json({ ok: true, message: `✅ 연결 성공!\n최신 영상: ${title}` });
}
