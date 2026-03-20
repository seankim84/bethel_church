import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_PROJECT_URL!;
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY!;

/**
 * 서버 전용 Supabase 클라이언트 (service role — 전체 권한)
 * API Route / Server Action 에서만 사용하세요. 절대 클라이언트 번들에 포함시키지 마세요.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) =>
      fetch(url, { ...options, cache: "no-store" }),
  },
});

/** Storage 버킷 이름 */
export const STORAGE_BUCKET = "images";

/**
 * Supabase Storage 에 업로드된 파일의 공개 URL 을 반환합니다.
 * @param storagePath  버킷 내부 경로 (예: "gallery/1234567890.webp")
 */
export function getStorageUrl(storagePath: string): string {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Supabase Storage 에서 파일을 삭제합니다.
 * @param storagePath  버킷 내부 경로
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
}

/**
 * Public URL 에서 버킷 내부 경로(storagePath)만 추출합니다.
 * 삭제 시 사용합니다.
 *
 * 예)
 *   https://xxx.supabase.co/storage/v1/object/public/images/gallery/abc.webp
 *   → "gallery/abc.webp"
 */
export function extractStoragePath(publicUrl: string): string {
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  return idx !== -1 ? publicUrl.slice(idx + marker.length) : publicUrl;
}
