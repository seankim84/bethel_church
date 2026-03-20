"use client";

import { useEffect, useState } from "react";

type Worship = {
  id?: number;
  name: string;
  day_and_time: string;
  location: string;
  description?: string;
  order: number;
  is_featured: boolean;
  icon_name: string;
  accent_color: string;
};

const init: Worship = {
  name: "",
  day_and_time: "",
  location: "",
  description: "",
  order: 1,
  is_featured: false,
  icon_name: "book-open",
  accent_color: "#3b82f6",
};

export default function AdminWorshipPage() {
  const [items, setItems] = useState<Worship[]>([]);
  const [form, setForm] = useState<Worship>(init);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/worship").then((r) => r.json()).then((d) => setItems(d.items || []));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name) return setMsg("예배명을 입력하세요.");
    if (!form.day_and_time) return setMsg("요일/시간을 입력하세요.");
    setSaving(true);
    const res = await fetch("/api/worship", {
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
    await fetch(`/api/worship?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">예배 안내 관리</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <input className="admin-input" placeholder="예배명 * (예: 주일 예배)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="admin-input" placeholder="요일/시간 * (예: 매주 주일 | 오전 11:00)" value={form.day_and_time} onChange={(e) => setForm({ ...form, day_and_time: e.target.value })} />
        <input className="admin-input" placeholder="장소 (예: 예배당)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="admin-input" placeholder="설명 (선택)" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="admin-input" type="number" placeholder="순서" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          대표예배 (메인에 크게 표시)
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">아이콘</label>
            <select className="admin-input" value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })}>
              <option value="sun">☀️ sun (주일)</option>
              <option value="book-open">📖 book-open (말씀)</option>
              <option value="home">🏠 home (구역)</option>
              <option value="users">👥 users (청년/학생)</option>
              <option value="heart">❤️ heart (어린이)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">포인트 컬러</label>
            <div className="flex gap-2">
              <input className="admin-input flex-1" type="text" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
              <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-10 w-10 cursor-pointer rounded border border-slate-200 p-1" />
            </div>
          </div>
        </div>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <div className="flex gap-2">
          <button className="admin-btn" onClick={save} disabled={saving}>{saving ? "저장 중..." : form.id ? "수정" : "등록"}</button>
          {form.id && <button className="rounded-md bg-slate-100 px-4 py-2 text-sm" onClick={() => { setForm(init); setMsg(""); }}>취소</button>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((w) => (
          <div key={w.id} className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3 text-sm">
            <div
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ backgroundColor: w.accent_color }}
            >
              {w.order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{w.is_featured ? "⭐ " : ""}{w.name}</p>
              <p className="text-slate-500 truncate">{w.day_and_time} · {w.location}</p>
            </div>
            <div className="flex gap-2 flex-none">
              <button className="rounded bg-slate-100 px-3 py-1" onClick={() => { setForm(w); setMsg(""); }}>편집</button>
              <button className="rounded bg-red-100 px-3 py-1 text-red-700" onClick={() => remove(w.id)}>삭제</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400">등록된 예배 일정이 없습니다.</p>}
      </div>
    </div>
  );
}
