"use client";

import { useEffect, useState } from "react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

type Notice = {
  id?: number;
  title: string;
  content: string;
  is_pinned: boolean;
  images: string[];
};
const init: Notice = { title: "", content: "", is_pinned: false, images: [] };

export default function AdminNoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [form, setForm] = useState<Notice>(init);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/notices?limit=100").then((r) => r.json()).then((d) => setItems(d.items || []));
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("context", "notice");
      const up = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (up?.url) uploaded.push(up.url);
    }
    if (uploaded.length) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
  }

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((img) => img !== url) }));
  }

  async function save() {
    if (!form.title) return setMsg("제목을 입력하세요.");
    setSaving(true);
    const res = await fetch("/api/notices", {
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
    await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">공지사항 관리</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <input className="admin-input" placeholder="제목 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
          상단 고정
        </label>
        <TiptapEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
        <div className="space-y-2">
          <p className="text-sm text-slate-600">이미지 첨부</p>
          <input type="file" multiple accept="image/*" onChange={(e) => upload(e.target.files)} />
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {form.images.map((url) => (
                <div key={url} className="rounded border border-slate-200 bg-white p-1">
                  <img src={url} alt="notice" className="aspect-square w-full rounded object-cover" />
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
          <button className="admin-btn" onClick={save} disabled={saving}>{saving ? "저장 중..." : form.id ? "수정" : "등록"}</button>
          {form.id && <button className="rounded-md bg-slate-100 px-4 py-2 text-sm" onClick={() => { setForm(init); setMsg(""); }}>취소</button>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((n: any) => (
          <div key={n.id} className="rounded border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {n.is_pinned && <span className="mr-1 inline-block rounded bg-[#1a2744] px-1.5 py-0.5 text-[10px] font-bold text-white">공지</span>}
                {n.title}
              </p>
              <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            {n.images?.length > 0 && (
              <div className="mt-2 flex gap-1">
                {n.images.slice(0, 3).map((img: any) => (
                  <img key={img.id} src={img.url} alt="" className="h-12 w-12 rounded object-cover" />
                ))}
                {n.images.length > 3 && <span className="text-xs text-slate-400 self-end">+{n.images.length - 3}</span>}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button
                className="rounded bg-slate-100 px-3 py-1 text-sm"
                onClick={() => {
                  setForm({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    is_pinned: n.is_pinned,
                    images: (n.images || []).map((img: any) => img.url),
                  });
                  setMsg("");
                }}
              >
                편집
              </button>
              <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700" onClick={() => remove(n.id)}>삭제</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400">등록된 공지사항이 없습니다.</p>}
      </div>
    </div>
  );
}
