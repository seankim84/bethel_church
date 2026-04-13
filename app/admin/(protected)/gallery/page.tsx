"use client";

import { useEffect, useRef, useState } from "react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

type GalleryPost = {
  id?: number;
  title: string;
  content: string;
  category: string;
  images: string[];
};

const init: GalleryPost = { title: "", content: "", category: "예배", images: [] };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryPost[]>([]);
  const [form, setForm] = useState<GalleryPost>(init);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const pendingUploadsRef = useRef(0);

  const load = () => fetch("/api/gallery").then((r) => r.json()).then((d) => setItems(d.items || []));
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files) return;
    pendingUploadsRef.current += 1;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("context", "gallery");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const up = await res.json();
        if (res.ok && up?.url) uploaded.push(up.url);
        else if (up?.error) setMsg("업로드 실패: " + up.error);
        else setMsg("업로드 실패: 알 수 없는 오류가 발생했습니다.");
      }
      if (uploaded.length) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      }
    } finally {
      pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current - 1);
      if (pendingUploadsRef.current === 0) setUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((img) => img !== url) }));
  }

  async function save() {
    if (!form.title) return setMsg("제목을 입력하세요.");
    if (pendingUploadsRef.current > 0) return setMsg("이미지 업로드가 완료된 후 저장해주세요.");
    setSaving(true);
    const res = await fetch("/api/gallery", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("저장되었습니다.");
      setForm(init);
      load();
    } else {
      const err = await res.json();
      setMsg("저장 실패: " + (err.error || res.status));
    }
    setSaving(false);
  }

  async function remove(id?: number) {
    if (!id || !confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">갤러리 관리</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <input className="admin-input" placeholder="제목 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="예배">예배</option>
          <option value="행사">행사</option>
          <option value="기타">기타</option>
        </select>
        <TiptapEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
        <div className="space-y-2">
          <p className="text-sm text-slate-600">이미지 첨부 (여러 장 선택 가능)</p>
          <input type="file" multiple accept="image/*" onChange={(e) => upload(e.target.files)} />
          {uploading && <p className="text-xs text-slate-500">이미지 업로드 중입니다...</p>}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {form.images.map((url) => (
                <div key={url} className="rounded border border-slate-200 bg-white p-1">
                  <img src={url} alt="gallery" className="aspect-square w-full rounded object-cover" />
                  <button className="mt-1 w-full rounded bg-red-100 py-1 text-xs text-red-700" onClick={() => removeImage(url)}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <div className="flex gap-2">
          <button className="admin-btn" onClick={save} disabled={saving || uploading}>
            {saving ? "저장 중..." : uploading ? "이미지 업로드 중..." : form.id ? "수정" : "등록"}
          </button>
          {form.id && <button className="rounded-md bg-slate-100 px-4 py-2 text-sm" onClick={() => { setForm(init); setMsg(""); }}>취소</button>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((post: any) => (
          <div key={post.id} className="rounded border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{post.title}</p>
                <p className="text-xs text-slate-400">{post.category} · {new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
              </div>
              {post.images?.[0]?.url && (
                <img src={post.images[0].url} alt={post.title} className="h-14 w-14 flex-none rounded object-cover" />
              )}
            </div>
            {post.images?.length > 1 && (
              <p className="mt-1 text-xs text-slate-400">이미지 {post.images.length}장</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                className="rounded bg-slate-100 px-3 py-1 text-sm"
                onClick={() => {
                  setForm({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    category: post.category,
                    images: (post.images || []).map((img: any) => img.url),
                  });
                  setMsg("");
                }}
              >
                편집
              </button>
              <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700" onClick={() => remove(post.id)}>삭제</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400">등록된 갤러리 게시물이 없습니다.</p>}
      </div>
    </div>
  );
}
