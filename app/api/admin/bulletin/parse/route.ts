import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthSession } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl1, imageUrl2 } = await req.json();
  if (!imageUrl1) return NextResponse.json({ error: "이미지 URL이 필요합니다." }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }, { status: 500 });

  const anthropic = new Anthropic({ apiKey });

  const content: Anthropic.MessageParam["content"] = [];

  // 이미지 추가 (URL 방식)
  const addImage = async (url: string) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: contentType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: base64,
      },
    });
  };

  await addImage(imageUrl1);
  if (imageUrl2) await addImage(imageUrl2);

  content.push({
    type: "text",
    text: `이 주보 이미지에서 다음 항목들을 추출해줘. 정확히 JSON 형식으로만 답변해줘 (다른 설명 없이 JSON만):
{
  "worship_service": "예배 봉사 내용 (사회, 기도, 찬양, 봉헌, 성경봉독, 설교 등 역할과 담당자를 줄바꿈으로 구분)",
  "church_news": "교회 소식 내용",
  "prayer_requests": "함께 나누는 기도 내용",
  "sermon_notes": "주일 말씀 / 설교 제목, 본문, 내용 등"
}
항목이 주보에 없으면 빈 문자열("")로 반환해줘. 한국어로 추출해줘.`,
  });

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "주보 내용을 파싱하지 못했습니다." }, { status: 500 });

  try {
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "JSON 파싱 실패" }, { status: 500 });
  }
}
