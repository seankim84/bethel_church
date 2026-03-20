"use client";

import { useEffect, useState } from "react";

type Map = Record<string, string>;

const textFields = [
  ["church_name", "교회명"],
  ["church_subtitle", "부제"],
  ["motto_2026", "2026 표어"],
  ["address", "주소"],
  ["phone", "전화"],
  ["about_text", "교회 소개 (한 줄)"],
  ["offering_account", "헌금 계좌 안내"],
] as const;

const textareaFields = [
  ["pastor_greeting", "담임목사 인사말"],
  ["senior_pastor_greeting", "원로목사 인사말"],
] as const;

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Map>({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      const map = (d.items || []).reduce((a: Map, c: any) => ({ ...a, [c.key]: c.value }), {});
      setValues(map);
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setMsg(res.ok ? "저장되었습니다." : "저장 실패");
    setSaving(false);
  }

  async function uploadImage(key: string, file?: File) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.url) setValues((v) => ({ ...v, [key]: res.url }));
  }

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">기본 정보 관리</h1>

      {/* 기본 정보 */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">교회 기본 정보</h2>
        {textFields.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-sm text-slate-600">{label}</label>
            <input className="admin-input" value={values[key] || ""} onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* 담임목사 */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">담임목사</h2>
        <div>
          <label className="mb-1 block text-sm text-slate-600">이름</label>
          <input className="admin-input" value={values.pastor_name || ""} onChange={(e) => set("pastor_name", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">인사말</label>
          <textarea
            className="admin-input min-h-[180px] resize-y"
            value={values.pastor_greeting || ""}
            onChange={(e) => set("pastor_greeting", e.target.value)}
            placeholder="담임목사 인사말을 입력하세요"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">사진</label>
          <input type="file" accept="image/*" onChange={(e) => uploadImage("pastor_image_url", e.target.files?.[0])} />
          {values.pastor_image_url && (
            <img src={values.pastor_image_url} alt="담임목사" className="mt-2 h-28 rounded-lg object-cover" />
          )}
        </div>
      </div>

      {/* 원로목사 */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">원로목사</h2>
        <div>
          <label className="mb-1 block text-sm text-slate-600">이름</label>
          <input className="admin-input" value={values.senior_pastor || ""} onChange={(e) => set("senior_pastor", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">인사말</label>
          <textarea
            className="admin-input min-h-[180px] resize-y"
            value={values.senior_pastor_greeting || ""}
            onChange={(e) => set("senior_pastor_greeting", e.target.value)}
            placeholder="원로목사 인사말을 입력하세요"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">사진</label>
          <input type="file" accept="image/*" onChange={(e) => uploadImage("senior_pastor_image_url", e.target.files?.[0])} />
          {values.senior_pastor_image_url && (
            <img src={values.senior_pastor_image_url} alt="원로목사" className="mt-2 h-28 rounded-lg object-cover" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="admin-btn" onClick={save} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}
