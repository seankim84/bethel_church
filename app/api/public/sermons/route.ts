import { NextRequest, NextResponse } from "next/server";
import { getYoutubeConfig } from "@/lib/site";
import { fetchYoutubeVideos } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") || "9");
  const cfg = await getYoutubeConfig();
  const { items } = await fetchYoutubeVideos({
    apiKey: cfg.apiKey,
    channelInput: cfg.channelId,
    maxResults: limit
  });

  return NextResponse.json({ items });
}
