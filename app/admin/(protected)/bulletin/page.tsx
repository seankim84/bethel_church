"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Sparkles } from "lucide-react";

type Bulletin = {
  id?: number;
  title: string;
  bulletin_date: string;
  image_url_1: string;
  image_url_2: string;
  worship_service: string;
  church_news: string;
  prayer_requests: string;
  sermon_notes: string;
};

function getNextSunday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function dateToTitle(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일 주보`;
}

const initForm = (): Bulletin => ({
  title: dateToTitle(getNextSunday()),
  bulletin_date: getNextSunday(),
  image_url_1: "",
  image_url_2: "",
  worship_service: "",
  church_news: "",
  prayer_requests: "",
  sermon_notes: "",
});

export default function AdminBulletinPage() {
  const [items, setItems] = useState<Bulletin[]>([]);
  const [form, setForm] = useState<Bulletin>(initForm());
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const load = () =>
    fetch("/api/admin/bulletin")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));

  useEffect(() => { load(); }, []);

  function setField(key: keyof Bulletin, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDateChange(dateStr: string) {
    setForm((prev) => ({ ...prev, bulletin_date: dateStr, title: dateToTitle(dateStr) }));
  }

  async function runParse(url1: string, url2?: string) {
    setParsing(true);
    setMsg("이미지를 분석하는 중...");
    const res = await fetch("/api/admin/bulletin/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl1: url1, imageUrl2: url2 || undefined }),
    }).then((r) => r.json());

    if (res.error) {
      showMsg("분석 실패: " + res.error, "err");
    } else {
      setForm((prev) => ({
        ...prev,
        worship_service: res.worship_service || prev.worship_service,
        church_news: res.church_news || prev.church_news,
        prayer_requests: res.prayer_requests || prev.prayer_requests,
        sermon_notes: res.sermon_notes || prev.sermon_notes,
      }));
      showMsg("분석 완료! 내용을 확인하고 저장하세요.", "ok");
    }
    setParsing(false);
  }

  async function uploadImage(file: File, slot: 1 | 2) {
    slot === 1 ? setUploading1(true) : setUploading2(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("context", "bulletin");
    const res = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    slot === 1 ? setUploading1(false) : setUploading2(false);

    if (res.url) {
      setField(slot === 1 ? "image_url_1" : "image_url_2", res.url);
      const url1 = slot === 1 ? res.url : form.image_url_1;
      const url2 = slot === 2 ? res.url : form.image_url_2;
      if (url1) await runParse(url1, url2 || undefined);
    } else {
      showMsg("이미지 업로드 실패: " + (res.error || ""), "err");
    }
  }

  async function parse() {
    if (!form.image_url_1) return showMsg("이미지 1을 먼저 업로드하세요.", "err");
    await runParse(form.image_url_1, form.image_url_2 || undefined);
  }

  async function save() {
    if (!form.image_url_1) return showMsg("이미지를 업로드하세요.", "err");
    setSaving(true);
    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/bulletin", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      showMsg("저장되었습니다. 공지사항에도 자동 등록됩니다.", "ok");
      setForm(initForm());
      load();
    } else {
      const err = await res.json();
      showMsg("저장 실패: " + (err.error || ""), "err");
    }
    setSaving(false);
  }

  async function deleteItem(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/bulletin?id=${id}`, { method: "DELETE" });
    load();
  }

  function editItem(b: Bulletin) {
    setForm(b);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showMsg(text: string, type: "ok" | "err") {
    setMsg(text);
    setMsgType(type);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-xl font-bold text-slate-800">주보 관리</h1>

      {/* 폼 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {/* 날짜 & 제목 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">주보 날짜</label>
            <input
              type="date"
              value={form.bulletin_date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">제목 (자동 생성)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {([1, 2] as const).map((slot) => {
            const url = slot === 1 ? form.image_url_1 : form.image_url_2;
            const loading = slot === 1 ? uploading1 : uploading2;
            return (
              <div key={slot} className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">주보 이미지 {slot}</label>
                {url ? (
                  <div className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img src={url} alt={`주보 ${slot}`} className="w-full object-cover" />
                    <button
                      onClick={() => setField(slot === 1 ? "image_url_1" : "image_url_2", "")}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${loading ? "border-slate-200 bg-slate-50" : "border-slate-300 hover:border-[#1a2744] hover:bg-slate-50"} transition`}>
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <>
                        <span className="text-2xl text-slate-300">+</span>
                        <span className="mt-1 text-xs text-slate-400">클릭하여 업로드</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loading}
                      onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], slot)}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* Claude 분석 버튼 */}
        <button
          onClick={parse}
          disabled={parsing || !form.image_url_1}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {parsing ? "Claude가 주보를 읽는 중..." : "Claude로 주보 내용 자동 분석"}
        </button>

        {/* 내용 필드 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">예배 봉사</label>
            <textarea
              rows={6}
              value={form.worship_service}
              onChange={(e) => setField("worship_service", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
              placeholder="사회: 홍길동&#10;기도: 김철수&#10;..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">교회 소식</label>
            <textarea
              rows={6}
              value={form.church_news}
              onChange={(e) => setField("church_news", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
              placeholder="이번 주 교회 소식..."
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">함께 나누는 기도</label>
          <textarea
            rows={4}
            value={form.prayer_requests}
            onChange={(e) => setField("prayer_requests", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
            placeholder="기도 제목..."
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">주일말씀 노트</label>
          <textarea
            rows={5}
            value={form.sermon_notes}
            onChange={(e) => setField("sermon_notes", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
            placeholder="설교 제목, 본문, 내용..."
          />
        </div>

        {msg && (
          <p className={`rounded-lg px-3 py-2 text-sm ${msgType === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#1a2744] py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition"
          >
            {saving ? "저장 중..." : form.id ? "수정 저장" : "등록 (공지사항 자동 추가)"}
          </button>
          {form.id && (
            <button
              onClick={() => setForm(initForm())}
              className="rounded-lg border border-slate-200 px-4 text-sm text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          )}
        </div>
      </div>

      {/* 주보 목록 */}
      {items.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-600">
            등록된 주보
          </div>
          <ul className="divide-y divide-slate-100">
            {items.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {b.image_url_1 && (
                    <img src={b.image_url_1} alt="" className="h-10 w-10 rounded object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{b.title}</p>
                    <p className="text-xs text-slate-400">{b.bulletin_date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editItem(b)}
                    className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteItem(b.id!)}
                    className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-500 hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
