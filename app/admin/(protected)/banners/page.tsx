"use client";

import { useEffect, useState } from "react";

type Banner = {
  id?: number;
  title: string;
  image_url: string;
  order: number;
  is_active: boolean;
};

const init: Banner = { title: "", image_url: "", order: 1, is_active: true };

export default function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () =>
    fetch("/api/banners")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));

  useEffect(() => { load(); }, []);

  async function upload(file: File) {
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("context", "banner");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      const title = `배너_${Date.now()}`;
      const order = items.length + 1;
      const saveRes = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, image_url: data.url, order, is_active: true }),
      });
      if (saveRes.ok) {
        setMsg("배너가 등록되었습니다.");
        load();
      } else {
        const err = await saveRes.json();
        setMsg("등록 실패: " + (err.error || saveRes.status));
      }
    } else {
      setMsg("업로드 실패: " + (data.error || "알 수 없는 오류"));
    }
    setUploading(false);
  }

  async function toggle(b: Banner) {
    await fetch("/api/banners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, is_active: !b.is_active }),
    });
    load();
  }

  async function remove(id?: number) {
    if (!id || !confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/banners?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">배너 관리</h1>

      {/* 업로드 영역 */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-slate-500 transition hover:border-navy hover:text-navy">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4m0 0l4 4m-4-4v9M4 4h16a2 2 0 012 2v5" />
        </svg>
        <div className="text-center">
          <p className="font-medium">{uploading ? "업로드 중..." : "이미지를 클릭하여 업로드"}</p>
          <p className="mt-1 text-xs text-slate-400">권장 사이즈: 1920 × 640px / JPG, PNG, WebP</p>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </label>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}

      {/* 배너 목록 */}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative">
              <img src={b.image_url} alt="배너" className="h-40 w-full object-cover" />
              {!b.is_active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">비활성</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-xs text-slate-400">순서 {b.order}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${b.is_active ? "text-green-600" : "text-slate-400"}`}>
                  {b.is_active ? "● 표시 중" : "○ 숨김"}
                </span>
                <button
                  onClick={() => toggle(b)}
                  className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  {b.is_active ? "숨기기" : "표시하기"}
                </button>
                <button
                  onClick={() => remove(b.id)}
                  className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !uploading && (
          <p className="col-span-2 text-center text-sm text-slate-400 py-4">등록된 배너가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
