import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { supabaseAdmin, STORAGE_BUCKET, getStorageUrl } from "@/lib/supabase";
import sharp from "sharp";

/**
 * 업로드 컨텍스트별 최대 해상도 & 리사이즈 방식
 *
 * - banner  : 가로 1920 / 세로 640 (커버 크롭) — 배너는 비율 고정이 중요
 * - gallery : 가로 1400 이하 (비율 유지) — 고해상도 사진도 깨끗하게
 * - notice  : 가로 1200 이하 (비율 유지) — 공지용 첨부 이미지
 * - default : 가로 1200 이하 (비율 유지)
 *
 * WebP quality 85 → JPEG 대비 약 25–40% 용량 절감, 육안 차이 없음
 */
const CONTEXTS: Record<
  string,
  { width: number; height?: number; fit: "inside" | "cover" }
> = {
  banner:  { width: 1920, height: 640, fit: "cover"  },
  gallery: { width: 1400,              fit: "inside" },
  notice:  { width: 1200,              fit: "inside" },
  default: { width: 1200,              fit: "inside" },
};

const WEBP_QUALITY = 85;

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file    = formData.get("file")    as File   | null;
  const context = (formData.get("context") as string) || "default";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // 허용 MIME 타입 검사
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const cfg = CONTEXTS[context] ?? CONTEXTS.default;

  // sharp 로 리사이즈 + WebP 변환
  const optimized = await sharp(raw)
    .resize(cfg.width, cfg.height ?? undefined, {
      fit:                cfg.fit,
      position:           "centre",
      withoutEnlargement: true,   // 원본보다 크게 키우지 않음
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // Supabase Storage 업로드
  const storagePath = `${context}/${Date.now()}.webp`;
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, optimized, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    console.error("[upload] Supabase Storage error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: getStorageUrl(storagePath) });
}
